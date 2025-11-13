import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query, cache } from '../config/database';

// Get reels feed with pagination
export const getReels = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const userId = req.userId;

    // Try to get from cache first
    const cacheKey = `reels:feed:${page}:${limit}:${userId || 'anonymous'}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    const reelsQuery = `
      SELECT 
        r.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $3 AND reel_id = r.id) as is_liked` : 'false as is_liked'}
      FROM reels r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_active = true
      ORDER BY r.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const params = userId ? [limit, offset, userId] : [limit, offset];
    const result = await query(reelsQuery, params);

    const data = {
      reels: result.rows,
      pagination: {
        page,
        limit,
        total: result.rowCount,
        hasMore: result.rowCount === limit
      }
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, data, 300);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reels'
    });
  }
};

// Get single reel by ID
export const getReelById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const reelQuery = `
      SELECT 
        r.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $2 AND reel_id = r.id) as is_liked` : 'false as is_liked'}
      FROM reels r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1 AND r.is_active = true
    `;

    const params = userId ? [id, userId] : [id];
    const result = await query(reelQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get reel by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reel'
    });
  }
};

// Create new reel
export const createReel = async (req: AuthRequest, res: Response) => {
  try {
    const { video_url, thumbnail_url, caption, duration } = req.body;
    const userId = req.userId;

    if (!video_url) {
      return res.status(400).json({
        success: false,
        message: 'Video URL is required'
      });
    }

    const insertQuery = `
      INSERT INTO reels (user_id, video_url, thumbnail_url, caption, duration)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      userId,
      video_url,
      thumbnail_url,
      caption,
      duration
    ]);

    // Invalidate cache
    await cache.invalidatePattern('reels:feed:*');

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reel'
    });
  }
};

// Update reel
export const updateReel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { caption, thumbnail_url } = req.body;
    const userId = req.userId;

    // Check ownership
    const checkQuery = 'SELECT * FROM reels WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reel'
      });
    }

    const updateQuery = `
      UPDATE reels 
      SET caption = COALESCE($1, caption),
          thumbnail_url = COALESCE($2, thumbnail_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [caption, thumbnail_url, id]);

    // Invalidate cache
    await cache.invalidatePattern('reels:feed:*');
    await cache.del(`reel:${id}`);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reel'
    });
  }
};

// Delete reel (soft delete)
export const deleteReel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check ownership
    const checkQuery = 'SELECT * FROM reels WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reel'
      });
    }

    const deleteQuery = 'UPDATE reels SET is_active = false WHERE id = $1';
    await query(deleteQuery, [id]);

    // Invalidate cache
    await cache.invalidatePattern('reels:feed:*');
    await cache.del(`reel:${id}`);

    res.json({
      success: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error('Delete reel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reel'
    });
  }
};

// Increment views count
export const incrementViews = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updateQuery = 'UPDATE reels SET views_count = views_count + 1 WHERE id = $1 RETURNING views_count';
    const result = await query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    res.json({
      success: true,
      data: { views_count: result.rows[0].views_count }
    });
  } catch (error) {
    console.error('Increment views error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment views'
    });
  }
};

// Search reels
export const searchReels = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const userId = req.userId;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchQuery = `
      SELECT 
        r.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $4 AND reel_id = r.id) as is_liked` : 'false as is_liked'}
      FROM reels r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_active = true 
        AND (r.caption ILIKE $1 OR u.username ILIKE $1 OR u.full_name ILIKE $1)
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const searchPattern = `%${q}%`;
    const params = userId 
      ? [searchPattern, limit, offset, userId] 
      : [searchPattern, limit, offset];
    
    const result = await query(searchQuery, params);

    res.json({
      success: true,
      data: {
        reels: result.rows,
        pagination: {
          page,
          limit,
          total: result.rowCount,
          hasMore: result.rowCount === limit
        }
      }
    });
  } catch (error) {
    console.error('Search reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search reels'
    });
  }
};
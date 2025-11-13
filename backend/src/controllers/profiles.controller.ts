// ============= profiles.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    const profileQuery = `
      SELECT 
        u.id, u.username, u.email, u.full_name, u.avatar_url, u.bio, u.is_verified, u.created_at,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count,
        (SELECT COUNT(*) FROM reels WHERE user_id = u.id AND is_active = true) as reels_count,
        ${currentUserId ? `EXISTS(SELECT 1 FROM followers WHERE follower_id = $2 AND following_id = u.id) as is_following` : 'false as is_following'}
      FROM users u
      WHERE u.username = $1
    `;

    const params = currentUserId ? [username, currentUserId] : [username];
    const result = await query(profileQuery, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, bio, avatar_url } = req.body;
    const userId = req.userId;

    const updateQuery = `
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          bio = COALESCE($2, bio),
          avatar_url = COALESCE($3, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, username, email, full_name, avatar_url, bio, is_verified, created_at
    `;

    const result = await query(updateQuery, [full_name, bio, avatar_url, userId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const getUserReels = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const currentUserId = req.userId;

    const reelsQuery = `
      SELECT 
        r.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${currentUserId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $4 AND reel_id = r.id) as is_liked` : 'false as is_liked'}
      FROM reels r
      JOIN users u ON r.user_id = u.id
      WHERE u.username = $1 AND r.is_active = true
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const params = currentUserId ? [username, limit, offset, currentUserId] : [username, limit, offset];
    const result = await query(reelsQuery, params);

    res.json({
      success: true,
      data: {
        reels: result.rows,
        pagination: { page, limit, hasMore: result.rowCount === limit }
      }
    });
  } catch (error) {
    console.error('Get user reels error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user reels' });
  }
};

export const getFollowers = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;

    const followersQuery = `
      SELECT 
        u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      JOIN users target ON f.following_id = target.id
      WHERE target.username = $1
      ORDER BY f.created_at DESC
    `;

    const result = await query(followersQuery, [username]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch followers' });
  }
};

export const getFollowing = async (req: AuthRequest, res: Response) => {
  try {
    const { username } = req.params;

    const followingQuery = `
      SELECT 
        u.id, u.username, u.full_name, u.avatar_url, u.is_verified,
        f.created_at as followed_at
      FROM followers f
      JOIN users u ON f.following_id = u.id
      JOIN users follower ON f.follower_id = follower.id
      WHERE follower.username = $1
      ORDER BY f.created_at DESC
    `;

    const result = await query(followingQuery, [username]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch following' });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const searchQuery = `
      SELECT 
        id, username, full_name, avatar_url, bio, is_verified,
        (SELECT COUNT(*) FROM followers WHERE following_id = users.id) as followers_count
      FROM users
      WHERE username ILIKE $1 OR full_name ILIKE $1
      ORDER BY is_verified DESC, followers_count DESC
      LIMIT $2
    `;

    const searchPattern = `%${q}%`;
    const result = await query(searchQuery, [searchPattern, limit]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ success: false, message: 'Failed to search users' });
  }
};


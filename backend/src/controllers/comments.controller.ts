// ============= comments.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { io } from '../server';

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { reelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const userId = req.userId;

    const commentsQuery = `
      SELECT 
        c.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $4 AND comment_id = c.id) as is_liked` : 'false as is_liked'}
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.reel_id = $1 AND c.parent_comment_id IS NULL AND c.is_deleted = false
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const params = userId ? [reelId, limit, offset, userId] : [reelId, limit, offset];
    const result = await query(commentsQuery, params);

    res.json({
      success: true,
      data: {
        comments: result.rows,
        pagination: { page, limit, hasMore: result.rowCount === limit }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { reelId } = req.params;
    const { content, parent_comment_id } = req.body;
    const userId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const insertQuery = `
      INSERT INTO comments (reel_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(insertQuery, [reelId, userId, parent_comment_id, content]);
    const comment = result.rows[0];

    // Get user info
    const userQuery = 'SELECT username, full_name, avatar_url, is_verified FROM users WHERE id = $1';
    const userResult = await query(userQuery, [userId]);

    const commentData = { ...comment, ...userResult.rows[0], is_liked: false };

    // Emit real-time event
    io.to(`reel:${reelId}`).emit('new_comment', commentData);

    res.status(201).json({ success: true, data: commentData });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const checkQuery = 'SELECT * FROM comments WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateQuery = `
      UPDATE comments 
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [content, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const checkQuery = 'SELECT * FROM comments WHERE id = $1 AND user_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const deleteQuery = 'UPDATE comments SET is_deleted = true WHERE id = $1';
    await query(deleteQuery, [id]);

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

export const getReplies = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const repliesQuery = `
      SELECT 
        c.*,
        u.username, u.full_name, u.avatar_url, u.is_verified,
        ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = $2 AND comment_id = c.id) as is_liked` : 'false as is_liked'}
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = $1 AND c.is_deleted = false
      ORDER BY c.created_at ASC
    `;

    const params = userId ? [id, userId] : [id];
    const result = await query(repliesQuery, params);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch replies' });
  }
};
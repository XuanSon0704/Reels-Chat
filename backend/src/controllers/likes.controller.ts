// ============= likes.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { io } from '../server';


export const likeReel = async (req: AuthRequest, res: Response) => {
  try {
    const { reelId } = req.params;
    const userId = req.userId;

    const insertQuery = 'INSERT INTO likes (user_id, reel_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await query(insertQuery, [userId, reelId]);

    res.json({ success: true, message: 'Reel liked successfully' });
  } catch (error) {
    console.error('Like reel error:', error);
    res.status(500).json({ success: false, message: 'Failed to like reel' });
  }
};

export const unlikeReel = async (req: AuthRequest, res: Response) => {
  try {
    const { reelId } = req.params;
    const userId = req.userId;

    const deleteQuery = 'DELETE FROM likes WHERE user_id = $1 AND reel_id = $2';
    await query(deleteQuery, [userId, reelId]);

    res.json({ success: true, message: 'Reel unliked successfully' });
  } catch (error) {
    console.error('Unlike reel error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike reel' });
  }
};

export const likeComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const insertQuery = 'INSERT INTO likes (user_id, comment_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
    await query(insertQuery, [userId, commentId]);

    res.json({ success: true, message: 'Comment liked successfully' });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to like comment' });
  }
};

export const unlikeComment = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const deleteQuery = 'DELETE FROM likes WHERE user_id = $1 AND comment_id = $2';
    await query(deleteQuery, [userId, commentId]);

    res.json({ success: true, message: 'Comment unliked successfully' });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to unlike comment' });
  }
};

export const getReelLikes = async (req: AuthRequest, res: Response) => {
  try {
    const { reelId } = req.params;

    const likesQuery = `
      SELECT l.*, u.username, u.full_name, u.avatar_url, u.is_verified
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.reel_id = $1
      ORDER BY l.created_at DESC
    `;

    const result = await query(likesQuery, [reelId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get reel likes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch likes' });
  }
};
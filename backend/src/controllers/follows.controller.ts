// ============= follows.controller.ts =============
// ============= profiles.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export const follow = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    if (userId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const insertQuery = `
      INSERT INTO followers (follower_id, following_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `;

    await query(insertQuery, [userId, targetUserId]);

    res.json({ success: true, message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ success: false, message: 'Failed to follow user' });
  }
};

export const unfollow = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    const deleteQuery = 'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2';
    await query(deleteQuery, [userId, targetUserId]);

    res.json({ success: true, message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ success: false, message: 'Failed to unfollow user' });
  }
};

export const getFollowStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId: targetUserId } = req.params;
    const userId = req.userId;

    const statusQuery = `
      SELECT 
        EXISTS(SELECT 1 FROM followers WHERE follower_id = $1 AND following_id = $2) as is_following,
        EXISTS(SELECT 1 FROM followers WHERE follower_id = $2 AND following_id = $1) as follows_you
    `;

    const result = await query(statusQuery, [userId, targetUserId]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get follow status' });
  }
};
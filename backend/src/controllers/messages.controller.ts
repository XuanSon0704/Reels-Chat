// ============= messages.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { io } from '../server';

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Check if user is participant
    const participantQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;
    const participantResult = await query(participantQuery, [conversationId, userId]);

    if (participantResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messagesQuery = `
      SELECT 
        m.*,
        u.username, u.full_name, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1 AND m.is_deleted = false
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(messagesQuery, [conversationId, limit, offset]);

    res.json({
      success: true,
      data: {
        messages: result.rows.reverse(),
        pagination: { page, limit, hasMore: result.rowCount === limit }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversation_id, content, message_type, media_url, reel_id } = req.body;
    const userId = req.userId;

    // Check if user is participant
    const participantQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;
    const participantResult = await query(participantQuery, [conversation_id, userId]);

    if (participantResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const insertQuery = `
      INSERT INTO messages (conversation_id, sender_id, content, message_type, media_url, reel_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      conversation_id,
      userId,
      content,
      message_type || 'text',
      media_url,
      reel_id
    ]);

    const message = result.rows[0];

    // Get sender info
    const userQuery = 'SELECT username, full_name, avatar_url FROM users WHERE id = $1';
    const userResult = await query(userQuery, [userId]);

    const messageData = { ...message, ...userResult.rows[0] };

    // Emit real-time event to conversation room
    io.to(`conversation:${conversation_id}`).emit('new_message', messageData);

    res.status(201).json({ success: true, data: messageData });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

export const updateMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const checkQuery = 'SELECT * FROM messages WHERE id = $1 AND sender_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateQuery = `
      UPDATE messages 
      SET content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(updateQuery, [content, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ success: false, message: 'Failed to update message' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const checkQuery = 'SELECT * FROM messages WHERE id = $1 AND sender_id = $2';
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const deleteQuery = 'UPDATE messages SET is_deleted = true WHERE id = $1';
    await query(deleteQuery, [id]);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Get conversation_id from message
    const messageQuery = 'SELECT conversation_id FROM messages WHERE id = $1';
    const messageResult = await query(messageQuery, [id]);

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const conversationId = messageResult.rows[0].conversation_id;

    // Update last_read_at for user in conversation
    const updateQuery = `
      UPDATE conversation_participants 
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `;

    await query(updateQuery, [conversationId, userId]);

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

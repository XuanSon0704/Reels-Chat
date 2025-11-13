// ============= conversations.controller.ts =============
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const conversationsQuery = `
      SELECT 
        c.*,
        m.content as last_message_content,
        m.created_at as last_message_time,
        u.username as last_sender_username,
        u.full_name as last_sender_name,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE conversation_id = c.id 
            AND created_at > cp.last_read_at 
            AND sender_id != $1
        ) as unread_count
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      LEFT JOIN messages m ON c.last_message_id = m.id
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE cp.user_id = $1 AND cp.left_at IS NULL
      ORDER BY c.last_message_at DESC NULLS LAST
    `;

    const result = await query(conversationsQuery, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is participant
    const participantQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;
    const participantResult = await query(participantQuery, [id, userId]);

    if (participantResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const conversationQuery = `
      SELECT 
        c.*,
        json_agg(
          json_build_object(
            'id', u.id,
            'username', u.username,
            'full_name', u.full_name,
            'avatar_url', u.avatar_url,
            'is_verified', u.is_verified
          )
        ) as participants
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      INNER JOIN users u ON cp.user_id = u.id
      WHERE c.id = $1 AND cp.left_at IS NULL
      GROUP BY c.id
    `;

    const result = await query(conversationQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get conversation by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { type, participant_ids, name } = req.body;
    const userId = req.userId;

    if (!participant_ids || participant_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Participants are required' });
    }

    // For direct conversations, check if one already exists
    if (type === 'direct' && participant_ids.length === 1) {
      const existingQuery = `
        SELECT c.id
        FROM conversations c
        INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.type = 'direct'
          AND cp1.user_id = $1
          AND cp2.user_id = $2
          AND cp1.left_at IS NULL
          AND cp2.left_at IS NULL
        LIMIT 1
      `;

      const existingResult = await query(existingQuery, [userId, participant_ids[0]]);

      if (existingResult.rows.length > 0) {
        return res.json({
          success: true,
          data: { id: existingResult.rows[0].id },
          message: 'Conversation already exists'
        });
      }
    }

    // Create conversation
    const insertConvQuery = `
      INSERT INTO conversations (type, name)
      VALUES ($1, $2)
      RETURNING *
    `;

    const convResult = await query(insertConvQuery, [type || 'direct', name]);
    const conversation = convResult.rows[0];

    // Add current user as participant
    const insertParticipantQuery = `
      INSERT INTO conversation_participants (conversation_id, user_id, role)
      VALUES ($1, $2, $3)
    `;

    await query(insertParticipantQuery, [conversation.id, userId, 'admin']);

    // Add other participants
    for (const participantId of participant_ids) {
      await query(insertParticipantQuery, [conversation.id, participantId, 'member']);
    }

    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
};

export const updateConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, avatar_url } = req.body;
    const userId = req.userId;

    // Check if user is admin
    const adminQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2 AND role = 'admin'
    `;
    const adminResult = await query(adminQuery, [id, userId]);

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateQuery = `
      UPDATE conversations 
      SET name = COALESCE($1, name),
          avatar_url = COALESCE($2, avatar_url),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(updateQuery, [name, avatar_url, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to update conversation' });
  }
};

export const deleteConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is admin
    const adminQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2 AND role = 'admin'
    `;
    const adminResult = await query(adminQuery, [id, userId]);

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const deleteQuery = 'DELETE FROM conversations WHERE id = $1';
    await query(deleteQuery, [id]);

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete conversation' });
  }
};

export const addParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    const userId = req.userId;

    // Check if requester is participant
    const participantQuery = `
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;
    const participantResult = await query(participantQuery, [id, userId]);

    if (participantResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const insertQuery = `
      INSERT INTO conversation_participants (conversation_id, user_id, role)
      VALUES ($1, $2, 'member')
      ON CONFLICT (conversation_id, user_id) 
      DO UPDATE SET left_at = NULL
      RETURNING *
    `;

    const result = await query(insertQuery, [id, user_id]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({ success: false, message: 'Failed to add participant' });
  }
};

export const removeParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const userId = req.userId;

    // Check if user is admin or removing themselves
    const checkQuery = `
      SELECT role FROM conversation_participants 
      WHERE conversation_id = $1 AND user_id = $2
    `;
    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const isAdmin = checkResult.rows[0].role === 'admin';
    const isSelf = userId === targetUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateQuery = `
      UPDATE conversation_participants 
      SET left_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `;

    await query(updateQuery, [id, targetUserId]);
    res.json({ success: true, message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove participant' });
  }
};
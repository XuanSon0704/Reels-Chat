import { Server as SocketServer, Socket } from 'socket.io';
import { query } from '../config/database';

export const setupRealtimeHandlers = (io: SocketServer) => {
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected to real-time service`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle joining reel room for comments
    socket.on('join_reel', (reelId: string) => {
      socket.join(`reel:${reelId}`);
      console.log(`User ${userId} joined reel:${reelId}`);
    });

    // Handle leaving reel room
    socket.on('leave_reel', (reelId: string) => {
      socket.leave(`reel:${reelId}`);
      console.log(`User ${userId} left reel:${reelId}`);
    });

    // Handle joining conversation room for messages
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        // Verify user is participant
        const participantQuery = `
          SELECT 1 FROM conversation_participants 
          WHERE conversation_id = $1 AND user_id = $2 AND left_at IS NULL
        `;
        const result = await query(participantQuery, [conversationId, userId]);

        if (result.rows.length > 0) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${userId} joined conversation:${conversationId}`);

          // Notify others in conversation
          socket.to(`conversation:${conversationId}`).emit('user_joined', {
            userId,
            conversationId,
            timestamp: new Date().toISOString()
          });
        } else {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
      } catch (error) {
        console.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation:${conversationId}`);

      // Notify others in conversation
      socket.to(`conversation:${conversationId}`).emit('user_left', {
        userId,
        conversationId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle typing indicators for messages
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        username: socket.data.username,
        conversationId
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId,
        conversationId
      });
    });

    // Handle comment typing indicators
    socket.on('comment_typing_start', ({ reelId }) => {
      socket.to(`reel:${reelId}`).emit('comment_user_typing', {
        userId,
        username: socket.data.username,
        reelId
      });
    });

    socket.on('comment_typing_stop', ({ reelId }) => {
      socket.to(`reel:${reelId}`).emit('comment_user_stopped_typing', {
        userId,
        reelId
      });
    });

    // Handle online status
    socket.on('status_update', (status: 'online' | 'away' | 'offline') => {
      // Broadcast to user's followers
      io.to(`user:${userId}`).emit('user_status_changed', {
        userId,
        status,
        timestamp: new Date().toISOString()
      });
    });

    // Handle message read receipts
    socket.on('message_read', async ({ messageId, conversationId }) => {
      try {
        // Update last_read_at
        const updateQuery = `
          UPDATE conversation_participants 
          SET last_read_at = CURRENT_TIMESTAMP
          WHERE conversation_id = $1 AND user_id = $2
        `;
        await query(updateQuery, [conversationId, userId]);

        // Notify sender
        socket.to(`conversation:${conversationId}`).emit('message_read_receipt', {
          messageId,
          conversationId,
          readBy: userId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle like notifications in real-time
    socket.on('like_notification', ({ targetUserId, type, contentId }) => {
      io.to(`user:${targetUserId}`).emit('new_like', {
        fromUserId: userId,
        fromUsername: socket.data.username,
        type, // 'reel' or 'comment'
        contentId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle comment notifications in real-time
    socket.on('comment_notification', ({ targetUserId, reelId, commentId }) => {
      io.to(`user:${targetUserId}`).emit('new_comment', {
        fromUserId: userId,
        fromUsername: socket.data.username,
        reelId,
        commentId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle follow notifications in real-time
    socket.on('follow_notification', ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('new_follower', {
        followerId: userId,
        followerUsername: socket.data.username,
        timestamp: new Date().toISOString()
      });
    });

    // Handle video call signaling
    socket.on('call_initiate', ({ targetUserId, offer }) => {
      io.to(`user:${targetUserId}`).emit('incoming_call', {
        callerId: userId,
        callerUsername: socket.data.username,
        offer
      });
    });

    socket.on('call_answer', ({ targetUserId, answer }) => {
      io.to(`user:${targetUserId}`).emit('call_answered', {
        answer
      });
    });

    socket.on('call_ice_candidate', ({ targetUserId, candidate }) => {
      io.to(`user:${targetUserId}`).emit('call_ice_candidate', {
        candidate
      });
    });

    socket.on('call_end', ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('call_ended', {
        userId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from real-time service`);
      
      // Broadcast offline status
      io.to(`user:${userId}`).emit('user_status_changed', {
        userId,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });
};

// Helper function to send notification to specific user
export const sendNotificationToUser = (io: SocketServer, userId: string, notification: any) => {
  io.to(`user:${userId}`).emit('notification', notification);
};

// Helper function to broadcast to conversation
export const broadcastToConversation = (io: SocketServer, conversationId: string, event: string, data: any) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

// Helper function to broadcast to reel viewers
export const broadcastToReel = (io: SocketServer, reelId: string, event: string, data: any) => {
  io.to(`reel:${reelId}`).emit(event, data);
};
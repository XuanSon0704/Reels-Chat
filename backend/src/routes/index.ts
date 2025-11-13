import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import * as authController from '../controllers/auth.controller';
import * as reelsController from '../controllers/reels.controller';
import * as commentsController from '../controllers/comments.controller';
import * as likesController from '../controllers/likes.controller';
import * as messagesController from '../controllers/messages.controller';
import * as conversationsController from '../controllers/conversations.controller';
import * as profilesController from '../controllers/profiles.controller';
import * as followsController from '../controllers/follows.controller';

const router = Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getMe);
router.post('/auth/refresh', authController.refreshToken);

// Reels routes
router.get('/reels', optionalAuthenticate, reelsController.getReels);
router.get('/reels/:id', optionalAuthenticate, reelsController.getReelById);
router.post('/reels', authenticate, reelsController.createReel);
router.put('/reels/:id', authenticate, reelsController.updateReel);
router.delete('/reels/:id', authenticate, reelsController.deleteReel);
router.post('/reels/:id/view', optionalAuthenticate, reelsController.incrementViews);

// Comments routes
router.get('/reels/:reelId/comments', commentsController.getComments);
router.post('/reels/:reelId/comments', authenticate, commentsController.createComment);
router.put('/comments/:id', authenticate, commentsController.updateComment);
router.delete('/comments/:id', authenticate, commentsController.deleteComment);
router.get('/comments/:id/replies', commentsController.getReplies);

// Likes routes
router.post('/reels/:reelId/like', authenticate, likesController.likeReel);
router.delete('/reels/:reelId/like', authenticate, likesController.unlikeReel);
router.post('/comments/:commentId/like', authenticate, likesController.likeComment);
router.delete('/comments/:commentId/like', authenticate, likesController.unlikeComment);
router.get('/reels/:reelId/likes', likesController.getReelLikes);

// Messages routes
router.get('/messages/:conversationId', authenticate, messagesController.getMessages);
router.post('/messages', authenticate, messagesController.sendMessage);
router.put('/messages/:id', authenticate, messagesController.updateMessage);
router.delete('/messages/:id', authenticate, messagesController.deleteMessage);
router.post('/messages/:id/read', authenticate, messagesController.markAsRead);

// Conversations routes
router.get('/conversations', authenticate, conversationsController.getConversations);
router.get('/conversations/:id', authenticate, conversationsController.getConversationById);
router.post('/conversations', authenticate, conversationsController.createConversation);
router.put('/conversations/:id', authenticate, conversationsController.updateConversation);
router.delete('/conversations/:id', authenticate, conversationsController.deleteConversation);
router.post('/conversations/:id/participants', authenticate, conversationsController.addParticipant);
router.delete('/conversations/:id/participants/:userId', authenticate, conversationsController.removeParticipant);

// Profile routes
router.get('/profiles/:username', optionalAuthenticate, profilesController.getProfile);
router.put('/profiles', authenticate, profilesController.updateProfile);
router.get('/profiles/:username/reels', optionalAuthenticate, profilesController.getUserReels);
router.get('/profiles/:username/followers', profilesController.getFollowers);
router.get('/profiles/:username/following', profilesController.getFollowing);

// Follow routes
router.post('/follow/:userId', authenticate, followsController.follow);
router.delete('/follow/:userId', authenticate, followsController.unfollow);
router.get('/follow/:userId/status', authenticate, followsController.getFollowStatus);

// Search routes
router.get('/search/users', optionalAuthenticate, profilesController.searchUsers);
router.get('/search/reels', optionalAuthenticate, reelsController.searchReels);

export default router;
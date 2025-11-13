import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Error formatter
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must not exceed 100 characters'),
  handleValidationErrors
];

export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Reel validations
export const createReelValidation = [
  body('video_url')
    .trim()
    .notEmpty()
    .withMessage('Video URL is required')
    .isURL()
    .withMessage('Invalid video URL'),
  body('thumbnail_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid thumbnail URL'),
  body('caption')
    .optional()
    .trim()
    .isLength({ max: 2200 })
    .withMessage('Caption must not exceed 2200 characters'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 seconds'),
  handleValidationErrors
];

export const updateReelValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid reel ID'),
  body('caption')
    .optional()
    .trim()
    .isLength({ max: 2200 })
    .withMessage('Caption must not exceed 2200 characters'),
  body('thumbnail_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid thumbnail URL'),
  handleValidationErrors
];

// Comment validations
export const createCommentValidation = [
  param('reelId')
    .isUUID()
    .withMessage('Invalid reel ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  body('parent_comment_id')
    .optional()
    .isUUID()
    .withMessage('Invalid parent comment ID'),
  handleValidationErrors
];

export const updateCommentValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid comment ID'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  handleValidationErrors
];

// Message validations
export const sendMessageValidation = [
  body('conversation_id')
    .isUUID()
    .withMessage('Invalid conversation ID'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Message content must not exceed 5000 characters'),
  body('message_type')
    .optional()
    .isIn(['text', 'image', 'video', 'reel'])
    .withMessage('Invalid message type'),
  body('media_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid media URL'),
  body('reel_id')
    .optional()
    .isUUID()
    .withMessage('Invalid reel ID'),
  handleValidationErrors
];

// Conversation validations
export const createConversationValidation = [
  body('type')
    .optional()
    .isIn(['direct', 'group'])
    .withMessage('Type must be either direct or group'),
  body('participant_ids')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participant_ids.*')
    .isUUID()
    .withMessage('Invalid participant ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name must not exceed 100 characters'),
  handleValidationErrors
];

// Profile validations
export const updateProfileValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must not exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('avatar_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid avatar URL'),
  handleValidationErrors
];

// Pagination validations
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// UUID parameter validation
export const uuidParamValidation = (paramName: string = 'id') => [
  param(paramName)
    .isUUID()
    .withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

// Search validation
export const searchValidation = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors
];
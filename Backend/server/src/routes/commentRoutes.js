import express from 'express';
import { body } from 'express-validator';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment
} from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/error.js';

const router = express.Router();

// Validation rules
const createCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Comment must be between 1 and 200 characters')
];

const updateCommentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Comment must be between 1 and 200 characters')
];

// Routes
router.post('/posts/:postId/comments', protect, validate(createCommentValidation), createComment);
router.get('/posts/:postId/comments', protect, getComments);
router.put('/comments/:commentId', protect, validate(updateCommentValidation), updateComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.post('/comments/:commentId/like', protect, likeComment);

export default router;
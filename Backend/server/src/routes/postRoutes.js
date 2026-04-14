import express from 'express';
import { body } from 'express-validator';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  sharePost
} from '../controllers/postController.js';
import { protect } from '../middlewares/auth.js';
import { uploadMultiple } from '../middlewares/upload.js';
import { validate } from '../middlewares/error.js';

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('content')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Tags cannot exceed 100 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Visibility must be public, followers, or private')
];

const updatePostValidation = [
  body('content')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Content cannot exceed 500 characters'),
  body('tags')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Tags cannot exceed 100 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('visibility')
    .optional()
    .isIn(['public', 'followers', 'private'])
    .withMessage('Visibility must be public, followers, or private')
];

// Routes
router.post('/', protect, uploadMultiple('media', 10), validate(createPostValidation), createPost);
router.get('/', protect, getPosts);
router.get('/:id', getPostById);
router.put('/:id', protect, validate(updatePostValidation), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/share', protect, sharePost);

export default router;
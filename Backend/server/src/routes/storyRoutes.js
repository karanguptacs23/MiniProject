import express from 'express';
import {
  createStory,
  getStories,
  getUserStories,
  viewStory,
  deleteStory,
  likeStory
} from '../controllers/storyController.js';
import { protect } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

// Routes
router.post('/', protect, uploadSingle('media'), createStory);
router.get('/', protect, getStories);
router.get('/user/:userId', getUserStories);
router.post('/:storyId/view', protect, viewStory);
router.post('/:storyId/like', protect, likeStory);
router.delete('/:storyId', protect, deleteStory);

export default router;

import express from 'express';
import {
  getUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateProfile,
  getCurrentUser
} from '../controllers/userController.js';
import { protect } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, uploadSingle('profilePicture'), updateProfile);

// Public routes
router.get('/profile/:username', getUserProfile);
router.get('/search', searchUsers);
router.post('/follow/:userId', protect, followUser);
router.delete('/follow/:userId', protect, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

export default router;
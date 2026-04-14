import express from 'express';
import {
  uploadProfilePicture,
  uploadCoverPicture,
  deleteProfilePicture,
  deleteCoverPicture
} from '../controllers/uploadController.js';
import { protect } from '../middlewares/auth.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.post('/profile-picture', uploadSingle('profilePicture'), uploadProfilePicture);
router.post('/cover-picture', uploadSingle('coverPicture'), uploadCoverPicture);
router.delete('/profile-picture', deleteProfilePicture);
router.delete('/cover-picture', deleteCoverPicture);

export default router;
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user profile picture
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const uploadCoverPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old cover picture if exists
    if (user.coverPicture) {
      const oldPath = path.join(__dirname, '../uploads', path.basename(user.coverPicture));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update user cover picture
    user.coverPicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: 'Cover picture uploaded successfully',
      data: {
        coverPicture: user.coverPicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to delete'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', path.basename(user.profilePicture));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from user
    user.profilePicture = '';
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const deleteCoverPicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.coverPicture) {
      return res.status(400).json({
        success: false,
        message: 'No cover picture to delete'
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../uploads', path.basename(user.coverPicture));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from user
    user.coverPicture = '';
    await user.save();

    res.json({
      success: true,
      message: 'Cover picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};
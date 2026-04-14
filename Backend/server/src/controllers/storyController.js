import Story from '../models/Story.js';
import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new story
export const createStory = async (req, res) => {
  try {
    console.log('Story upload attempt:');
    console.log('- User ID:', req.user?._id);
    console.log('- File:', req.file ? `${req.file.filename} (${req.file.size} bytes)` : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const type = req.file.mimetype.startsWith('image/') ? 'image' : 'video';

    const story = await Story.create({
      user: req.user._id,
      media: {
        type,
        url: `/uploads/${req.file.filename}`,
        publicId: req.file.filename
      }
    });

    await story.populate('user', 'username fullName profilePicture');

    console.log('Story created successfully:', story._id);

    res.status(201).json({
      success: true,
      message: 'Story uploaded successfully',
      data: story
    });
  } catch (error) {
    console.error('Story creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get stories (for logged-in user's following + own)
export const getStories = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('following');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userIds = [...(user.following || []), req.user._id];

    const stories = await Story.find({
      user: { $in: userIds },
      isDeleted: false
    })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    // Group stories by user with most recent first
    const groupedStories = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: []
        };
      }
      groupedStories[userId].stories.push(story);
    });

    // Convert to array and format
    const formattedStories = Object.values(groupedStories).map(group => ({
      userId: group.user._id,
      username: group.user.username,
      fullName: group.user.fullName,
      profilePicture: group.user.profilePicture,
      storyItems: group.stories.map(s => ({
        id: s._id,
        media: s.media,
        createdAt: s.createdAt,
        viewCount: s.viewedBy.length,
        seen: s.viewedBy.some(v => v.user.toString() === req.user._id.toString())
      }))
    }));

    res.json({
      success: true,
      data: formattedStories
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's own stories
export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.find({
      user: userId,
      isDeleted: false
    })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark story as viewed
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findByIdAndUpdate(
      storyId,
      {
        $addToSet: {
          viewedBy: {
            user: req.user._id,
            viewedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('user', 'username fullName profilePicture');

    res.json({
      success: true,
      message: 'Story view recorded',
      data: story
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check ownership
    if (story.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Delete file from server
    if (story.media?.publicId) {
      const filePath = path.join(__dirname, '../uploads', story.media.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Story.findByIdAndUpdate(storyId, { isDeleted: true });

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Like/Unlike story
export const likeStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      isDeleted: false
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if already liked
    const existingLike = story.likes.find(like => like.user.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      story.likes = story.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      story.likes.push({ user: req.user._id });
    }

    await story.save();

    res.json({
      success: true,
      message: existingLike ? 'Story unliked' : 'Story liked',
      data: {
        likeCount: story.likes.length,
        isLiked: !existingLike
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

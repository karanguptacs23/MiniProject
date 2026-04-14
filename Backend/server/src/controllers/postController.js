import Post from '../models/Post.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import { validationResult } from 'express-validator';

export const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, tags, location, visibility = 'public' } = req.body;
    const media = [];

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
        media.push({
          type,
          url: `/uploads/${file.filename}`,
          publicId: file.filename
        });
      });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content || '',
      media,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      location: location || '',
      visibility
    });

    // Add post to user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { posts: post._id }
    });

    await post.populate('user', 'username fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    const skip = (page - 1) * limit;

    let query = { isDeleted: false };

    if (userId) {
      query.user = userId;
    } else {
      // Get posts from users the current user follows + their own posts
      const following = await User.findById(req.user._id).select('following');
      query.$or = [
        { user: req.user._id },
        { user: { $in: following.following }, visibility: 'public' },
        { user: { $in: following.following }, visibility: 'followers' }
      ];
    }

    const posts = await Post.find(query)
      .populate('user', 'username fullName profilePicture')
      .populate({
        path: 'comments',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 }, limit: 3 },
        populate: {
          path: 'user',
          select: 'username fullName profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Add like status for current user
    const postsWithLikeStatus = posts.map(post => {
      const isLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());
      return {
        ...post.toObject(),
        isLiked
      };
    });

    res.json({
      success: true,
      data: postsWithLikeStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
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

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    })
    .populate('user', 'username fullName profilePicture')
    .populate({
      path: 'comments',
      match: { isDeleted: false },
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'user',
        select: 'username fullName profilePicture'
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check visibility permissions
    if (post.visibility === 'private' && post.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This post is private'
      });
    }

    const isLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());

    res.json({
      success: true,
      data: {
        ...post.toObject(),
        isLiked
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

export const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, tags, location, visibility } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Update fields
    if (content !== undefined) post.content = content;
    if (tags) post.tags = tags.split(',').map(tag => tag.trim());
    if (location !== undefined) post.location = location;
    if (visibility) post.visibility = visibility;

    await post.save();
    await post.populate('user', 'username fullName profilePicture');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    // Remove from user's posts array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { posts: post._id }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already liked
    const existingLike = post.likes.find(like => like.user.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      data: {
        likeCount: post.likes.length,
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

export const sharePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already shared
    const existingShare = post.shares.find(share => share.user.toString() === req.user._id.toString());

    if (existingShare) {
      return res.status(400).json({
        success: false,
        message: 'Post already shared'
      });
    }

    post.shares.push({ user: req.user._id });
    await post.save();

    res.json({
      success: true,
      message: 'Post shared successfully',
      data: {
        shareCount: post.shares.length
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
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { validationResult } from 'express-validator';

export const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, parentCommentId } = req.body;
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findOne({
        _id: parentCommentId,
        post: postId,
        isDeleted: false
      });
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }

    const comment = await Comment.create({
      user: req.user._id,
      post: postId,
      content,
      parentComment: parentCommentId || null
    });

    // Add to post's comments array
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // If it's a reply, add to parent comment's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    await comment.populate('user', 'username fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20, parentCommentId } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      post: postId,
      isDeleted: false
    };

    if (parentCommentId) {
      query.parentComment = parentCommentId;
    } else {
      query.parentComment = null; // Only top-level comments
    }

    const comments = await Comment.find(query)
      .populate('user', 'username fullName profilePicture')
      .populate({
        path: 'replies',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 }, limit: 5 },
        populate: {
          path: 'user',
          select: 'username fullName profilePicture'
        }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Add like status for current user
    const commentsWithLikeStatus = comments.map(comment => {
      const isLiked = comment.likes.some(like => like.user.toString() === req.user._id.toString());
      return {
        ...comment.toObject(),
        isLiked
      };
    });

    res.json({
      success: true,
      data: commentsWithLikeStatus,
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

export const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content } = req.body;

    const comment = await Comment.findOne({
      _id: req.params.commentId,
      user: req.user._id,
      isDeleted: false
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.content = content;
    await comment.save();

    await comment.populate('user', 'username fullName profilePicture');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      user: req.user._id,
      isDeleted: false
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    // Remove from post's comments array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    // If it's a reply, remove from parent comment's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      _id: req.params.commentId,
      isDeleted: false
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if already liked
    const existingLike = comment.likes.find(like => like.user.toString() === req.user._id.toString());

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.user.toString() !== req.user._id.toString());
    } else {
      // Like
      comment.likes.push({ user: req.user._id });
    }

    await comment.save();

    res.json({
      success: true,
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      data: {
        likeCount: comment.likes.length,
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
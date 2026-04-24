import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate('followers', 'username fullName profilePicture')
      .populate('following', 'username fullName profilePicture')
      .populate({
        path: 'posts',
        match: { isDeleted: false },
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'username fullName profilePicture'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    let followStatus = null;

    if (req.user) {
      const follow = await Follow.findOne({
        follower: req.user._id,
        following: user._id
      });
      isFollowing = !!follow;
      followStatus = follow ? follow.status : null;
    }

    // If profile is private and not following, hide posts
    if (user.isPrivate && !isFollowing && req.user._id.toString() !== user._id.toString()) {
      user.posts = [];
    }

    res.json({
      success: true,
      data: {
        user,
        isFollowing,
        followStatus
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

export const searchUsers = async (req, res) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (page - 1) * limit;

    const users = await User.find({
      $and: [
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { fullName: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } } // Exclude current user
      ]
    })
    .select('username fullName profilePicture bio followers following')
    .limit(parseInt(limit))
    .skip(skip)
    .sort({ followers: -1 }); // Sort by follower count

    // Add follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        const follow = await Follow.findOne({
          follower: req.user._id,
          following: user._id
        });

        return {
          ...user.toObject(),
          isFollowing: !!follow,
          followStatus: follow ? follow.status : null
        };
      })
    );

    res.json({
      success: true,
      data: usersWithFollowStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await User.countDocuments({
          $and: [
            {
              $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } }
              ]
            },
            { _id: { $ne: req.user._id } }
          ]
        })
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

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: req.user._id,
      following: userId,
      status: userToFollow.isPrivate ? 'pending' : 'accepted'
    });

    // Update user's followers/following arrays
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: userToFollow.isPrivate ? 'Follow request sent' : 'User followed successfully',
      data: follow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: userId
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Update user's followers/following arrays
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: req.user._id }
    });

    res.json({
      success: true,
      message: 'User unfollowed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const followers = await Follow.find({ following: userId, status: 'accepted' })
      .populate('follower', 'username fullName profilePicture bio')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: followers.map(f => ({
        ...f.follower.toObject(),
        followedAt: f.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const following = await Follow.find({ follower: userId, status: 'accepted' })
      .populate('following', 'username fullName profilePicture bio')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: following.map(f => ({
        ...f.following.toObject(),
        followedAt: f.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, website } = req.body;
    const userId = req.user._id;

    // Check if new username is unique (if username is being changed)
    if (username) {
      const existingUser = await User.findOne({ 
        username,
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Handle profile picture upload
    let profilePictureUrl = undefined;
    if (req.file) {
      profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    // Build update object
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (profilePictureUrl) updateData.profilePicture = profilePictureUrl;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      /* error removed for security */
    });
  }
};
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get all users
// @route   GET /users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().select('-password').skip(skip).limit(limit);

  sendResponse(res, 200, true, 'Users retrieved successfully', {
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users
  });
});

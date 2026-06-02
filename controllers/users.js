const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');
const queryFeatures = require('../utils/queryFeatures');

// @desc    Get all users
// @route   GET /users
// @access  Public
exports.getUsers = asyncHandler(async (req, res, next) => {
  const { results, pagination } = await queryFeatures(User, req.query);

  sendResponse(res, 200, true, 'Users retrieved successfully', {
    count: results.length,
    pagination,
    users: results
  });
});

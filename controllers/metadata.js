const Review = require('../models/Review');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get ratings data (distribution)
// @route   GET /ratings
// @access  Public
exports.getRatings = asyncHandler(async (req, res, next) => {
  const distribution = await Review.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  sendResponse(res, 200, true, 'Ratings distribution retrieved', { distribution });
});

// @desc    Get verified reviews
// @route   GET /verified
// @access  Public
exports.getVerified = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ isDeleted: false, verifiedPurchase: true })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, 'Verified reviews retrieved', {
    count: reviews.length,
    reviews
  });
});

const Review = require('../models/Review');
const User = require('../models/User');
const Country = require('../models/Country');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get admin dashboard stats
// @route   GET /admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalCountries = await Country.countDocuments();
  
  // Total active and soft-deleted reviews
  const totalReviews = await Review.countDocuments();
  const activeReviews = await Review.countDocuments({ isDeleted: false });
  const softDeletedReviews = await Review.countDocuments({ isDeleted: true });

  sendResponse(res, 200, true, 'Admin dashboard statistics retrieved successfully', {
    usersCount: totalUsers,
    countriesCount: totalCountries,
    reviews: {
      total: totalReviews,
      active: activeReviews,
      softDeleted: softDeletedReviews
    }
  });
});

// @desc    Get all reviews including soft-deleted ones for auditing
// @route   GET /admin/reviews
// @access  Private/Admin
exports.getAdminReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Review.countDocuments();
  const reviews = await Review.find()
    .populate('user', 'name email role')
    .populate('country', 'name code')
    .skip(skip)
    .limit(limit);

  sendResponse(res, 200, true, 'All reviews (including soft-deleted) retrieved for admin audit', {
    count: reviews.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    reviews
  });
});

// @desc    Restore a soft-deleted review
// @route   PUT /admin/reviews/:reviewID/restore
// @access  Private/Admin
exports.restoreReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ reviewID: req.params.reviewID });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.reviewID}`, 404));
  }

  if (!review.isDeleted) {
    return next(new ErrorResponse(`Review is already active`, 400));
  }

  review.isDeleted = false;
  await review.save();

  sendResponse(res, 200, true, 'Review restored successfully', review);
});

// @desc    Permanently delete a review (Hard Delete)
// @route   DELETE /admin/reviews/:reviewID/hard
// @access  Private/Admin
exports.hardDeleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ reviewID: req.params.reviewID });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.reviewID}`, 404));
  }

  await Review.deleteOne({ reviewID: req.params.reviewID });

  sendResponse(res, 200, true, 'Review permanently hard-deleted from database', {});
});

const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc      Get all reviews
// @route     GET /reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  // We exclude soft-deleted reviews
  const reviews = await Review.find({ isDeleted: false })
    .populate('user', 'name profile')
    .populate('country', 'name code');

  sendResponse(res, 200, true, 'Reviews retrieved successfully', {
    count: reviews.length,
    reviews
  });
});

// @desc      Get single review
// @route     GET /reviews/:reviewID
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  // Find by reviewID (which is a string like "R26GJW65W9X4OB" or customized)
  const review = await Review.findOne({ reviewID: req.params.reviewID, isDeleted: false })
    .populate('user', 'name profile')
    .populate('country', 'name code');

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.reviewID}`, 404));
  }

  sendResponse(res, 200, true, 'Review retrieved successfully', review);
});

// @desc      Delete review (Soft Delete)
// @route     DELETE /reviews/:reviewID
// @access    Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ reviewID: req.params.reviewID, isDeleted: false });

  if (!review) {
    return next(new ErrorResponse(`Review not found with ID of ${req.params.reviewID}`, 404));
  }

  // Soft delete
  review.isDeleted = true;
  await review.save();

  sendResponse(res, 200, true, 'Review deleted successfully (soft delete)', {});
});

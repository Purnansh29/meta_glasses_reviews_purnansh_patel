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

// @desc      Create new review
// @route     POST /reviews
// @access    Public
exports.createReview = asyncHandler(async (req, res, next) => {
  const { reviewID, user, country, date, verifiedPurchase, rating, helpful, title, review, reviewImage, deviceName } = req.body;

  if (!reviewID || !rating || !title || !review || !deviceName) {
    return next(new ErrorResponse('Please provide reviewID, rating, title, review, and deviceName', 400));
  }

  const User = require('../models/User');
  const Country = require('../models/Country');

  const userDoc = await User.findOne({ name: user });
  if (!userDoc) return next(new ErrorResponse(`User '${user}' not found`, 404));

  const countryDoc = await Country.findOne({ name: country });
  if (!countryDoc) return next(new ErrorResponse(`Country '${country}' not found`, 404));

  const newReview = await Review.create({
    reviewID,
    user: userDoc._id,
    country: countryDoc._id,
    date: date || new Date(),
    verifiedPurchase: verifiedPurchase !== undefined ? verifiedPurchase : true,
    rating: parseFloat(rating),
    helpful: parseInt(helpful) || 0,
    title,
    review,
    reviewImage: reviewImage || '',
    is_positive_review: parseFloat(rating) >= 4,
    deviceName
  });

  sendResponse(res, 201, true, 'Review created successfully', newReview);
});

// @desc      Replace complete review (PUT)
// @route     PUT /reviews/:reviewID
// @access    Public
exports.replaceReview = asyncHandler(async (req, res, next) => {
  const existing = await Review.findOne({ reviewID: req.params.reviewID, isDeleted: false });
  if (!existing) return next(new ErrorResponse(`Review not found: ${req.params.reviewID}`, 404));

  const { rating, title, review, verifiedPurchase, helpful, reviewImage, deviceName } = req.body;

  if (!rating || !title || !review || !deviceName) {
    return next(new ErrorResponse('PUT requires rating, title, review, and deviceName', 400));
  }

  existing.rating = parseFloat(rating);
  existing.title = title;
  existing.review = review;
  existing.verifiedPurchase = verifiedPurchase !== undefined ? verifiedPurchase : existing.verifiedPurchase;
  existing.helpful = parseInt(helpful) || existing.helpful;
  existing.reviewImage = reviewImage !== undefined ? reviewImage : existing.reviewImage;
  existing.deviceName = deviceName;
  existing.is_positive_review = parseFloat(rating) >= 4;

  await existing.save();
  sendResponse(res, 200, true, 'Review replaced successfully', existing);
});

// @desc      Update review rating (PATCH)
// @route     PATCH /reviews/:reviewID/rating
// @access    Public
exports.updateRating = asyncHandler(async (req, res, next) => {
  const { rating } = req.body;

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    return next(new ErrorResponse('Please provide a valid rating between 1 and 5', 400));
  }

  const review = await Review.findOne({ reviewID: req.params.reviewID, isDeleted: false });
  if (!review) return next(new ErrorResponse(`Review not found: ${req.params.reviewID}`, 404));

  review.rating = parseFloat(rating);
  review.is_positive_review = parseFloat(rating) >= 4;
  await review.save();

  sendResponse(res, 200, true, 'Review rating updated successfully', review);
});

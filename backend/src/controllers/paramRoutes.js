const Review = require('../models/Review');
const User = require('../models/User');
const Country = require('../models/Country');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get reviews by user name
// @route   GET /users/:name/reviews
// @access  Public
exports.getReviewsByUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ name: new RegExp(`^${req.params.name}$`, 'i') });
  if (!user) return next(new ErrorResponse(`User '${req.params.name}' not found`, 404));

  const reviews = await Review.find({ user: user._id, isDeleted: false })
    .populate('user', 'name profile')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews by user '${user.name}'`, { count: reviews.length, reviews });
});

// @desc    Get reviews by country
// @route   GET /country/:country/reviews
// @access  Public
exports.getReviewsByCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.findOne({ name: new RegExp(req.params.country, 'i') });
  if (!country) return next(new ErrorResponse(`Country '${req.params.country}' not found`, 404));

  const reviews = await Review.find({ country: country._id, isDeleted: false })
    .populate('user', 'name profile')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews from '${country.name}'`, { count: reviews.length, reviews });
});

// @desc    Get verified or unverified reviews
// @route   GET /verified/:status
// @access  Public
exports.getVerifiedByStatus = asyncHandler(async (req, res, next) => {
  const status = req.params.status === 'true';
  const reviews = await Review.find({ isDeleted: false, verifiedPurchase: status })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Verified=${status} reviews`, { count: reviews.length, reviews });
});

// @desc    Get reviews by rating value
// @route   GET /ratings/:rating
// @access  Public
exports.getReviewsByRating = asyncHandler(async (req, res, next) => {
  const rating = parseFloat(req.params.rating);
  if (isNaN(rating)) return next(new ErrorResponse('Invalid rating value', 400));

  const reviews = await Review.find({ isDeleted: false, rating })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews with rating ${rating}`, { count: reviews.length, reviews });
});

// @desc    Get reviews filtered by country AND rating
// @route   GET /reviews/country/:country/rating/:rating
// @access  Public
exports.getCountryReviewsByRating = asyncHandler(async (req, res, next) => {
  const country = await Country.findOne({ name: new RegExp(req.params.country, 'i') });
  if (!country) return next(new ErrorResponse(`Country '${req.params.country}' not found`, 404));

  const rating = parseFloat(req.params.rating);
  const reviews = await Review.find({ country: country._id, rating, isDeleted: false })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `${country.name} reviews with rating ${rating}`, { count: reviews.length, reviews });
});

// @desc    Get reviews filtered by user AND rating
// @route   GET /reviews/user/:name/rating/:rating
// @access  Public
exports.getUserReviewsByRating = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ name: new RegExp(`^${req.params.name}$`, 'i') });
  if (!user) return next(new ErrorResponse(`User '${req.params.name}' not found`, 404));

  const rating = parseFloat(req.params.rating);
  const reviews = await Review.find({ user: user._id, rating, isDeleted: false })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews by ${user.name} with rating ${rating}`, { count: reviews.length, reviews });
});

// @desc    Get verified reviews by country
// @route   GET /reviews/country/:country/verified/:status
// @access  Public
exports.getVerifiedCountryReviews = asyncHandler(async (req, res, next) => {
  const country = await Country.findOne({ name: new RegExp(req.params.country, 'i') });
  if (!country) return next(new ErrorResponse(`Country '${req.params.country}' not found`, 404));

  const status = req.params.status === 'true';
  const reviews = await Review.find({ country: country._id, verifiedPurchase: status, isDeleted: false })
    .populate('user', 'name')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Verified=${status} reviews from ${country.name}`, { count: reviews.length, reviews });
});

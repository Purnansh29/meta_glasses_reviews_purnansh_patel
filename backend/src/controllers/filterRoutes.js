const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get reviews by title (partial match)
// @route   GET /reviews/title/:title
// @access  Public
exports.getByTitle = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({
    isDeleted: false,
    title: new RegExp(req.params.title, 'i')
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews matching title '${req.params.title}'`, { count: reviews.length, reviews });
});

// @desc    Get reviews by date (exact)
// @route   GET /reviews/date/:date  (format: YYYY-MM-DD)
// @access  Public
exports.getByDate = asyncHandler(async (req, res, next) => {
  const start = new Date(req.params.date);
  if (isNaN(start)) return next(new ErrorResponse('Invalid date format. Use YYYY-MM-DD', 400));

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const reviews = await Review.find({
    isDeleted: false,
    date: { $gte: start, $lt: end }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews on ${req.params.date}`, { count: reviews.length, reviews });
});

// @desc    Get reviews by helpful count
// @route   GET /reviews/helpful/:count
// @access  Public
exports.getByHelpfulCount = asyncHandler(async (req, res, next) => {
  const count = parseInt(req.params.count);
  if (isNaN(count)) return next(new ErrorResponse('Invalid helpful count', 400));

  const reviews = await Review.find({
    isDeleted: false,
    helpful: { $gte: count }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews with helpful >= ${count}`, { count: reviews.length, reviews });
});

// @desc    Get positive or negative reviews
// @route   GET /reviews/positive/:status
// @access  Public
exports.getByPositiveStatus = asyncHandler(async (req, res, next) => {
  const isPositive = req.params.status === 'true';

  const reviews = await Review.find({
    isDeleted: false,
    is_positive_review: isPositive
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `${isPositive ? 'Positive' : 'Negative'} reviews`, { count: reviews.length, reviews });
});

// @desc    Get positive reviews
// @route   GET /reviews/positive
// @access  Public
exports.getPositiveReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ isDeleted: false, is_positive_review: true })
    .populate('user', 'name')
    .populate('country', 'name code')
    .skip(skip).limit(limit);

  sendResponse(res, 200, true, 'Positive reviews', { count: reviews.length, page, reviews });
});

// @desc    Get negative reviews
// @route   GET /reviews/negative
// @access  Public
exports.getNegativeReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ isDeleted: false, is_positive_review: false })
    .populate('user', 'name')
    .populate('country', 'name code')
    .skip(skip).limit(limit);

  sendResponse(res, 200, true, 'Negative reviews', { count: reviews.length, page, reviews });
});

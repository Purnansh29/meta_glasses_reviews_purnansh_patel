const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get reviews by year
// @route   GET /reviews/year/:year
// @access  Public
exports.getReviewsByYear = asyncHandler(async (req, res, next) => {
  const year = parseInt(req.params.year);
  if (isNaN(year)) {
    return next(new ErrorResponse('Please provide a valid year', 400));
  }

  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const reviews = await Review.find({
    isDeleted: false,
    date: { $gte: start, $lt: end }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews for year ${year}`, { count: reviews.length, reviews });
});

// @desc    Get reviews by month (1-12)
// @route   GET /reviews/month/:month
// @access  Public
exports.getReviewsByMonth = asyncHandler(async (req, res, next) => {
  const month = parseInt(req.params.month);
  if (isNaN(month) || month < 1 || month > 12) {
    return next(new ErrorResponse('Please provide a valid month (1-12)', 400));
  }

  // Find reviews where month of the date field is equal to month - 1 using mongo aggregate or $expr
  const reviews = await Review.find({
    isDeleted: false,
    $expr: { $eq: [{ $month: '$date' }, month] }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews for month ${month}`, { count: reviews.length, reviews });
});

// @desc    Get reviews by day of month (1-31)
// @route   GET /reviews/day/:day
// @access  Public
exports.getReviewsByDay = asyncHandler(async (req, res, next) => {
  const day = parseInt(req.params.day);
  if (isNaN(day) || day < 1 || day > 31) {
    return next(new ErrorResponse('Please provide a valid day of the month (1-31)', 400));
  }

  const reviews = await Review.find({
    isDeleted: false,
    $expr: { $eq: [{ $dayOfMonth: '$date' }, day] }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews for day ${day} of any month`, { count: reviews.length, reviews });
});

// @desc    Get reviews by year, month, and day
// @route   GET /reviews/date/:year/:month/:day
// @access  Public
exports.getReviewsByDateParts = asyncHandler(async (req, res, next) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);
  const day = parseInt(req.params.day);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return next(new ErrorResponse('Invalid date parameters. Use format: /date/:year/:month/:day', 400));
  }

  // Construct start and end dates
  // We format month and day with leading zeros
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

  const start = new Date(`${dateStr}T00:00:00.000Z`);
  if (isNaN(start.getTime())) {
    return next(new ErrorResponse('Invalid date specified', 400));
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const reviews = await Review.find({
    isDeleted: false,
    date: { $gte: start, $lt: end }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews for date ${dateStr}`, { count: reviews.length, reviews });
});

// @desc    Get reviews by minimum helpfulness score
// @route   GET /reviews/helpful-score/:score
// @access  Public
exports.getReviewsByHelpfulnessScore = asyncHandler(async (req, res, next) => {
  const score = parseFloat(req.params.score);
  if (isNaN(score)) {
    return next(new ErrorResponse('Please provide a valid helpfulness score', 400));
  }

  const reviews = await Review.find({
    isDeleted: false,
    helpfulness_score: { $gte: score }
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews with helpfulness score >= ${score}`, { count: reviews.length, reviews });
});

// @desc    Get reviews by user profile link or ID
// @route   GET /reviews/profile/:profile
// @access  Public
exports.getReviewsByProfile = asyncHandler(async (req, res, next) => {
  const profileQuery = req.params.profile;

  const reviews = await Review.find({
    isDeleted: false,
    profile: new RegExp(profileQuery, 'i')
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews with user profile containing '${profileQuery}'`, { count: reviews.length, reviews });
});

// @desc    Get reviews by device name
// @route   GET /reviews/device/:deviceName
// @access  Public
exports.getReviewsByDeviceName = asyncHandler(async (req, res, next) => {
  const deviceName = req.params.deviceName;

  const reviews = await Review.find({
    isDeleted: false,
    deviceName: new RegExp(deviceName, 'i')
  }).populate('user', 'name').populate('country', 'name code');

  sendResponse(res, 200, true, `Reviews for device '${deviceName}'`, { count: reviews.length, reviews });
});

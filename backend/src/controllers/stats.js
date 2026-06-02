const Review = require('../models/Review');
const User = require('../models/User');
const Country = require('../models/Country');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get overall ratings statistics and distribution
// @route   GET /reviews/stats/ratings
// @access  Public
exports.getRatingsStats = asyncHandler(async (req, res, next) => {
  const stats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        minRating: { $min: '$rating' },
        maxRating: { $max: '$rating' },
        totalReviews: { $sum: 1 },
        totalHelpful: { $sum: '$helpful' }
      }
    }
  ]);

  const distribution = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  const resultStats = stats[0] || {
    averageRating: 0,
    minRating: 0,
    maxRating: 0,
    totalReviews: 0,
    totalHelpful: 0
  };

  // Calculate percentage for distribution
  const formattedDistribution = distribution.map(d => ({
    rating: d._id,
    count: d.count,
    percentage: resultStats.totalReviews > 0 ? parseFloat(((d.count / resultStats.totalReviews) * 100).toFixed(2)) : 0
  }));

  sendResponse(res, 200, true, 'Ratings statistics calculated successfully', {
    overall: {
      averageRating: parseFloat(resultStats.averageRating.toFixed(2)),
      minRating: resultStats.minRating,
      maxRating: resultStats.maxRating,
      totalReviews: resultStats.totalReviews,
      totalHelpful: resultStats.totalHelpful
    },
    distribution: formattedDistribution
  });
});

// @desc    Get statistics per device
// @route   GET /reviews/stats/devices
// @access  Public
exports.getDeviceStats = asyncHandler(async (req, res, next) => {
  const deviceStats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$deviceName',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        totalHelpful: { $sum: '$helpful' }
      }
    },
    { $sort: { totalReviews: -1 } }
  ]);

  const formattedStats = deviceStats.map(d => ({
    deviceName: d._id || 'Unknown',
    averageRating: parseFloat(d.averageRating.toFixed(2)),
    totalReviews: d.totalReviews,
    totalHelpful: d.totalHelpful
  }));

  sendResponse(res, 200, true, 'Device statistics calculated successfully', {
    devices: formattedStats
  });
});

// @desc    Get statistics for verified vs unverified purchases
// @route   GET /reviews/stats/verified
// @access  Public
exports.getVerifiedStats = asyncHandler(async (req, res, next) => {
  const stats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$verifiedPurchase',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        totalHelpful: { $sum: '$helpful' }
      }
    }
  ]);

  const formattedStats = stats.map(s => ({
    verifiedPurchase: s._id,
    averageRating: parseFloat(s.averageRating.toFixed(2)),
    totalReviews: s.totalReviews,
    totalHelpful: s.totalHelpful
  }));

  sendResponse(res, 200, true, 'Verified purchase metrics calculated successfully', {
    verifiedMetrics: formattedStats
  });
});

// @desc    Get statistics per country
// @route   GET /reviews/stats/countries
// @access  Public
exports.getCountryStats = asyncHandler(async (req, res, next) => {
  const countryStats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$country',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        totalHelpful: { $sum: '$helpful' }
      }
    },
    {
      $lookup: {
        from: 'countries',
        localField: '_id',
        foreignField: '_id',
        as: 'countryInfo'
      }
    },
    { $unwind: '$countryInfo' },
    {
      $project: {
        _id: 0,
        countryName: '$countryInfo.name',
        countryCode: '$countryInfo.code',
        averageRating: 1,
        totalReviews: 1,
        totalHelpful: 1
      }
    },
    { $sort: { totalReviews: -1 } }
  ]);

  const formattedStats = countryStats.map(c => ({
    ...c,
    averageRating: parseFloat(c.averageRating.toFixed(2))
  }));

  sendResponse(res, 200, true, 'Country statistics calculated successfully', {
    countries: formattedStats
  });
});

// @desc    Get top active/helpful reviewers
// @route   GET /reviews/stats/reviewers
// @access  Public
exports.getReviewerStats = asyncHandler(async (req, res, next) => {
  const stats = await Review.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$user',
        totalReviews: { $sum: 1 },
        totalHelpful: { $sum: '$helpful' },
        averageRatingGiven: { $avg: '$rating' }
      }
    },
    { $sort: { totalHelpful: -1, totalReviews: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: 0,
        userName: '$userInfo.name',
        userProfile: '$userInfo.profile',
        totalReviews: 1,
        totalHelpful: 1,
        averageRatingGiven: 1
      }
    }
  ]);

  const formattedReviewers = stats.map(r => ({
    ...r,
    averageRatingGiven: parseFloat(r.averageRatingGiven.toFixed(2))
  }));

  sendResponse(res, 200, true, 'Top reviewer statistics calculated successfully', {
    topReviewers: formattedReviewers
  });
});

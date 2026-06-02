const Review = require('../models/Review');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Compare reviews and metrics of two users
// @route   GET /reviews/compare/users
// @access  Public
exports.compareUsers = asyncHandler(async (req, res, next) => {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return next(new ErrorResponse('Please provide user1 and user2 query parameters', 400));
  }

  const u1Doc = await User.findOne({ name: new RegExp(`^${user1}$`, 'i') });
  const u2Doc = await User.findOne({ name: new RegExp(`^${user2}$`, 'i') });

  if (!u1Doc || !u2Doc) {
    return next(new ErrorResponse('One or both specified users not found', 404));
  }

  // Get statistics for User 1
  const u1Stats = await Review.aggregate([
    { $match: { user: u1Doc._id, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        totalHelpful: { $sum: '$helpful' },
        verifiedCount: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } }
      }
    }
  ]);

  // Get statistics for User 2
  const u2Stats = await Review.aggregate([
    { $match: { user: u2Doc._id, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        totalHelpful: { $sum: '$helpful' },
        verifiedCount: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } }
      }
    }
  ]);

  const cleanStats = (stats, userDoc) => {
    if (!stats || stats.length === 0) {
      return {
        name: userDoc.name,
        profile: userDoc.profile,
        totalReviews: 0,
        averageRating: 0,
        totalHelpful: 0,
        verifiedPercentage: 0
      };
    }
    const s = stats[0];
    return {
      name: userDoc.name,
      profile: userDoc.profile,
      totalReviews: s.totalReviews,
      averageRating: parseFloat(s.averageRating.toFixed(2)),
      totalHelpful: s.totalHelpful,
      verifiedPercentage: parseFloat(((s.verifiedCount / s.totalReviews) * 100).toFixed(2))
    };
  };

  sendResponse(res, 200, true, 'User comparison statistics generated', {
    user1: cleanStats(u1Stats, u1Doc),
    user2: cleanStats(u2Stats, u2Doc)
  });
});

// @desc    Compare metrics of two ratings (e.g. 5 star vs 1 star reviews)
// @route   GET /reviews/compare/ratings
// @access  Public
exports.compareRatings = asyncHandler(async (req, res, next) => {
  const r1 = parseFloat(req.query.rating1);
  const r2 = parseFloat(req.query.rating2);

  if (isNaN(r1) || isNaN(r2)) {
    return next(new ErrorResponse('Please provide rating1 and rating2 as numbers', 400));
  }

  const getStatsForRating = async (ratingVal) => {
    const stats = await Review.aggregate([
      { $match: { rating: ratingVal, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageHelpful: { $avg: '$helpful' },
          verifiedCount: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } }
        }
      }
    ]);

    if (!stats || stats.length === 0) {
      return {
        rating: ratingVal,
        totalReviews: 0,
        averageHelpful: 0,
        verifiedPercentage: 0
      };
    }

    const s = stats[0];
    return {
      rating: ratingVal,
      totalReviews: s.totalReviews,
      averageHelpful: parseFloat(s.averageHelpful.toFixed(2)),
      verifiedPercentage: parseFloat(((s.verifiedCount / s.totalReviews) * 100).toFixed(2))
    };
  };

  sendResponse(res, 200, true, 'Rating comparison statistics generated', {
    rating1: await getStatsForRating(r1),
    rating2: await getStatsForRating(r2)
  });
});

// @desc    Fetch random reviews
// @route   GET /reviews/fetch/random
// @access  Public
exports.getRandomReviews = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 1;

  const reviews = await Review.aggregate([
    { $match: { isDeleted: false } },
    { $sample: { size: limit } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'countries',
        localField: 'country',
        foreignField: '_id',
        as: 'country'
      }
    },
    { $unwind: '$country' },
    {
      $project: {
        'user.password': 0,
        'user.createdAt': 0,
        'user.updatedAt': 0
      }
    }
  ]);

  sendResponse(res, 200, true, `Fetched ${reviews.length} random review(s)`, {
    count: reviews.length,
    reviews
  });
});

// @desc    Fetch trending reviews (sorted by helpfulness)
// @route   GET /reviews/fetch/trending
// @access  Public
exports.getTrendingReviews = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const reviews = await Review.find({ isDeleted: false })
    .sort({ helpful: -1, date: -1 })
    .limit(limit)
    .populate('user', 'name profile')
    .populate('country', 'name code');

  sendResponse(res, 200, true, 'Trending reviews fetched successfully', {
    count: reviews.length,
    reviews
  });
});

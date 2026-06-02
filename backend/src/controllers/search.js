const Review = require('../models/Review');
const User = require('../models/User');
const Country = require('../models/Country');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Search across reviews, users, countries, and titles
// @route   GET /search
// @access  Public
exports.searchAll = asyncHandler(async (req, res, next) => {
  const query = req.query.q || req.query.query || '';

  if (!query) {
    return sendResponse(res, 200, true, 'Please provide a search query', {
      reviews: [],
      users: [],
      countries: []
    });
  }

  // Find matching users
  const matchingUsers = await User.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { email: new RegExp(query, 'i') }
    ]
  }).select('-password');

  const userIds = matchingUsers.map(u => u._id);

  // Find matching countries
  const matchingCountries = await Country.find({
    $or: [
      { name: new RegExp(query, 'i') },
      { code: new RegExp(query, 'i') }
    ]
  });

  const countryIds = matchingCountries.map(c => c._id);

  // Search reviews that:
  // 1. Contain query in title
  // 2. Contain query in review text
  // 3. Are written by matching users
  // 4. Are from matching countries
  // 5. Contain query in deviceName
  const reviews = await Review.find({
    isDeleted: false,
    $or: [
      { title: new RegExp(query, 'i') },
      { review: new RegExp(query, 'i') },
      { deviceName: new RegExp(query, 'i') },
      { user: { $in: userIds } },
      { country: { $in: countryIds } }
    ]
  })
    .populate('user', 'name profile')
    .populate('country', 'name code');

  sendResponse(res, 200, true, `Search results for query: '${query}'`, {
    resultsCount: reviews.length,
    reviews,
    matchedUsers: matchingUsers,
    matchedCountries: matchingCountries
  });
});

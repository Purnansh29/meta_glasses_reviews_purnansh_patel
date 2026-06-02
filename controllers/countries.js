const Country = require('../models/Country');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// @desc    Get all countries
// @route   GET /countries
// @access  Public
exports.getCountries = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const total = await Country.countDocuments();
  const countries = await Country.find().skip(skip).limit(limit);

  sendResponse(res, 200, true, 'Countries retrieved successfully', {
    count: countries.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    countries
  });
});

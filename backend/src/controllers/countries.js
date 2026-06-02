const Country = require('../models/Country');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');
const queryFeatures = require('../utils/queryFeatures');

// @desc    Get all countries
// @route   GET /countries
// @access  Public
exports.getCountries = asyncHandler(async (req, res, next) => {
  const { results, pagination } = await queryFeatures(Country, req.query);

  sendResponse(res, 200, true, 'Countries retrieved successfully', {
    count: results.length,
    pagination,
    countries: results
  });
});

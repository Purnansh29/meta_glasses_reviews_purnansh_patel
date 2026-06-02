const express = require('express');
const {
  getRatingsStats,
  getDeviceStats,
  getVerifiedStats,
  getCountryStats,
  getReviewerStats
} = require('../controllers/stats');

const router = express.Router();

router.get('/ratings', getRatingsStats);
router.get('/devices', getDeviceStats);
router.get('/verified', getVerifiedStats);
router.get('/countries', getCountryStats);
router.get('/reviewers', getReviewerStats);

module.exports = router;

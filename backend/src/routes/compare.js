const express = require('express');
const {
  compareUsers,
  compareRatings,
  getRandomReviews,
  getTrendingReviews
} = require('../controllers/compare');

const router = express.Router();

router.get('/compare/users', compareUsers);
router.get('/compare/ratings', compareRatings);
router.get('/fetch/random', getRandomReviews);
router.get('/fetch/trending', getTrendingReviews);

module.exports = router;

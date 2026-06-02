const express = require('express');
const {
  getReviewsByUser,
  getReviewsByCountry,
  getVerifiedByStatus,
  getReviewsByRating,
  getCountryReviewsByRating,
  getUserReviewsByRating,
  getVerifiedCountryReviews
} = require('../controllers/paramRoutes');

const router = express.Router();

router.get('/users/:name/reviews', getReviewsByUser);
router.get('/country/:country/reviews', getReviewsByCountry);
router.get('/verified/:status', getVerifiedByStatus);
router.get('/ratings/:rating', getReviewsByRating);
router.get('/reviews/country/:country/rating/:rating', getCountryReviewsByRating);
router.get('/reviews/user/:name/rating/:rating', getUserReviewsByRating);
router.get('/reviews/country/:country/verified/:status', getVerifiedCountryReviews);

module.exports = router;

const express = require('express');
const {
  getReviews,
  getReview,
  deleteReview
} = require('../controllers/reviews');

const router = express.Router();

router.route('/')
  .get(getReviews);

router.route('/:reviewID')
  .get(getReview)
  .delete(deleteReview);

module.exports = router;

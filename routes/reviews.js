const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  replaceReview,
  updateRating,
  deleteReview
} = require('../controllers/reviews');

const router = express.Router();

router.route('/')
  .get(getReviews)
  .post(createReview);

router.route('/:reviewID')
  .get(getReview)
  .put(replaceReview)
  .delete(deleteReview);

router.route('/:reviewID/rating')
  .patch(updateRating);

module.exports = router;

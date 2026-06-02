const express = require('express');
const {
  getDashboardStats,
  getAdminReviews,
  restoreReview,
  hardDeleteReview
} = require('../controllers/admin');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply protection & authorization to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reviews', getAdminReviews);
router.put('/reviews/:reviewID/restore', restoreReview);
router.delete('/reviews/:reviewID/hard', hardDeleteReview);

module.exports = router;

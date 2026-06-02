const express = require('express');
const {
  getReviewsByYear,
  getReviewsByMonth,
  getReviewsByDay,
  getReviewsByDateParts,
  getReviewsByHelpfulnessScore,
  getReviewsByProfile,
  getReviewsByDeviceName
} = require('../controllers/extraParamRoutes');

const router = express.Router();

router.get('/year/:year', getReviewsByYear);
router.get('/month/:month', getReviewsByMonth);
router.get('/day/:day', getReviewsByDay);
router.get('/date/:year/:month/:day', getReviewsByDateParts);
router.get('/helpful-score/:score', getReviewsByHelpfulnessScore);
router.get('/profile/:profile', getReviewsByProfile);
router.get('/device/:deviceName', getReviewsByDeviceName);

module.exports = router;

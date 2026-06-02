const express = require('express');
const {
  getByTitle,
  getByDate,
  getByHelpfulCount,
  getByPositiveStatus,
  getPositiveReviews,
  getNegativeReviews
} = require('../controllers/filterRoutes');

const router = express.Router();

router.get('/title/:title', getByTitle);
router.get('/date/:date', getByDate);
router.get('/helpful/:count', getByHelpfulCount);
router.get('/positive', getPositiveReviews);
router.get('/positive/:status', getByPositiveStatus);
router.get('/negative', getNegativeReviews);

module.exports = router;

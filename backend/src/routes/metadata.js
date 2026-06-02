const express = require('express');
const { getRatings, getVerified } = require('../controllers/metadata');
const router = express.Router();

router.get('/ratings', getRatings);
router.get('/verified', getVerified);

module.exports = router;

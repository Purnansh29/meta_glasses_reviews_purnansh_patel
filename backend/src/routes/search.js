const express = require('express');
const { searchAll } = require('../controllers/search');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.get('/', searchLimiter, searchAll);

module.exports = router;

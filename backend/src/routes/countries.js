const express = require('express');
const { getCountries } = require('../controllers/countries');
const router = express.Router();

router.get('/', getCountries);

module.exports = router;

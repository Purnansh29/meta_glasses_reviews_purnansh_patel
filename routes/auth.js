const express = require('express');
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/auth');
const { protect } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', authLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', authLimiter, resetPassword);

module.exports = router;

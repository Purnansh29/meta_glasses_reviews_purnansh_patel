const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendResponse } = require('../utils/responseHelper');

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
};

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, profile, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    profile: profile || '',
    role: role || 'user'
  });

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'User logged in successfully');
});

// @desc    Log user out / clear cookie
// @route   GET /auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  sendResponse(res, 200, true, 'User logged out successfully', {});
});

// @desc    Forgot password (generates reset token)
// @route   POST /auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // In a real application, we would send an email with the resetToken.
  // For this backend, we return the reset token directly in the API response so it can be verified.
  sendResponse(res, 200, true, 'Password reset token generated. Use PUT /auth/resetpassword/:resettoken to reset password.', {
    resetToken
  });
});

// @desc    Reset password
// @route   PUT /auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successfully');
});

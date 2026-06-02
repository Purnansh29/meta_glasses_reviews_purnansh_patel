const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  reviewID: {
    type: String,
    required: [true, 'Please add a review ID'],
    unique: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a review date']
  },
  verifiedPurchase: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpful_aug: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters']
  },
  review: {
    type: String,
    required: [true, 'Please add review text'],
    trim: true
  },
  profile: {
    type: String,
    trim: true
  },
  reviewLink: {
    type: String,
    trim: true
  },
  reviewImage: {
    type: String,
    trim: true
  },
  is_positive_review: {
    type: Boolean,
    default: true
  },
  helpfulness_score: {
    type: Number,
    default: 0
  },
  deviceName: {
    type: String,
    required: [true, 'Please add a device name'],
    trim: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Tracks createdAt and updatedAt
});

// Create compound index for faster search & stats queries
ReviewSchema.index({ user: 1, rating: -1 });
ReviewSchema.index({ country: 1, rating: -1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ date: -1 });
ReviewSchema.index({ deviceName: 1 });

module.exports = mongoose.model('Review', ReviewSchema);

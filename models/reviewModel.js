const mongoose = require('mongoose');

const reviewScheme = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'A review must be related to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
      require: [true, 'A review must be related to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewScheme.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name' });
  next();
});

const Review = mongoose.model('Review', reviewScheme);
module.exports = Review;

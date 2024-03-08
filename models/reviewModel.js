const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewScheme.index({ user: 1, tour: 1 }, { unique: 1 });

reviewScheme.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewScheme.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewScheme.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

reviewScheme.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewScheme.post(/^findOneAnd/, async function(next) {
  await this.r.constructor.calcAverageRatings(this.r.tour);
  next();
});
const Review = mongoose.model('Review', reviewScheme);
module.exports = Review;

const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40],
      minlength: [5]
    },
    slug: String,
    duration: {
      type: Number,
      required: [true]
    },
    difficulty: {
      type: String,
      required: [true],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Only three optional choice'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1],
      max: [5]
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    maxGroupSize: {
      type: Number,
      required: [true]
    },
    price: {
      type: Number,
      required: true
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'discount price ({VALUE}) should be lower than price',
        validator: function(val) {
          return this.price > val;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true]
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true]
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secreteTour: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeek').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.find({ secreteTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(doc, next) {
  console.log(Date.now() - this.start);
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

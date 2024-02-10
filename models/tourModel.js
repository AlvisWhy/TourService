const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true
  },
  duration: {
    type: Number,
    required: [true]
  },
  difficulty: {
    type: String,
    required: [true]
  },
  ratingsAverage: {
    type: Number,
    default: 4.5
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
  priceDiscount: Number,
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
    default: Date.now()
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

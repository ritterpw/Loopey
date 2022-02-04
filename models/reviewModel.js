// review, rating, created at, ref to producer, ref to user
const mongoose = require('mongoose');
const Producer = require('./producerModel');

const reviewSchema = mongoose.Schema({
  review: { type: String, required: [true, 'review is required!'] },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now() },
  producer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Producer',
    required: [true, 'Must have Producer'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must have User'],
  },
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName imageLink',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (producerId) {
  const stats = await this.aggregate([
    { $match: { producer: producerId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Producer.findByIdAndUpdate(producerId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Producer.findByIdAndUpdate(producerId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function (next) {
  this.constructor.calcAverageRatings(this.producer);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.producer);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

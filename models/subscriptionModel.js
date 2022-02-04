const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  producer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Producer',
    required: [true, 'Subscription must belong to a Producer!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Subscription must belong to a User!'],
  },
  price: {
    type: Number,
    require: [true, 'Subscription must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  active: {
    type: Boolean,
    default: true,
  },
});

subscriptionSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'producer',
    select: 'producerName',
  });
  next();
});

const Subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = Subscription;

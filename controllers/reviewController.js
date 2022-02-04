const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setProducerUserIds = (req, res, next) => {
  if (!req.body.producer) req.body.producer = req.params.producerId;
  if (!req.body.user) req.body.user = req.params.userId;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

const express = require('express');
const {
  getAllReviews,
  createReview,
  getReview,
  deleteReview,
  updateReview,
  setProducerUserIds,
} = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(getAllReviews)
  .post(authController.restrictTo('user'), setProducerUserIds, createReview);

router
  .route('/:id')
  .patch(authController.restrictTo('user', 'admin'), updateReview)
  .get(getReview)
  .delete(authController.restrictTo('user', 'admin'), deleteReview);

module.exports = router;

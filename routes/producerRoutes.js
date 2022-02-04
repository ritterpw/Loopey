const express = require('express');
const {
  getAllProducers,
  createNewProducer,
  getOneProducer,
  updateOneProducer,
  deleteOneProducer,
  uploadProducerImages,
  resizeProducerImages,
} = require('../controllers/producerController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:producerId/reviews', reviewRouter);

router
  .route('/')
  .get(authController.protect, getAllProducers)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'producer'),
    createNewProducer
  );

router
  .route('/:id')
  .get(getOneProducer)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'producer'),
    uploadProducerImages,
    resizeProducerImages,
    updateOneProducer
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'producer'),
    deleteOneProducer
  );

// router
//   .route(':/tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('users'),
//     reviewController.createReview
//   );

module.exports = router;

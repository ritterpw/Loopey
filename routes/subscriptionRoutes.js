const express = require('express');
const { getCheckoutSession } = require('../controllers/subscriptionController');
const authController = require('../controllers/authController');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:producerId', getCheckoutSession);

router.use(authController.restrictTo('admin', 'producer'));

router
  .route('/')
  .get(subscriptionController.getAllSubscriptions)
  .post(subscriptionController.createSubscription);

router
  .route('/:id')
  .get(subscriptionController.getSubscription)
  .patch(subscriptionController.updateSubscription)
  .delete(subscriptionController.deleteSubscription);

module.exports = router;

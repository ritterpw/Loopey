const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const subscriptionController = require('../controllers/subscriptionController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signUp', viewController.getsignUpForm);

router.get(
  '/producer/:slug',
  authController.isLoggedIn,
  viewController.getProducer
);
router.get('/me', authController.protect, viewController.getAccount);

router.get(
  '/my-producers',
  authController.protect,
  viewController.getMyProducers
);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = router;

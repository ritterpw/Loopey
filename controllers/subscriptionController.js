const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Producer = require('../models/producerModel');
const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const producer = await Producer.findById(req.params.producerId);

  // create a checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?producer=${
      req.params.producerId
    }&user=${req.user.id}&price=${producer.subscriptionOffer.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/producer/${
      producer.slug
    }`,
    customer_email: req.user.email,
    client_reference_id: req.params.producerId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: producer.producerName },
          unit_amount: producer.subscriptionOffer.price * 100,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
  });

  console.log(session);
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createSubscriptionCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  console.log(req.query);
  const { producer, user, price } = req.query;
  console.log(producer);
  console.log(user);
  console.log(price);

  if (!producer && !user && !price) return next();
  await Subscription.create({ producer, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createSubscription = factory.createOne(Subscription);
exports.getSubscription = factory.getOne(Subscription);
exports.getAllSubscriptions = factory.getAll(Subscription);
exports.updateSubscription = factory.updateOne(Subscription);
exports.deleteSubscription = factory.deleteOne(Subscription);

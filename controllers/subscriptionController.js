const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Producer = require('../models/producerModel');
const User = require('../models/userModel');
const Subscription = require('../models/subscriptionModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  let producer = await Producer.findById(req.params.producerId);

  // const producer = await Producer.updateOne(
  //   { _id: req.params.producerId },
  //   {
  //     $addToSet: { subscribers: req.user._id },
  //   }
  // );

  // // create a checkout session
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   payment_method_types: ['card'],
  //   success_url: `${req.protocol}://${req.get('host')}/my-producers`,
  //   cancel_url: `${req.protocol}://${req.get('host')}/producer/${
  //     producer.slug
  //   }`,
  //   customer_email: req.user.email,
  //   client_reference_id: req.params.producerId,
  //   line_items: [
  //     {
  //       price_data: {
  //         currency: 'usd',
  //         product_data: { name: producer.producerName },
  //         unit_amount: producer.price * 100,
  //         recurring: { interval: 'month' },
  //       },
  //       quantity: 1,
  //     },
  //   ],
  // });
  producer = producer._id;
  const user = req.user._id;
  const { price } = producer;

  await Subscription.create({ producer, user, price });

  res.status(200).json({
    status: 'success',
    producer,
  });
});

// exports.createSubscriptionCheckout = catchAsync(async (req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { producer, user, price } = req.query;

//   if (!producer && !user && !price) return next();
//   await Subscription.create({ producer, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

const createBookingCheckout = async (session) => {
  const producer = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Subscription.create({ producer, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createSubscription = factory.createOne(Subscription);
exports.getSubscription = factory.getOne(Subscription);
exports.getAllSubscriptions = factory.getAll(Subscription);
exports.updateSubscription = factory.updateOne(Subscription);
exports.deleteSubscription = factory.deleteOne(Subscription);

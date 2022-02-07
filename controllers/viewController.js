const Producer = require('../models/producerModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Subscription = require('../models/subscriptionModel');

exports.getOverview = catchAsync(async (req, res) => {
  // get producer data from collection
  const producers = await Producer.find();

  //builf template

  //render template using data

  res.status(200).render('overview', {
    title: 'All Producers',
    producers,
  });
});

exports.getProducer = catchAsync(async (req, res, next) => {
  const producer = await Producer.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!producer) {
    return next(new AppError('There is no Producer with that name.', 404));
  }

  res.status(200).render('producer', {
    title: producer.producerName,
    producer,
  });
});

exports.getLoginForm = (req, res) => {
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com"
    )
    .render('login', {
      title: 'User Login',
    });
};

exports.getSignUpForm = (req, res) => {
  res.status(200).render('signUp', {
    title: `Create New Account`,
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyProducers = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const subscriptions = await Subscription.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const producerIDs = subscriptions.map((el) => el.producer);
  const producers = await Producer.find({ _id: { $in: producerIDs } });

  res.status(200).render('overview', {
    title: 'My Producers',
    producers,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

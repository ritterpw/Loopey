const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const producerRouter = require('./routes/producerRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const subscriptionRouter = require('./routes/subscriptionRoutes');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');
const subscriptionController = require('./controllers/subscriptionController');

//create express application object
const app = express();

//for heroku
app.enable('trust proxy');

//setting pug as view engine
app.set('view engine', 'pug');

//setting views folder as default view path
app.set('views', path.join(__dirname, 'views'));

//attempt to fix the cross origin resource shring issue
//in google chrome when accessing stripe API
app.use(cors());
app.options('*', cors());
app.use((req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
const whitelist = [
  'https://checkout.stripe.com/*',
  'https://*.stripe.com/*',
  'https://js.stripe.com/*',
];
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', whitelist);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With,Content-Type,Accept,Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT');
    return res.status(200).json({});
  }
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com/*',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
          'https://checkout.stripe.com/*',
          'https://*.stripe.com/*',
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com/*',
          'https://checkout.stripe.com/*',
          'https://*.stripe.com/*',
        ],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
          'https://checkout.stripe.com/*',
          'https://*.stripe.com/*',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'", 'https://checkout.stripe.com/*'],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.stripe.com/*',

          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
          'https://checkout.stripe.com/*',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

//setting public folder as folder for static data
app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//used to limit the repeated requests to the public APIs within given time frame.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//stripe webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  subscriptionController.webhookCheckout
);

// controls the max size of a request
app.use(express.json({ limit: '10kb' }));
//parses incoming requests with urlencoded payloads and is based on body-parser.
//Returns middleware that only parses urlencoded bodies and only looks at
//requests where the Content - Type header matches the type option.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//parse the Cookie header on the request and expose the cookie data as the property req.cookies
app.use(cookieParser());
//sanitizes mongodb inputs from query selector injection attacks
app.use(mongoSanitize());
//module used to filter input from users to prevent XSS attacks.
app.use(xss());

//protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: ['firstName', 'prodStyle', 'artistType', 'role', 'subscribers'],
  })
);
//attempt to compress response bodies for all request that
//traverse through the middleware, based on the given options.
app.use(compression());

//viewrouter
app.use('/', viewRouter);
//api routes
app.use('/api/v1/producers', producerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

//catch everything else that makes it here
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;

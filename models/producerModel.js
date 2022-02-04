const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const producerSchema = mongoose.Schema({
  producerName: {
    type: String,
    required: [true, 'Producer must have producer name'],
    unique: true,
    minLength: [1, ' producer name must have length of at least one'],
    maxLength: [20, 'producer name  must have less than 20 characters'],
  },
  firstName: {
    type: String,
    required: [true, 'Producer must have first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Producer must have last name'],
  },
  email: {
    type: String,
    required: [true, 'User must have email'],
    unique: true,
    lowecase: true,
    validate: [validator.isEmail, 'Please enter valid email'],
  },
  slug: String,
  country: String,
  prodStyle: {
    type: String,
    required: [true, 'Producer must have Style'],
  },
  artistType: String,
  description: {
    type: String,
    required: [true, 'Producer must have description'],
  },
  youtubeLink: String,
  imageCover: {
    type: String,
    required: [true, 'Producer must have image'],
  },
  packImages: { type: String },
  role: {
    type: String,
    enum: ['user', 'producer', 'co-producer', 'admin'],
    default: 'producer',
  },
  ratingsAverage: {
    type: Number,
    default: null,
    min: [1, 'rating must be above 1'],
    max: [5, 'rating must be below 5'],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: { type: Number, default: 0 },
  password: {
    type: String,
    required: [true, 'User must have Password'],
    minlength: 8,
    select: false,
  },
  passwordConfirmed: {
    type: String,
    required: [true, 'User must have Password Confirmed'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  samplePackURL: String,
  subscriptionOffer: {
    subscriptionName: { type: String },
    price: { type: Number },
    minSamplesPerPack: { type: Number },
  },

  subscribers: [
    {
      type: [mongoose.Schema.ObjectId],
      ref: 'User',
    },
  ],
  createdAt: { type: Date, default: Date.now(), select: false },
});

//producerSchema.index({})

producerSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'producer',
  localField: '_id',
});

producerSchema.pre('save', function (next) {
  this.slug = slugify(this.producerName, { lower: true });
  next();
});

producerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next;

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirmed = undefined;

  next();
});

producerSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'subscribers',
    select: '-__v -passwordResetExpires -passwordResetToken',
  });

  next();
});

producerSchema.methods.correctPassowrd = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

producerSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStap = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt);
    return JWTTimeStamp < changedTimeStap;
  }
  return false;
};

const Producer = mongoose.model('Producer', producerSchema);

module.exports = Producer;

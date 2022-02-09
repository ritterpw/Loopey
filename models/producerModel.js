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
  },
  packImages: { type: String },
  ratingsAverage: {
    type: Number,
    default: null,
    min: [1, 'rating must be above 1'],
    max: [5, 'rating must be below 5'],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: { type: Number, default: 0 },
  samplePackURL: String,
  subscriptionName: { type: String },
  price: { type: Number },
  minSamplesPerPack: { type: Number },
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

const Producer = mongoose.model('Producer', producerSchema);

module.exports = Producer;

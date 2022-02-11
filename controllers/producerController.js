const multer = require('multer');
const sharp = require('sharp');
const Producer = require('../models/producerModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadProducerImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'packImages', maxCount: 3 },
]);

exports.resizeProducerImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.packImages) return next();

  // 1) Cover image
  req.body.imageCover = `producer-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.packImages = [];

  await Promise.all(
    req.files.packImages.map(async (file, i) => {
      const filename = `producer-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.packImages.push(filename);
    })
  );

  next();
});

exports.signUp = catchAsync(async (req, res, next) => {
  const prod = await Producer.create(req.body);

  try {
    await User.findByIdAndUpdate(req.user._id, {
      myProducer: prod._id,
      role: 'producer',
    });
  } catch (err) {
    return new AppError(err.message, 500);
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: prod,
    },
  });
});
exports.getAllProducers = factory.getAll(Producer);

exports.getOneProducer = factory.getOne(Producer, { path: 'reviews' });

exports.createNewProducer = factory.createOne(Producer);

exports.updateOneProducer = factory.updateOne(Producer);

exports.deleteOneProducer = factory.deleteOne(Producer);

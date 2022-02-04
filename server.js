const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaughtException. SHUTTING DOWN...');
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

//create mongodb connection
mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB connection succesful');
  });

// assign port for server
const port = process.env.PORT || 8000;

//start server
const server = app.listen(port, () => {
  console.log(`running on port ${port}`);
});

//on unhandled rejection, close server and shut down application
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled code rejection. SHUTTING DOWN...');
  server.close(() => {
    process.exit(1);
  });
});

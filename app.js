const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());//json parser
app.use(express.static(`${__dirname}/public`));

//* basic middelware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});




// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//^ what we want to implement is a route handler for a route that was not cached by any of  our route handlers
//* since the code is executed are executed in order so if we have a request that makes it into this point here of our code this means that non of the above where able to catch it.

//app.all it will run for all the http methods get patch post delete etc. * in the url stand for every thing
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'failed',
    message:`this route ${req.originalUrl} is either not defined or you cant access it `
  });
});

module.exports = app;
 
 

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const rateLimit = require('express-rate-limit')
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const reviewRoute = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRouters')


//* set templete engine 
app.set('view engine', 'pug')
app.set('views',path.join(__dirname,'views'))

//^ Serving static files
app.use(express.static(path.join(__dirname,'public')));



//! 1) GLobal MIDDLEWARES

//^ Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//^ Set secure HTTP header
app.use(helmet())

//^ Simit requests from same ip
//& rateLimit is a function which takes as input object of options
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 15 minutes
	max: 110, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message:'Too many request please try again later!!'
})
//? Apply the rate limiting middleware to API calls only
app.use('/api',limiter)


//^ Body paser, for reading data from the body into req.body
app.use(express.json());

//^ Data santitization aginst NoSql query injection
//& it looks at the request body, the request query string and also the request params THEN it will basically filter out all of the doller sign and dots as this is how mongodb operator are writtern
app.use(mongoSanitize())

//^ Data santitization aginst against XXS
//& this will then clean ant user input from malicious HTML code
app.use(xss())

//^ Pervent parametere pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);



//^ Test middelware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});



//! 2) ROUTES

app.use('/',viewRouter)

//^ middleware that will be called whenever we make a call to this route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoute);

//^ what we want to implement is a route handler for a route that was not cached by any of  our route handlers
//* since the code is executed are executed in order so if we have a request that makes it into this point here of our code this means that non of the above where able to catch it.

//? app.all it will run for all the http methods get patch post delete etc. * in the url stand for every thing
app.all('*', (req, res,next) => {
  // res.status(404).json({
  //   status: 'failed',
  //   message:`this route ${req.originalUrl} is either not defined or you cant access it `
  // });
  
  //! Another way
  //* we will create a new error object and pass it the message , status , status code and this will be receved by the error middleware
  
  
  //^the only thing that we can pass to next is error and when passing error express will directly send this to error middleware
  
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  
  //the above is similar to
  
  // const err = new Error(`Can't find ${req.originalUrl} in this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
 
  // next(err);

});

 
 //! operational error handling middleware
 //* we want to get rid of all the try{...}Catch(err){ res.status(404).json({status:..., message:err.message}) } in our controller
  
  app.use(globalErrorHandler); 
 

  module.exports = app;

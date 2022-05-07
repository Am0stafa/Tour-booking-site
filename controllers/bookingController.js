const Tour = require('./../models/tourModels')
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync')
const APIFeatchers = require('./../utils/apiFeatures')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require('../models/bookingModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //! 1) first we have to find that tour in the database  
    const tour = await Tour.findById(req.params.tourId)
    if(!tour) throw new AppError("invaild id", 404)
    
    
    //! 2) create checkout session 
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        //! as we dont have access the the yello expet using webhooks we added all the variables that we need to create a new booking to the success url
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email, 
        //^ this field is going to allow us to pass some data about the session that we are currently creating as once the purchase is successful we will get access to the session object again and by then we want to create a new booking in the db to create it we need userId,tourId,price: we have access to the user email so we can recreate the userId, soo all thats missing is the tourId which is specified here
        client_reference_id: req.params.tourId,
        //^ specify some info about the product it self
        line_items: [
          {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
          }
        ]
    });

    //! 3) send the session to the client
    res.status(200).json({
        status: 'success',
        session
    });

})

//! we want to create a new booking on this home url{success_url} as this is the url which is called whenever a purchase is successful so what we need to do is to add this middleware function onto the middleware stack of home route which is in viewRouter as this is the route which is going to be hit when a credit card is successfully charged which is also the point of time where we want to create a new booking
exports.createbookingChechout =catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  
  //& if we didnt find these on the params this means that we didnt buy so we move on to the next middleware
  
  if (!tour && !user && !price) return next();
  
  await Booking.create({ tour, user, price });

  //! now we will redirect the user to the home page but without the query string
  //^ by getting the entire url from which the request came AND THEN split it by the ? as this is the divider by the part that we actually want and the query string
  //* then what redirect does it make a new request but to this new url that we passed in so we will again make another request to the home url again hitting the base url but this time without the query string so we will go to the next middleware
  
  res.redirect(req.originalUrl.split('?')[0]);
})












//! this is very insecure as anyone can book without paying :}
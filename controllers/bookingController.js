const Tour = require('./../models/tourModels')
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync')
const APIFeatchers = require('./../utils/apiFeatures')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //! 1) first we have to find that tour in the database  
    const tour = await Tour.findById(req.params.tourId)
    if(!tour) throw new AppError("invaild id", 404)
    
    
    //! 2) create checkout session 
    const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email, 
        //^ this field is going to allow us to pass some data about the session that we are currently creating as once the purchase is successful we will get access to the session object again and by then we want to create a new booking in teh db to create it we need userId,tourId,price: we have access to the user email so we can recreate the userId, soo all thats missing is the tourId which is specified here
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


//! we want to create a new booking on this home url{success_url} as this is the url which is called whenever a purchase is successful so what we need to do 
exports.createbookingChechout = (req,res,next) => {
  const {tour,user,price} = req.params
  


}
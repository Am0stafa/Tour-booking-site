const catchAsync = require('../utils/catchAsync')
const Tour = require('./../models/tourModels')
const Booking = require('./../models/bookingModel')


exports.getOverview = catchAsync(async (req, res, next) => {
    //! 1) Get tour data from collection
    const tours = await Tour.find();
    
    //! 2) Build template
    //! 3) Render that template using tour data from 1)
    res.status(200).render('overview', {
      title: 'All Tours',
      tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: `${tour.title} Tour`,
      tour
    });
});
exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});
exports.getAccount = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'your account info'
  });
  
});

//! this one here is for the rendered website but for using axios we use the normal ones in the user routes
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
 //! rerender the page again with the new user so we pass the updated user
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getSingupForm = catchAsync(async (req, res, next) => {

  res.status(200).render('signup', {
    title: 'create your account!'
  });


});

exports.getMyTours =  catchAsync(async (req, res, next) => {
  //! find all the tours that the user has booked by finding all the bookings for the currently loged in users which will then give us a bunch of tourIds and then we have to find the tours with thoseIds
  
    //& 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    //& 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
    
    if (bookings.length === 0) {
      res.status(200).render('nullbooking', {
        title: 'Book Tours',
        headLine: `You haven't booked any tours yet!`,
        msg: `Please book a tour and come back. 🙂`
      });
    } else {
      res.status(200).render('overview', {
        title: 'My Tours',
        tours
      });
    }

});
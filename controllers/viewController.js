const catchAsync = require('../utils/catchAsync')
const Tour = require('./../models/tourModels')


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
    //! 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });
  
    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }
  
    //! 2) Build template
    //! 3) Render template using data from 1)
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
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

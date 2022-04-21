const Review = require('./../models/reviewModel')
const catchAsync = require('../utils/catchAsync')

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const review = await Review.find();
    
    res.status(200).json({
        status:'sucess',
        result: review.length,    
        data:{
            review
        }
    })

})
exports.createReview = catchAsync(async (req, res, next) => {
    //^ we do this so that the user can still have the option to define the user and the tour manually
    //! if we didnt specifiy the tour in the body we want to take the one on the URL and append it to the body
    
    if(!req.body.tour) req.body.tour = req.params.tourId;
    
    //! the same with the user
    
    if(!req.body.user) req.body.user = req.user.id;
    
    const newRewview = await Review.create(req.body);

    res.status(201).json({
        status:'sucess',
        data:{
            newRewview
        }
    })

})

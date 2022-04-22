const Review = require('./../models/reviewModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const APIFeatchers = require('../utils/apiFeatures')



exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter ={}
    //! if there is an id passed we are only going to search for reviews where the tour is equal to the tour id
    
    if (req.params.tourId) filter = {tour: req.params.tourId}
    
    //* we will first create an instance of the APIfeachers which contain the functions needed and we have accesee to nesting as we returned this in every method
    
    const featers = new APIFeatchers( Review.find(filter),req.query)
       .filter()
       .sort()
       .limit()
       .paginate()
       
    //^ to get access to the query we build inside the class
    const review = await featers.query;
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
    
    //^ the above could be implemented using middleware
    
    const newRewview = await Review.create(req.body);

    res.status(201).json({
        status:'sucess',
        data:{
            newRewview
        }
    })

})


//! rater than writing alot of repeted code we will user factory function which taked the model and return a function which will be invoked when the route in accessed

exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.getReview = factory.getOne(Review)
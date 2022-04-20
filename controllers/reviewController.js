const Review = require('./../models/reviewModel')

exports.getAllRewviews = catchAsync(async (req, res, next) => {
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
    //^ any thing which is not in the schema but in the body will be ignored
    const newRewview = await Review.creat(req.body);
    
    res.status(201).json({
        status:'sucess',
        data:{
            newRewview
        }
    })

})

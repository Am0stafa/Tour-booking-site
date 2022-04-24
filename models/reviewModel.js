const mongoose = require('mongoose');
const Tour = require('./tourModels')

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[ true, "What is your review?"]   
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:[ true, "what is your rating"]
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    tour:{//!which tour
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[ true, "review must belong to a tour"]
    },
    user:{//!which user
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[ true, "review must belong to a user"]
    }

},
{
//! this here sayes that each time the data is actually outputted as JSON or Object we want virtuals to be part of the output 
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
})




reviewSchema.pre(/^find/,function(next){
  this.populate({path:'user',select:'name photo'})
  next()
})

//! the rateing average and the number of rating which is going to be calculated each time a new review is added/updated/deleted:
//* we are going to make a function which is going to take a tourId and calculate the average rating and the number of rating that exist in our collection for that exact tour and finally the function will update in the tour model the average rating and the number of rating values. we will use a middleware to call this function each time based on the above conditions in red.

//& rather than making an instance method which is available on each document we will use static methods

reviewSchema.statics.calcAverageRatings = async function(tourId){
    //? the reason that we are using static method because we can only call agergate on the model it self and here this keyword points to the model
  const stats = await this.aggregate([
        {
        //! the first stage is to select all the reviews that belongs to the current tour that is passed as an arugment
        $match:{tour:tourId}
        },
        {
        //! now we will calculate the statistics 
        $group:{
         _id:'$tour',//^ the comman field that all the documents has in common
         nRating:{$sum:1},//^ add one for each rating that we have
         avgRating:{$avg:'$rating'}//^ calculate the average accouring to the rating field in this model
               }      
        }
    ])//& this will return an array conataing id nRating avgRating
    
    //! in case all the reviews are deleted we get an empty array and in this case we want both to return to default
    
    if(stats.length>0){
        //! now we want to persist this stats in the tourModel
        await Tour.findByIdAndUpdate(tourId,{ratingQuantity:stats[0].nRating,ratingAverage:stats[0].avgRating})
    }else{
        await Tour.findByIdAndUpdate(tourId,{ratingQuantity:0,ratingAverage:4.5})
    }
}

//! now we will make the middleware as explaned above
//? document middleware
reviewSchema.post('save',function(){
    //? this points to the document(Reviews) being saved but we want to execute the calc function which is available on the model
    //! to solve this problem and point to the model eventho we still didnt declared it by using this.constructor 
    this.constructor.calcAverageRatings(this.tour)
})
//? query middleware
reviewSchema.post(/^findOneAnd/,async function(){
    //! here the this points to the query but in this case we need the document itself so to do this execute the query here getting the doucment 
    const queryExec = await this.findOne();
    //^ as we can only call aggregate on doucment 
    queryExec.constructor.calcAverageRatings(queryExec.tour)
})


const Review = mongoose.model('Review',reviewSchema);

module.exports =  Review

const mongoose = require('mongoose');


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

const Review = mongoose.model('Review',reviewSchema);

module.exports =  Review

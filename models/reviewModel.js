const mongoose = require('mongoose');


const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required:[ true, "What is your review?"]   
    },
    rating:{
        type:Number,
        required:[ true, "what is your rating"]
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    whichTour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour'
    },
    whichUser:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }


})


const Review = mongoose.model('Review',reviewSchema);

module.exports =  Review

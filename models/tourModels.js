//in this file we keep our schema and model and export the model

const mongoose = require('mongoose');




//create a schema
const toursSchema = new mongoose.Schema({
  name:{
    type:String,
          //required or not and the error string
    required:[ true, "A tour must have a name" ], 
    unique:true
  },
  duration:{
    type:Number,
    required:[ true, "A tour must have a duration" ], 
  },
  maxGroupSize:{
    type:Number,
    required:[ true, "A tour must have a group size" ], 
  },
  difficulty:{
    type:String,
    //an validator will be added soon to check what type of difficulty
  },
    //thoes ratings are going to be calculated from the real reviews
  ratingAverage:{
    type:Number,
    default:4.5
  },
  ratingQuantity:{
    type:Number,
    default:0
  },
  price:{
    type:Number,
    required:[ true, "A tour must have a price" ], 
  },
  priceDiscount:{
    type:Number,
  },
  summary:{
    type:String,
    //there are diffrent schema types for diffrent type and for string we have a schema type which is trim which will remove all the whitespace from the beginning and the end of the string
    trim:true,
    required:[ true, "A tour must have a description" ], 
  }, 
  description:{
    type:String, 
    trim:true
  },
  imageCover:{
  //we will basically store just the refrence of the image in the database which is a very common practice
  //we simply leave the images somewhere in the filesystem and then put the name of the image itself in the database as a field
    type:String, 
    required:[ true, "A tour must have a cover image" ], 
  },
  image:{
  //we want to store the images as an array of strings
    type:[String],
    //more will be added soon
  },
  createdAt:{
  //this will basically be a timestamp that is set by the time that the user gets a new tour and it must be added automatically at the time the tour is created
    type:Date, 
    default:Date.now(),
    select:false
  },
  startDates:[Date],
  
});

//after creating a schema we will then create a model from the schema

//here it takes the name of the model and the schema that we created and this will return an object which we can use to make documents
const Tour = mongoose.model('Tour', toursSchema);

//we want to export the model from this file to be used in the tour controller where we will query and delete and update and create tours basically do CRUD operations.

module.exports = Tour;





//An example of the way we make documents in the controller files:

// //create a document from the model in the model file and it is like using javascript function constructor
//       const testTour = new Tour({
//         name:"the park camper" ,
//         price: 20
//       })

// //as this document is an instance of the tour model so it have a couple of methods on it that we can use in order to interact with the database.
// //this will save it to the tours collection in the database and this save here will return a promise which will give us access to the document that was just saved in the database.
//       testTour.save().then(doc=>{
//         console.log(doc)
//       }).catch(err => console.log(err));

//A second way of donig the above

//the diffrence between this way and the other way is in this one we basically called the method directly on the tour while in the first version we called the method (.save()) on the new document after creating a tour object as documents has access to this method and alot of other methods as well but in the second one we call this create method on the method it self
//Tour.create({})
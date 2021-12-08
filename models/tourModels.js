//! in this file we keep our schema and model and export the model

const mongoose = require('mongoose');


//we will use the slugify package which allows us to put a string in the url based on some string
const slugify = require('slugify');

//create a schema
const toursSchema = new mongoose.Schema(
//!we can pass in not only the object with the schema definition BUT also objects for the schema options.
{
  name:{
    type:String,
          //required or not and the error string
    required:[ true, "A tour must have a name" ], 
    unique:true
  },
  slug:{
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
  
},
{
//this here sayes that each time the data is actually outputted as JSON or Object we want virtuals to be part of thr output 
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
});

//? virtual properties are basically fields that we can define on our schema but it will not be presisted so they will not be saved into the database in order to save us some space this make sence for fields that can be derived from one another like convertions from mile to km. AND we need to explicitly define in our schema that we want the virtual properties.the downside of virtual is that we wont be able to us this virtual object in a query.

//? this virtual propertie contains the tour duration in weeks which can be converted from the duration that we already have in days
//^ we then define the get method as this virtual property will basically be created each time that we get some data out of the database and will not be presisted in the database but it is only going to be there as soon as we get data+ we didnt use arrow function as we need this keyword which couldnt get from a normal arrow function

toursSchema.virtual('durationWeek').get(function(){
  return this.duration /7;
})



//* mongoose middlewares: just like express we can use mongoose middlewares to make something happen between two events for example each time a new document is saved to database we can run a function between the save command and the acctual saving of the document thats also why mongooes middlewares are some times called pre and post hooks as we can run a function before or after an event. middlewares are defined on the schema
//? there are four types of middlewares in mongoose: document query aggregate and model.

//! 1)Document 

//? document middleware: it is a middleware that can act on the currently proccessed document
//^ this will run before an event and the event is then specified inside('')

toursSchema.pre('save',function(next){

//this will run before document is saved to the database so it will be triggered when .save() and .create() but not on insert
//^ this will return us the data that is going to the database allowing us to act on the data before it id then saved
//? we will create a slug for each of the documents
    //this contains our document and the slugify taked the string that we want to create a slug out of
      this.slug = slugify(this.name, {lower:true});
  //next to call the next middleware in the stack
  next();
})

//in post we have access to the saved document but in the callback function not by using this keyword
  // toursSchema.post('save',function(doc,next){
    
  // }
  



//after creating a schema, virtual properties , middlewares we will then create a model from the schema

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
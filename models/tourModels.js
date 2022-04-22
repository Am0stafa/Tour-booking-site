//! in this file we keep our schema and model and export the model

const mongoose = require('mongoose');


//we will use the slugify package which allows to take a copy of a certain string an make it as a kebab casing to be used in the url
const slugify = require('slugify');

const validator = require('validator');
//create a schema
const toursSchema = new mongoose.Schema(
//!we can pass in not only the object with the schema definition BUT also objects for the schema options.
{
  name:{
    type:String,
    //required or not and the error string
    required:[ true, "A tour must have a name" ], 
    unique:true,
    //trim ensure that the data entered is formated nicely eg "  abdo" will be formated into "abdo"
    trim:true,
    maxlength:[255, "Tour name must not have more than 255 characters"],
    minlength:[5, "Tour name must have more than 5 characters"],
  //   validate: {
  //     validator: (val) =>
  //         validators.isAlpha(val, ["en-US"], { ignore: " " }),
  //     message: "A tour must only  contain characters",
  // }
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
    //! we only want the dificulty to be between only three values to we will make an enum just like in java
    //! an array which all the possible values 
    enum:{
      values: ['easy', 'medium', 'difficult'],
      message:'dificulty is either :easy, medium, difficult'
    }
  },
    //thoes ratings are going to be calculated from the real reviews
  ratingAverage:{
    type:Number,
    default:4.5,
    min:[1, "rating must be above one"],
    max:[5,"rating must be below 5"]
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
    //^ a validator is just a function which return either true or false and in case it returns false then it means that there is an error and if true that means that the validation is correct and the input can be accepted, no arrow function to use this keyword
    //*if the price discount is lower than the price itself
  validate:{
  
    validator:function(value){ 
      //! this keyword point to the current document when we are creating a new document so it wont work on update
      return value < this.price //100 < 200 return true so no validation will be triggered
      //custom message
    },
    message:'dicount is larger than the price'
  
  }
  },
  summary:{
    type:String,
    //there are diffrent schema types for diffrent type and for string we have a schema type which is trim which will remove all the whitespace from the beginning and the end of the string
    trim:true,
    required:[ true, "A tour must have a description" ]
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
  secretTour:{
    type:Boolean, 
    default:false,
  },
    startLocation:{
      //^ mongodb support geospecial data the latitude and longitude and mongodb used special data called GeoJSON
      type:{
        type:String,
        default:'Point',
        //! an array which all the possible values
        //! el gowa el enum bas el y2dar y5osh gowaha
        enum:['Point']
      },
      //* an array of numbers
      coordinates:[Number],
      address:{
        type: String
      },
      description: String
    
    },
    //! it is an embedded object so it must be an array of objects
     locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    //!refrence model
    guides:[
      {
      //! it will just contain the ids of the tour guid
        type:mongoose.Schema.ObjectId,
        ref:'User'
      }
    ]
  
  
},
{
//! this here sayes that each time the data is actually outputted as JSON or Object we want virtuals to be part of thr output 
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
});

//! setting indexing for fast search
toursSchema.index({price:1,ratingsAverage:1})

//? virtual properties are basically fields that we can define on our schema but it will not be presisted so they will not be saved into the database in order to save us some space this make sence for fields that can be derived from one another like convertions from mile to km. AND we need to explicitly define in our schema that we want the virtual properties.the downside of virtual is that we wont be able to us this virtual object in a query.

//? this virtual propertie contains the tour duration in weeks which can be converted from the duration that we already have in days
//^ we then define the get method as this virtual property will basically be created each time that we get some data out of the database and will not be presisted in the database but it is only going to be there as soon as we get data+ we didnt use arrow function as we need this keyword which couldnt get from a normal arrow function


//! vid
toursSchema.virtual('durationWeek').get(function(){
  return this.duration /7;
})

//! to get access to all the reviews of certain tour without child refrencing
//! the query that you want it to be on populate it first
toursSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',//^ mesameyeno eh henak "forgein key"
  localField:'_id'//^ mesamyeno eh hena "primary key"
})

//* mongoose middlewares: just like express we can use mongoose middlewares to make something happen between two events for example each time a new document is saved to database we can run a function between the save command and the acctual saving of the document thats also why mongooes middlewares are some times called pre and post hooks as we can run a function before or after an event. middlewares are defined on the schema
//? there are four types of middlewares in mongoose: document query aggregate and model.

//! 1)Document vid

//? document middleware: it is a middleware that can act on the currently proccessed document
//^ this will run before an event and the event is then specified inside('')

toursSchema.pre('save',function(next){
  
  //^ this will run before document is saved to the database so it will be triggered when .save() and .create() but not on insert
  //^ this keyword will return us the data that is going to the database allowing us to act on the data before it id then saved
  //? we will create a slug for each of the documents
      //^ this contains our document and the slugify taked the string that we want to create a slug out of
        this.slug = slugify(this.name, {lower:true});
    //* next to call the next middleware in the stack
    next();
})

//! for embedding the user by iterating over the array an getting all the users and the array only contain the ids
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
// //* as we will have an array of promises so we must resolve them  
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });


//! 2)Query middleware

//* the use case that we are going to implement here is that we want to have secret tours in our database for vip people hence we dont want to appear in the result output so we will make it so that it only query for tours that are not secret. 

//^ a problem that we will face is that this will only work with find not ex findOne find... so to solve this problem we used regular expretion to make it work with any thing containg find

toursSchema.pre(/^find/,function(next){
  //the diffrence so fare is that the this keyword is now pointing to a query no a document
  
  //this will manipulate the queryString removing all the secret tours 
  this.find({ secretTour:{ $ne:true } });
  this.start = Date.now();
  
  next();
})

toursSchema.pre(/^find/,function(next){
  this.populate({path:'guides',select:'-__v -passwordChangedAt'});
  //! Rather than having the populate on every query like this we make a query middleware
  next()
})


//* here we are making a clock that calculate how long it will take to execute the query

toursSchema.post(/^find/,function(docs,next){
  //^ here the this keyword will return us all the documents that will return from the query as the query has been finished.
  //! in post we cant use this insted it will pass us the document that had been saved (docs)
  console.log(`Query took ${Date.now() - docs.start} milisec`);
  
  next();
});


//! aggregation middleware

//*we also want to execlude all the secret tours from the aggrigation as well

toursSchema.pre('aggregate',function(next) {

  //^ this.pipeline() return us the aggrigation pipeline which is the array which we passed into the aggregate function
  //^ unlike the find to filter out the secret tours we will add another match stage at the beginning of the pipeline array
  //^ it is fine to as many match stages.
  this.pipeline().unshift({ $match:{secretTour:{ $ne:true }} }) ; 
  
  next();
});






//after creating a schema, virtual properties , middlewares we will then create a model from the schema

//here it takes the name of the model and the schema that we created and this will return an object which we can use to make documents
const Tour = mongoose.model('Tour', toursSchema);
//this represent the instance of that collection so that we can use this to make all the diffrent requests


//we want to export the model from this file to be used in the tour controller where we will query and delete and update and create tours basically do CRUD operations.

module.exports = Tour;











//An example of the way we make documents in the controller files:

 //create a document from the model in the model file and it is like using javascript function constructor
//       const testTour = new Tour({
//         name:"the park camper" ,
//         price: 20
//       })

 //as this document is an instance of the tour model so it have a couple of methods on it that we can use in order to interact with the database.
 //this will save it to the tours collection in the database and this save here will return a promise which will give us access to the document that was just saved in the database.
//       testTour.save().then(doc=>{
//         console.log(doc)
//       }).catch(err => console.log(err));

//A second way of donig the above

//the diffrence between this way and the other way is in this one we basically called the method directly on the tour while in the first version we called the method (.save()) on the new document after creating a tour object as documents has access to this method and alot of other methods as well but in the second one we call this create method on the method it self
//Tour.create({})

//we will import the tour model here which we made after creating the schema in the models file and this will be used to do CRUD opertaions 
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModels')
const catchAsync = require('./../utils/catchAsync')
const APIFeatchers = require('./../utils/apiFeatures')
const multer = require('multer')
const sharp = require('sharp');

//middelware that interrupt the request from the tourRout for the well known routes to change the fields
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = async (req, res) => {

  try{

//?2)Execute the query
//* we will first create an instance of the APIfeachers which contain the functions needed and we have accesee to nesting as we returned this in every method
  const featers = new APIFeatchers(Tour.find(),req.query)
       .filter()
       .sort()
       .limit()
       .paginate()
       
  //^ to get access to the query we build inside the class
  const tours = await featers.query;
  //and finally will return our tours

//?3)send the responce
  res.status(200).json({
    status: 'success',
    results: tours.length,
      data: {
        tours   
      }
  });
  }
  catch(e) {
    res.status(404).json({
      status:"faild",
      message:e.message
                                                                                      
    })
  }
};

exports.getTour =async (req, res,next) => {
 
  try{
    //^ here it will take req.params.the name of the route in the route file and findById only expect to take the id we are  looking for
    
    //! Rather than having the populate on every query like this we make a query middleware:
    //.populate({path:'guides',select:'-__v -passwordChangedAt'})
    //? and put here only the populate that you want it to appear only on this query: here we want it to appear only when selecting one
    const tour = await Tour.findById(req.params.id).populate('reviews');
    
    //& findById works the same way as 
    //& Tour.find({ _id:req.params.id })
    
    //^ to handel the error mentioned below
    if(!tour) throw new AppError("invaild id", 404)
    
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  
  
  }catch(err){
    next(err)
    // res.status(404).json({
    //   status:"faild",
    //   message:err
    
    // })
    //! here we have a logical error which is that only when we pass invalid query params which mongooes wont be able to recognize only then it will throw an error, but if we passed an invalid id it will run successful but returning null.
  }


};



exports.createTour = async (req, res,next) => {
  // console.log(req.body);
  try{
  
   const newTour = await Tour.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
});
}
//in this we catch the data validation error
catch(err){
  
  //this here is a cleaner way of doing this
  
  next(err);
  
  // res.status(400).json({
  //   status: 'error',
  //   message: err.message,
  //   anotherMassage:"invalid data send!"
  // })
 
}

};

exports.updateTour = async (req, res,next) => {


try{
  //* we basically want to query for the document that we want to update and then update the tour based on an id
  //* with mongooes we can do all of that in one command
  
  //! here it taked three params 1st: querery , 2nd:the data that is going to be updated and this data can be found in the body , 3rd: some other options check the options on the documnetation.  
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    //so when updating it will follow our data validation that is set in our schema
    runValidators: true
  });
  if(!tour) throw new AppError("invaild id", 404)

    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });

}
  catch(err){
    next(err)
    // res.status(400).json({
    //   status: 'error',
    //   message: err.message,
    //   anotherMassage:"invalid data send!"
    // })
    
  }
};

exports.deleteTour = async (req, res,next) => {

try{
  const tour = await Tour.findByIdAndDelete(req.param.id,req.body);
  if(!tour) throw new AppError("invaild id", 404)

//it is common that when deleteing that we dont send back any data to the client and the 204 is a standered
    res.status(204).json({
      status: 'success',
      data: "delete successful"
    });

}catch(err){

  next(err);
  // res.status(404).json({
  //   status: 'error',
  //   message: err.message,
  //   anotherMassage:"invalid data send!"
  // })

}


};

//!using aggrigation pipeline I made a function which calculate a couple of statistics about our tours


//& important disclaimer the $ is used beside the operators and along with operator followed a document only'$doc_name'


exports.getTourStats = async (req, res) => {
    //after this one we need to add a new route
    
    
  try{
    //aggregate is a bit like a normal query but the diffrence is that we can manipulate the data
    //we pass the aggrigate function which //? firstly takes an array of so called stages which will contain many states and then the document pass throug these stages one by one step by step in the defined sequence as we define it
    const stats = await Tour.aggregate([
    {
     //match is to select or to fillter certain documents just like the filter function in mongo.
      $match:{ratingAverage: {$gte: 4.5}}//that is the first state
    },
    {
     //the next stage is the group stage
     //it allow us to group documents together using accumulator and an accumulator is for example calculating an average 
     $group:{
      //^what we will do here is caluclate the average rating ,average price, minPrice ,maxPrice...
      //?the first thing we need to specify is the id as this is where we are going to specify what we want to group by
      
      _id:{$toUpper:'$difficulty'}, 
      //calculating the average
      //^ the avg,min is an mathicamtical opertaor which we pass to it the field name between ''
      avgRating:{$avg:'$ratingAverage'},
      avgPrice:{$avg:'$price'},
      minPrice:{$min:'$price'},
      maxPrice:{$max:'$price'},
      numRatings:{$sum:'$ratingQuantity'},
      numOfTours:{$sum:1}//!we will basically add one to each of the documents that is going to go throug this pipeline
     }
    },
    {
      //&which field to sort by and now we will no longer be able to use the old documents name we will only be able to use the name specified above
      $sort:{avgPrice:1 }
    },
      
    
    
    ]); 
    
    //sending the result
    res.status(200).json({
      status: 'success',
      data: {
        stats:stats
      }
    });
  
  
  }catch(err){
    res.status(404).json({
      status: 'error',
      message: err.message,
      anotherMassage:"invalid data send!"
    })
  }
  
}

//! I highly recommend watching video 102 again as it is very triky

//this is another aggrigation pipeline to find out the busiest month in the year
//we basically want to count how many tours there are for each of the month in a given year
//! we will do that with the help of start dates in our database which contain for each tour the monthes that it started so for example we may have one tour which have starting date in month 04 06 and the second tour has starting date in month 01 06 so we will be able to conclude that there are two tours in month 06

exports.getMonthlyplan = async (req, res) => {
  
  try{
    //? we difiend a variable in the url and this is how to get it and transform it into a number.
   const year= +req.params.year;
    
   const plan = await Tour.aggregate([
   {
   //? the easiest way would basically be to have one tour for each of these dates
   $unwind:'$startDates'
   //^ unwind basically deconstruct an array field from the impoted doument and then output one document for each element of the array elements so we will have one tour for each of these dates in the array so basically repete the douments for each element in the array
   
   },
   {
   //? select the doucments for the year that was passed in
   $match:{
   //* we want it to be between 2021 so it must be between jan 1 and dec 31
    startDates:{
    //! AND is denoted by ,
        $gte: new Date(`${year}-01-01`),
       $lte: new Date(`${year}-12-31`)
        
   }
   
   }
   
   },
   {
    //it is used for calculation
    $group:{
      //! now we want to group them by the month but currently we have the entire date
      //! so from the mongodb aggregation operators documntation we have an date expretion operator which conitain an operaor called $month which extract the month out of our data 
    _id:{$month:'$startDates'},//group by this expretion,
    
    //how many tours start in this month 
    numTourStarts:{$sum:1},
    //which tour, this must be an array as how else would we specify two or three diffrent tours in one fields so we will push in the array the name field as each document goes through this pipeline
    tours:{$push:'$name'},
    
    }
  
   
   },
   
   {
   //this is to and onther field just like the id above but with diffrent name and make as a new spearate field
    $addFields:{month:'$_id'}
   },
   {
   //after making the above field now we no longer need the id fe 7aga so to remove it use project which take 1 and 0 to either show or not
   $project:{_id:0}
   },
   {
    $sort: { numTourStarts: -1 }
  },
  {
    $limit: 12
  }
   
   
  ]);
  
  //sending the result
   res.status(200).json({
    status: 'success',
    results: plan.length,
    data: {
      plan:plan
    }
  });
  
  
  
  
  }catch(err){
    res.status(404).json({
      status: 'error',
      message: err.message,
      anotherMassage:"invalid data send!"
    })
  }

}

//! this feature so for if you want to know which tours are within circle with specified distance and unit
exports.getToursWithin =catchAsync(async (req, res, next) => {
    //& first we need to get our paramerters
    const {distance,latlng,unit} = req.params;
    //& then we exepet the latlng to contain cordinated
    const [lat,lng] = latlng.split(",");
    
    //& as it expect the radius in radiant which = distance/radius of the earth in miles or km
    radiant = unit === 'mi'? distance/3963.2 : distance/6378.1;
    
    if(!lat||!lng){
       next(new AppError('Please enter your correct coordinates'),400);   
    }
  
    //! we need to find tours inside a circle that starts at this point that we defined (latlang) and which have a radius of the distance that we defined (distance)BUT in need to be in radiant. so we need to pass this information to &geoSpatial option
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radiant] } }
    });  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data:tours
      }
    });
    
  //! we finally need to index the attributes which has the geoSpatial data is stored into 2dsphere
})


//! if we want to know the exact distances of all the tours from a specific starting point like (user location)
exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng,unit} = req.params;    
    //& then we exepet the latlng to contain cordinated
    const [lat,lng] = latlng.split(",");

    if(!lat||!lng){
       next(new AppError('Please enter your correct coordinates'),400);   
    }
    
    //& to convert the result that we get in meters to miles OR km
    meterTomk = unit === 'mi' ? 0.000621371 : 0.001;

    
   //& for geoSpatial data we only have one single stage called geonear which require one of our fields to be geospatial index
   const distances = await Tour.aggretage([
    {
      $geoNear:{
       near:{type:point,coordiantes:[lng*1,lat*1]}, //^ which is the point from which to calculate the distances so all disances will be calculated from this point to the start location AND we need to pass it geoJSON
       
       distanceField:'distance',//^ this is the field that will be created and where all the calculate distances will be stored so we will simply call it distance and IT WILL BE in meters so we need to convet it
       
       distanceMultiplier:meterTomk//^ for convertion
       
      }
    
    },//* as the above will return alot of thing but we only want to this to we use project to specify what we want to keep
    {
     $project:{
      distance:1,
      name:1
     }
     //^ now we got rid of all the other data
    }
   ])
   
   
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });


})


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};


//& this middleware will also put teh file and some information about the file on the request object
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourPhoto = upload.fields([{name: 'imageCover', maxCount: 1}, {name: 'image', maxCount: 3}]);

exports.resizeTourPhoto = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  //* 1) imageCover
  const coverName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${coverName}`);
  
  //^ so that the name is persisted in the database when updating we simple add the name to the body
  req.body.imageCover = coverName;
  
  
  //* 2) images
  req.body.image = []
  
  promimseArray = req.files.image.map(async (file,index)=>{
    const name = `tour-${req.params.id}-${Date.now()}-${index+1}.jpeg`;

    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${name}`);
      
    req.body.image.push(name)
  })
  await Promise.all(promimseArray);
  
  next();
});

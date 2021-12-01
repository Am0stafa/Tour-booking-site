
//we will import the tour model here which we made after creating the schema in the models file and this will be used to do CRUD opertaions 
const Tour = require('./../models/tourModels')
  
//middelware that interrupt the request from the tourRout for the well known routes to change the fields
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
//getting the api featurs class which contain the query functions filter , sort , limit , paginate
const APIFeatchers = require('./../utils/apiFeatures')


exports.getAllTours = async (req, res) => {

  try{

//?2)Execute the query
//we will first create an instance of the APIfeachers which contain the functions needed and we have accesee to nesting as we returned this in every method
  const featers = new APIFeatchers(Tour.find(),req.query)
       .filter()
       .sort()
       .limit()
       .paginate()
       
  //to get access to the query we build inside the class
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

exports.getTour =async (req, res) => {
 
  try{
    //here it will take req.params.the name of the route in the route file and findById only expect to take the id we are  looking for
    const tour = await Tour.findById(req.params.id);
    //findById works the same way as 
    //Tour.find({ _id:req.params.id })
    
    
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  
  
  }catch(err){
    res.status(404).json({
      status:"faild",
      message:err
    
    })
  }


};

exports.createTour = async (req, res) => {
  // console.log(req.body);
  try{
  
   const newTour = await Tour.create(req.body);
  
  
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
});}


//in this we catch the data validation error
catch(err){
  
  res.status(400).json({
    status: 'error',
    message: err.message,
    anotherMassage:"invalid data send!"
  })
  
  //
}

};

exports.updateTour = async (req, res) => {


try{
  //we basically want to query for the document that we want to update and then update the tour based on an id
  //with mongooes we can do all of that in one command
  
  //here it taked three params 1st: querery , 2nd:the data that is going to be updated and this data can be found in the body , 3rd: some other options check the options on the documnetation.  
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });

}
  catch(err){
    res.status(400).json({
      status: 'error',
      message: err.message,
      anotherMassage:"invalid data send!"
    })
    
  }
};

exports.deleteTour = async (req, res) => {

try{
  const tour = await Tour.findByIdAndDelete(req.param.id,req.body);

//it is common that when deleteing that we dont send back any data to the client and the 204 is a standered
    res.status(204).json({
      status: 'success',
      data: "delete successful"
    });
  



}catch(err){

  res.status(400).json({
    status: 'error',
    message: err.message,
    anotherMassage:"invalid data send!"
  })

}


};

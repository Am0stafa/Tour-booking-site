
//we will import the tour model here which we made after creating the schema in the models file and this will be used to do CRUD opertaions 
const Tour = require('./../models/tourModels')
  
//middelware that interrupt the request from the tourRout for the well known routes to change the fields
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {

  try{
  
//?1)Build the query 
  
  
      //!A)--filtring
      
   //express provide us this req.query which retun to us the querys that we put on the link as an object     
  //here we need a hard copy of the req.query object and we cant simple make a variable equal to it since the variable will be a refrence to it so a trick we can do is by destrcuring and putting it into a new object
  const querObj = {...req.query};
  const restricted = ['page', 'sort', 'limit', 'fields'];
  
  //in this function we looped on the array and for each element if this element name exist as a key in the object we will delete it
    const removerest = ()=>{
      for( let i = 0; i < restricted.length; i++)                           
        delete querObj[restricted[i]];
    };
    removerest();
    

      //!B)--advanced filtring
  //the problem we have is that mongoose filter the data in this way {duration:{$gte:5}}
  //And req.query send us the data in this way {duration:{gte:'5'}}
  //So what we want to do is convert it so that we can use it for querying
  
  //first up we will convert this object into String object 
  let queryJSON = JSON.stringify(querObj);
  //using regex we will replace each one then save it in the variable
  queryJSON = queryJSON.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//we need to parse it back into a js object
    
 //getting the data from the Tours model that we created which contain documents. and quering them based on the queries provided on the links after the ?
//this one will be used again for futher quering
let query = Tour.find(JSON.parse(queryJSON));
  
    //!C) Sorting
    
    //^we basically sort by ?sort=price,age,-id (minus here means descending)
    //in sorting we can have more than one criteria and it will be passed to us in that way {price,age} but to use it in mongoose we need it to be in this way{sort('price age')} //!need to be passed as a string separated by space
    
    if(req.query.sort){
    //*what we will do is first split it by comma which will put them into an array then join them by space
      //req.query.sort so it will be passed by value not refrence.
      const sortBy=req.query.sort.split(',').join(' ');
    
      query = query.sort(sortBy);
    
    }
    
    
   //!D) field limiting
       //^we basically filter by ?fields=price,-age,name (minus here means execlude)
    //in projecting(selecting) we need it to be done in this way (query.select('name price age')) separated by a space but it it is passed to us in this way {price,raingsAverage}  //!need to be passed as a string separated by space
    if(req.query.fields){
      const fields = req.query.fields.split(',').join(' ');
      query = query.sort(fields);
    }
    

  //&we also have a way of execluding sensitve data directly from the schema by making the select property to false 
  
  
  //!E) pagination
      //^we can limit the number of results per page by ?page=2&limit=10 this means that results from 1 to 10 are in page 1 and 11 to 20 are in page 2, 21-30 page 3 and so on so we need to skip 10 results so we need to calculate the skip and the limit based on the page and the limit from the query string along with defining default values as we need pagination even if the user doesnt specify any page or any limit.
      
  const page = req.query.page*1 || 1; 
  const limit = req.query.limit*1 || 100;
  const skip = (page-1)*limit;  
  query = query.skip(skip).limit(limit);
  
  //validation in case the user tried to access a page that doesnt exist
  if(req.query.page){
  //*if the number of documents that are skiped is grater than the number of documents that actually exist that mean that the page doesn't exist
    const numToursDoc = await Tour.countDocuments();
    if(skip>numToursDoc)
      throw new Error('this page does not exist');//this error will be caught in the try catch block
  }
  
  
  //!so to sum up what we did above is I)FIND to filter II)SORT III)LIMITATION for selecting certain fields IV)pagination
  
//?2)Execute the query
  const tours = await query;
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

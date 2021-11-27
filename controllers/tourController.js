
//we will import the tour model here which we made after creating the schema in the models file and this will be used to do CRUD opertaions 
const Tour = require('./../models/tourModels')



// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.getAllTours = async (req, res) => {

  try{
  
  //1)Build the query 
  
  
      //--filtring
      
   //express provide us this req.query which retun to us the querys that we put on the link as an object     
  //here we need a hard copy of the req.query object and we cant simple make a variable equal to it since the variable will be a refrence to it so a trick we can do is by destrcuring and putting it into a new object
  const querObj = {...req.query};
  const restricted = ['page', 'sort', 'limit', 'fields'];
  
  //in this function we looped on the array and for each element if this element name exist as a key in the object we will delete it
    const removerest = ()=>{
      for( var i = 0; i < restricted.length; i++){ 
                                   
       delete querObj[restricted[i]];
    }
    };
    removerest();
    

      //--advanced filtring
  //the problem we have is that mongoose filter the data in this way {duration:{$gte:5}}
  //And req.query send us the data in this way {duration:{gte:'5'}}
  //So what we want to do is convert it so that we can use it for querying
  
  //first up we will convert this object into json object 
  let queryJSON = JSON.stringify(querObj);
  //using regex we will replace each one then save it in the variable
  queryJSON = queryJSON.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//we need to parse it back into a js object



 //getting the data from the Tours model that we created which contain documents. and quering them based on the queries provided on the links after the ?
//IMPORTANT we divide them into to since we can only have access to the callback function after awating it.

  const query = Tour.find(JSON.parse(queryJSON));
  
//2)Execute the query
  const tours = await query


//3)send the responce
  res.status(200).json({
    status: 'success',
    results: tours.length,
      data: {
        tours   
      }
  });}
  catch(e) {
    res.status(404).json({
      status:"faild",
      message:e
                                                                                      
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
      message:e
    
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

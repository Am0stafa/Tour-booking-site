const AppError = require("../utils/appError");

 //* we will pass it 4 arguments so that express know that it's an error handling middleware and call it when there is an error
module.exports = (err, req, res, next)=>{
  
    //* as we have all sort of error status code so we will read the status code from the error object that we create also we want to  define a default as there will be errors that are not comming from us and without status code
    
    err.statusCode = err.statusCode ?? 500;
    err.status = err.status ?? 'error'; //as error is when we have a 500 and fail when we have a 400
        
    if(process.env.NODE_ENV === 'development') 
       sendErrorDev(err, res);
    else if (process.env.NODE_ENV === 'production'){
      //to take a copy not a refrence
      let ourError = {...err}
      
      //a problem that we have is that an error from mongodb will be not be marked as operational although it is and we dont want it to be send to user as programming error so to solve this problem we can use a err.name 
      if(err.name === 'CastError')
      ourError = handelCastErrorDB(ourError);
      //duplicate values also have diffrent sign in this case the code
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
      
      
      sendErrorProd(ourError,res);
    
    
    }
       
}
//! we want to distingues between the errors in devlopment and errors in production to send out different data

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
//^ if we are in production we want to leck as little information as possible

const sendErrorProd = (err, res)=>{
//* we want to send operational erros only (invalid path) && database problems                           
  if(err.isOperational){
  res.status(err.statusCode).json({
    status: err.status, 
    message: err.message,
  });
 }
//* programming or other unknown error:we don't want to leak error details(await without async)
 else{
    console.error('Error');
 
    res.status(err.statusCode).json({
      message:"something went wrong",
      status:"error"
        
    });
  }

}

//* this function takes the error as an input and output a new AppError message which contain the is operational to true
const handelCastErrorDB = (err)=>{
  let message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message,400);
};

const handleDuplicateFieldsDB = err => {
  //when it return it will return an array conting usless data execpt for the first one 
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
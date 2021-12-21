//! this is a class that inherits from error and make a custom error class to add more stuff
class AppError extends Error {
    constructor(message, statusCode) {
      super(message)
      //* we make this variable so that later we can then test for this property and only send error message back to the client for these operational errors
  
      this.statusCode = statusCode;
      //to transform it into string
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      //we by defalut set the isOperational to true to distingues between operational error which will by defalt get this as true and other programming errors
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
    
  }
  
  module.exports = AppError;
  

//insted of using 
 // const err = new Error(`this route ${req.originalUrl} is either not defined or you cant access it ` );
  //   err.status = "fail";
  //   err.statusCode = 404;
    
   // error.message = `this route ${req.originalUrl} is either not defined or you cant access it ` //this can also be passed in the constractor.
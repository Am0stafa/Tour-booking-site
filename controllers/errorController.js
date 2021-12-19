 //* we will pass it 4 arguments so that express know that it's an error handling middleware and call it when there is an error
module.exports = (err, req, res, next)=>{
  
    //* as we have all sort of error status code so we will read the status code from the error object that we create also we want to  define a default as there will be errors that are not comming from us and without status code
    
    err.statusCode = err.statusCode ?? 500;
    err.status = err.status ?? 'error'; //as error is when we have a 500 and fail when we have a 400
        
        res.status(err.statusCode).json({
          status: err.status, 
          message: err.message,
         // useless:"this error has been handeled by the middleware"
        });
}
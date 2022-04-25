const mongoose = require('mongoose');
const dotenv = require('dotenv');
//this must be above the app to avoid errors
dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

//connecting out database to express app

//the second argument here just some options to deal with deprecation waring and they are kind of the standers in any project just copy and past them.
//this will return a promise so we need to handel it, and this promise here actully get access to a connection object
mongoose.connect(DB , {
  useNewUrlParser:true,
  useCreateIndex:true, 
  useFindAndModify:true, 
  useUnifiedTopology: true
}).then(con => {
//this line has access to the password
//  console.log(con.connections);
  console.log("DB is connection successful");
}).catch(err=>{
  console.log(err)
  server.close(()=>{
    //here it takes a code 0 for successful 1 for failed
    process.exit(1)
  })
});


//here we want to handel any promise rejection that we might not catch like database failed to conncet so it is a "safety net"
//* we are basically listening to unhandled Rejection event which allow us to handel all the errors that occur in ASYNCHRONOUS 
process.on('unhandledRejection', (err)=>{
  console.log(err.name +" "+ err.message)
  console.log('unhandled rejection. process termination')
  //! we want to termenate the application after that
  //^ this is a less aggressive way of closing the server as we will give the server time to finish all the request that are still pending or being handled at the time.
  server.close(()=>{
  //here it takes a code 0 for successful 1 for failed
    process.exit(1)
  })
  
});


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

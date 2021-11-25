const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

//connecting out database to express app

//the second argument here just some options to deal with deprecation waring and they are kind of the standers in any project just copy and past them.
//this will return a promise so we need to handel it, and this promise here actully get access to a connection object
mongoose.connect(DB , {
  useNewUrlParser:true,
  useCreateIndex:true, 
  useFindAndModify:true
  
}).then(con => {
//this line has access to the password
//  console.log(con.connections);
  console.log("DB is connection successful");
});





const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

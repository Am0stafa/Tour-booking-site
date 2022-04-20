//this is a scrip file that will run independent from the application
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModels')

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

//connecting out database to express app

//the second argument here just some options to deal with deprecation waring and they are kind of the standers in any project just copy and past them.
//this will return a promise so we need to handel it, and this promise here actully get access to a connection object
mongoose.connect(DB , {
  useNewUrlParser:true,
  useCreateIndex:true, 
  useFindAndModify:true
  
}).then(() => {
  console.log("DB is connection successful");
});


//start by reading the JSON file
//as this will return JSON and we need it as an array for insertion
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

//the function which will import the data into the database
const importData = async () => {

    try{
    //the create function not only take object but also accepts an array of objects and in that case it will create a new document for each of the array
      await Tour.create(tours)  
        console.log("data successful loaded!")
    }catch(err){
        console.log(err);
    }finally{
        //this here is an aggressive way of termenating a process
        process.exit();
    }

}

//A script tha delete all data from a collection

const deleteData = async () => {

    try{
    
        await Tour.deleteMany();
        console.log("data deleted successfully")
    }catch(err){
        console.log(err);
    }finally{
        //this here is an aggressive way of termenating a process
        process.exit();
    }


}
//this file alone wont do any thing so to execute we will do that in the terminal

//to be able us make use of this terminal application we have a function called process.argv that return an array and this array contain data such as the location of the file name that we specified when running this application on the terminal as so we can add another arrgument beside the file name like we did when for example installing a dev dependence we did --div-dependence and so if we add another element to the end of the line node (file name) --(arrgument) we can have access to it form the console.log(process.argv) as it will be put in the array.

//so it will add the data if we specify --insert and delete if we specify --delete

if(process.argv[2]==='--insert'){
    importData();
}
else if(process.argv[2]==='--delete'){
    deleteData();
    
}
else{
    console.log("insert a valid data either --insert OR --delete")
    process.exit();
}
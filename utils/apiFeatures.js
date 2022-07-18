class APIFeatchers{
  //^what we will pass in our constractor in the mongoose query which is created from the tours model so we will pass it like this eg.(Tours.find()) to create a basic query and also the query string that we get from express the req.query which is available only in the req res cycle
    constructor(query , queryString){
    //*we are passing the query here because ww dont want to query inside of the class as this will bound this class to the tour resource which will not make it as reusable  
      
      this.query = query;
      this.queryString = queryString;
      
    }
    //?1)Build the query 
    
  filter(){
            //!A)--advanced filtring
        
     //express provide us this req.query which retun to us the querys that we put on the link as an object which will be passed as an argument to the function  
    //here we need a hard copy of the req.query object and we cant simple make a variable equal to it since the variable will be a refrence to it so a trick we can do is by destrcuring and putting it into a new object
    const querObj = {...this.queryString};
    const restricted = ['page', 'sort', 'limit', 'fields'];
    
    //in this function we looped on the array and for each element if this element name exist as a key in the object we will delete it
      const removerest = ()=>{
        for( let i = 0; i < restricted.length; i++)                           
          delete querObj[restricted[i]];
      };
      removerest();
    
    
  
    //the problem we have is that mongoose filter the data in this way {duration:{$gte:5}}
    //And req.query send us the data in this way {duration:{gte:'5'}}
    //So what we want to do is convert it so that we can use it for querying
    
    //first up we will convert this object into String object 
    let queryJSON = JSON.stringify(querObj);
    //using regex we will replace each one then save it in the variable
    queryJSON = queryJSON.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);//we need to parse it back into a js object
      
   //getting the data from the query provided from the user model that we created which contain documents. and quering them based on the queries provided on the links after the ?
  //this one will be used again for futher quering
     this.query =  this.query.find(JSON.parse(queryJSON));
      
      //this here means the entire object which has access to these other methods so that we can then call them also to be able to use multiple functions nested
      return this
  }
    
    
  sort(){
    
        //!B) Sorting
      
      //^we basically sort by ?sort=price,age,-id (minus here means descending)
      //in sorting we can have more than one criteria and it will be passed to us in that way {price,age} but to use it in mongoose we need it to be in this way{sort('price age')} //!need to be passed as a string separated by space
      
      if(this.queryString.sort){
        //*what we will do is first split it by comma which will put them into an array then join them by space
          const sortBy=this.queryString.sort.split(',').join(' ');
        
          this.query = this.query.sort(sortBy);
        
        }
        
      return this;
    }
  
  limit(){
  
     //!C) field limiting
         //^we basically filter by ?fields=price,-age,name (minus here means execlude)
      //in projecting(selecting) we need it to be done in this way (query.select('name price age')) separated by a space but it it is passed to us in this way {price,raingsAverage}  //!need to be passed as a string separated by space
      if(this.queryString.fields){
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      }
      
  
    //&we also have a way of execluding sensitve data directly from the schema by making the select property to false 
    
    return this
   }
   
  paginate(){
  
    //!D) pagination
        //^we can limit the number of results per page by ?page=2&limit=10 this means that results from 1 to 10 are in page 1 and 11 to 20 are in page 2, 21-30 page 3 and so on so we need to skip 10 results so we need to calculate the skip and the limit based on the page and the limit from the query string along with defining default values as we need pagination even if the user doesnt specify any page or any limit.
        
        const page = this.queryString.page*1 || 1; 
        const limit = this.queryString.limit*1 || 100;
        const skip = (page-1)*limit;  
        this.query = this.query.skip(skip).limit(limit);
        // start from = skip
        // end at = limit
    
    
          // validation in case the user tried to access a page that doesnt exist
        // if(this.queryString.page){
          // if the number of documents that are skiped is grater than the number of documents that actually exist that mean that the page doesn't exist
        //   const numToursDoc = await Tour.countDocuments();
        //   if(skip>numToursDoc)
        //     throw new Error('this page does not exist');//this error will be caught in the try catch block
        // }
        
        
        //!so to sum up what we did above is I)FIND to filter II)SORT III)LIMITATION for selecting certain fields IV)pagination
        
        return this
  } 
  
  
  }
  module.exports = APIFeatchers;

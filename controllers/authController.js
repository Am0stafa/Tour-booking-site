//? in this file, we will have everything related to authentication

const User = require('../models/userModel')
//? rather than surounding with try catch block
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');



exports.signup = catchAsync(async (req, res, next) => {
        //! insecure  
    //^anything the user specify will be stored so no user can sign in as admin
   //! const newUser = await User.create(req.body)
        //! secure
    //^with this code we basically only allow the data that we actually need to be put into the new user so even if the user tried to manually input a role we will not store that onto the user now to be an admin you must go to the database and specify that or make a route to create an admin
    const newUser = await User.create({name:req.body.name, 
                                       email:req.body.email,
                                       password:req.body.password,
                                       passwordConfirm:req.body.passwordConfirm,
                                       role:req.body.role});
    //*automatically sign in
                                      
    //creating the token by making the payload the id of the user and the securet to be a secret string from the .env, and object of options such as expire time to logout the user after cirtain time as this token wont be valid after time pass also from .env
    const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE_IN,
    })
    //now send it to the client
    //and now the client must save this token
    
    res.status(201).json({
        status: 'success',
        token:token,
        data:{
            user:newUser
        }
    })

});

exports.login = catchAsync(async (req, res, next) => {
    //!by logging in we mean to sign a JWT and send it to the client ONLY if the user exist and the password is correct
    
    // const email = req.body.email;
    // const password = req.body.password;
    const {email ,password} = req.body;
    
    //^ 1)check if email and password are entered by the user
    if(!email || !password){
       //create a new custom error
       return next(new AppError('please provide email and password',400));
    }
    //^ 2)check if the user email and the password is correct: we make it as one so that the attacker wont know which is incorrect
    //find el column el esmo email bel email da and as the password is made not selected so we select it
    const user = await User.findOne({email:email}).select('+password')
    
    //? check if the password is the same by hasing the input and comparing both and this is done in the model by an instance method that we created
     
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError('incorrect email or password'),401);
    }


    //^ 3)finally if there is no errors at all we generate the token and send it 
    
    const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE_IN,
    })
    
    
    res.status(200).json({
        status: 'success',
        token 
    })

});



//! middleware function to protect certain routes from access incase the user is not logged in 
exports.protect = catchAsync(async (req, res, next) => {
    let token =''; 
    
    //^ 1)Get the token and check if its there
        //? there is a stander when sending JWT in the request header which is to name the key as authorization and the value to start with bearer
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            //* only in that case we want to save the token and to remove bearer split the array and take the second half
             token = req.headers.authorization.split(' ')[1]; 
        }
        //? and if the token doesnt exist we want to create a new error
        if(!token) return next(new AppError('You are not logged in please log in to get access',401))
     
    //^ 2)Validate the token by checking the signature if it is the same therefore check if it is valid or not so bacially a token where no one tried to change the payload which is the userId in our case
         //? this function check the signature along with the exipre date and by default return 500 error if any of this doesnt exist else it return id creation date in milisecond
         const decode = jwt.verify(token,process.env.JWT_SECRET)      
         
    //^ 3)Check if the user tring to access the route still exist     
         //? get the user from the database as we now have his id
         const currUser = await User.findById(decode.id);
         if(!currUser) return next(new AppError('The user no longer exist',401))
   
   //^ 4)Check if the user changed the password after the JWT was issued
        //? this will be done by an instance method as this belong to the model and not to the controller
        if(currUser.checkChangePassword(decode.iat)) return next(new AppError('Password was change recently',401))
   
   //^ 5)If all passed then next will be called allowing access to this route
   
   //! put the user in the request so that we can use it in the next middleware function as we cant get the user by searching by his id which we get from the params
    req.user = currUser;
    next();
})

//! another middleware function for authorization to restrict certain routes only to certain user roles

//? to be able to pass paramters to a middleware function we will wrap it by a function that will take an undefined number of paramterse and this function will return a middleware function
exports.restictTo = (...roles) =>{
    //* roles here will be an array ex ['admin','lead'...]
    return (req,res,next)=>{
        //^ if the role is not in the array we dont want to give access to this user and we will get the user from the request and in the previous middleware we inserted the user in the request
        if(!roles.includes(req.user.role)) return next(new AppError('You have no permissions to perform this action',403))
        
        return next();
    }    

}



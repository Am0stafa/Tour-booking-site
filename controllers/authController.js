//? in this file, we will have everything related to authentication

const User = require('../models/userModel')
//? rather than surounding with try catch block
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendMail = require('../utils/email')
const crypto = require('crypto');

let cookieOptions={
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
  //  secure:true, //! will only be send when we are using encrypted connection HTTPS, ONLY IN PRODUCTION
    httpOnly:true, //! the cookie cannot be accessed or modified in any way by the browser.Preveny XSS
}
if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
}


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
                                      
    //^ creating the token by making the payload the id of the user and the securet to be a secret string from the .env, and object of options such as expire time to logout the user after cirtain time as this token wont be valid after time pass also from .env
    const token = jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE_IN,
    })
    //^ now send it to the client
    //^ and now the client must save this token
    
    //^ put the jwt in cookie where we attach it to the res.cookie object
    
    res.cookie('jwt',token,cookieOptions)
    
    //! to remove the password from output
    newUser.password =undefined; //! and dont save
    
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
    //^ 2)check if the user email and the password is correct
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
    
    res.cookie('jwt',token,cookieOptions)
    
    res.status(200).json({
        status: 'success',
        token 
    })

});

//! which will resive the email adderss
exports.forgetPassword = catchAsync(async (req, res, next) => {
    //^ 1)Get user based on POSTed email
    const user = await User.findOne({email:req.body.email})
    if(!user) return next(new AppError('There is no user with this password'),404);
    
    //^ 2)Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    //! to save the changed date into the database as we cnanged it in the instance method but didnt save it, then disable validations
    await user.save({validateBeforeSave:false})
    
    //^ 3)Send this token to the user email
    //* the link the the user will resive.
    //& to work on development and production
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/restpassword/${resetToken}`
    
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    
    
    //? we will make a try catch here as we want to do more than just send the user an error
    try{
       await sendMail({
        email:req.body.email,
        subject:'Your password reset token is only valid for 10 minuts!!!',
        message
       })
    }catch(err){
        //! incase of error we want to do two thing 1.reset the token 2.reset the expires property
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({validateBeforeSave:false})
        return next(new AppError('there was an error sending email try again later'),500);   
    }
    res.status(200).json({
        status:'success',
        message:'Token send to email'
    })

});
//! which will resive the token as well as the new password
exports.resetPassword = catchAsync(async (req, res, next) => {
    //^ 1) Get user based on the token AND check if the token didnt expire
        //? we send the user through email the url containing the NON-encrpted token via the paramters
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        //? as this token is the only thing we know about the user
        //? to check that the token didnt expire we will check if the passwordResetExpire property is GREATER THAN right now as this means that passwordResetExpire is in the future
        const user = await User.findOne({passwordResetToken:hashedToken,passwordResetExpire:{$gt:Date.now()}});
        if(!user) next(new AppError('Token is invalid or has expired'),400); 
        
    //^ 2) Set the new password and delete the passwordResetToken and passwordResetExpire
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save();


    //^ 3) Log the user in by sending the JWT to the client
        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRE_IN,
        })
        
        res.cookie('jwt',token,cookieOptions)
        
        res.status(200).json({
            status: 'success',
            token 
        })

    
    
});

//! we need the user to be logged in and we need to ask for this password
exports.updatePassword = catchAsync(async (req, res, next) => {
    //^ 1)Get the user according to the id from the req
        //& as this is a protected route and it passed to the protected route middleware we will have the user on the req
        const user = await User.findById(req.user._id).select('+password')

    //^ 2)Check if the password entered is correct
        if(!(await user.correctPassword(user.password,req.body.passwordCurrent))) next(new AppError('Your current password is wrong!!'),401);

    //^ 3)Update the password
       user.password = req.body.password 
       user.passwordConfirm = req.body.passwordConfirm
       await user.save()
       
    //^ 4)Log the user in by sending a JWT
        const token =jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRE_IN,
        })
        
        res.cookie('jwt',token,cookieOptions)
        
        res.status(200).json({
            status: 'success',
            token 
        })

});




//! middleware function to protect certain routes from access incase the user is not logged in 
exports.protect = catchAsync(async (req, res, next) => {
    let token =''; 
    
    //^ 1)Get the token and check if its there
        //& there is a stander when sending JWT in the request header which is to name the key as authorization and the value to start with bearer
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            //* only in that case we want to save the token and to remove bearer split the array and take the second half
             token = req.headers.authorization.split(' ')[1]; 
        }
        else if(req.cookie.jwt) token = req.cookie.jwt //^ so that if it exist in the cookie then we want the cookie to be that
        
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
} )

//! another middleware function for authorization to restrict certain routes only to certain user roles

//? to be able to pass paramters to a middleware function we will wrap it by a function that will take an undefined number of paramterse and this function will return a middleware function
exports.restictTo = (...roles) =>{
    //* roles here will be an array ex ['admin','lead'...]
    return (req,res,next)=>{
        //^ if the role is not in the array we dont want to give access to this user and we will get the user from the request and in the previous middleware we inserted the user in the request
        if(!roles.includes(req.user.role)) return next(new AppError('You have no permissions to perform this action',403))
        
        return next();
    };    

};



//? in this file, we will have everything related to authentication

const User = require('../models/userModel')
//rather than surounding with try catch block
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken');


exports.signup = catchAsync(async (req, res, next) => {
        //! insecure  
    //^anything the user specify will be stored so no user can sign in as admin
   //! const newUser = await User.create(req.body)
        //! secure
    //^with this code we basically only allow the data that we actually need to be put into the new user so even if the user tried to manually input a role we will not store that onto the user now to be an admin you must go to the database and specify that or make a route to create an admin
    const newUser = await User.create({name:req.body.name, 
                                      email:req.body.email,
                                      password:req.body.password,
                                      passwordConfirm:req.body.passwordConfirm});
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



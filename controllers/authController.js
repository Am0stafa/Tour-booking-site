//? in this file, we will have everything related to authentication

const User = require('../models/userModel')
//rather than surounding with try catch block
const catchAsync = require('../utils/catchAsync')


exports.signup = catchAsync(async (req, res, next) => {


    const newUser = await User.create(req.body)
    res.status(201).json({
        status: 'success',
        data:{
            user:newUser
        }
    })

});



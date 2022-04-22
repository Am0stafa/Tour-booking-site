//things that has nothing to do with the authentication
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')


const filterObj = (obj,...allowed)=>{
    const result = {};
    Object.keys(obj).forEach((el)=>{
        if(allowed.includes(el))
          result[el] = obj[el]
    })
    return result;
}


//! to update the currently authenticated user
exports.updateMe = catchAsync(async (req, res, next) => {
  //? can only update the name and the email address
  //! as this is a protected route we will get the id from user.id as we putted the user on the request
  
  //& to remove any unwated thing from the body
  
  filteredObject = filterObj(req.body,'name','email')
  
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredObject,{
    new:true,
    runValidators:true
  })

  res.status(200).json({
    status: 'success',
    data: {
      updatedUser
    }
  });
})


//! get my user information from currently logged in user in the request by making an middleware to put the userId on params from the req
//^ now run this middleware after cheching for authentication to get personal information
exports.getMe = (req ,res, next)=>{
req.params.id = req.user.id
next()
}





//! To delete a user what we will do is set the active property to false deactivate his account and he can reactive his account at any time
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id,{active:false})
  
  res.status(200).json({
    status: 'success',
    data: null
  });

})




//! it is for the adminstartor to update all of the users data or permenatntly delete a user
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
//* this here gets a user by his id only by the admin if you want personal info use the above middleware
exports.getUser = factory.getOne(User)

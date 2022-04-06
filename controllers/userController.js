//things that has nothing to do with the authentication
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');


const filterObj = (obj,...allowed)=>{
    const result = {};
    Object.keys(obj).forEach((el)=>{
        if(allowed.includes(el))
          result[el] = obj[el]
    })
    return result;
}


exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

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


//! To delete a user what we will do is set the active property to false deactivate his account and he can reactive his account at any time
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id,{active:false})
  
  res.status(200).json({
    status: 'success',
    data: null
  });

})








//! it is for the adminstartor to update all of the users data
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};

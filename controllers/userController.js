//things that has nothing to do with the authentication
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp');

const filterObj = (obj,...allowed)=>{
  const result = {};
  Object.keys(obj).forEach((el)=>{
      if(allowed.includes(el))
        result[el] = obj[el]
  })
  return result;
}



//! we are now going to upload multer upload to our needs by creating one multer storage and one multer filer then use both to create the upload middleware

//^ this will make the file saved in a directory in our file system

// const multerStorage = multer.diskStorage({
//   destination: (req,file,callbackfunction)=>{
//     callbackfunction(null,'public/img/users')
//   },
//   filename: function (req, file, cb) {
//     //* get the extention
//     const ext = file.mimetype.split('/')[1]
//     //^ we want to name the file in this form user-{user.id}-{currentTimeStanp} 
//     const fileName = `user-${req.user.id}-${date.now()}.${ext}`
//     cb(null, fileName)
//   }

// })

//& to perform image processing before saving  we will rather save in in memory not disk and have access to it from buffer
const multerStorage = multer.memoryStorage()

//! we want to test if the uploaded file is an image
const multerFillter = (req, file, cb) =>{

  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted
  // To accept the file pass `true`, like so:
  
  //* we will us the mimetype{image/extention} beacuse what ever image type is uploaded the mimetype will always start with image
  if(file.mimetype.startWith(image)) { 
    cb(null, true)
  }
  else{
  // To reject this file pass `false`, like so:
  cb(new AppError('I don\'t an image you yala!',400), false)
  }

}


//! configure multer upload with the filer and storage
//& this middleware will also put teh file and some information about the file on the request object
const upload = multer({
  storage:multerStorage,
  fileFiler:multerFillter
}) 

//^ then we use the upload as a middleware with the name of the field in the form which is going to hold the image
exports.uploadUserPhoto = upload.single('photo')


//! we will run another middleware before the updateMe which is going to handel the image processing

exports.resizeUserPhoto = (req, res, next) => {
  //^ if there was an upload by now we will be having the file on our req      
  if(!req.file) return next()
  
  req.file.filename =  `user-${req.user.id}-${date.now()}.jpeg`
  
  sharp(req.file.buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/users/${req.file.filename}`)
  
  next()
}



//! to update the currently authenticated user
exports.updateMe = catchAsync(async (req, res, next) => {
  //? can only update the name and the email address and the photo
  //! as this is a protected route we will get the id from user.id as we putted the user on the request
  
  //& to remove any unwated thing from the body
  
   const filteredObject = filterObj(req.body,'name','email')
   if (req.file) filteredObject.photo = req.file.filename
  
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

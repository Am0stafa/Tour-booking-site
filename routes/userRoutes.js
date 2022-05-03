const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('multer')


//! configure multer upload which specify the destination to the folder where we want to save all the images that are being uploaded
const upload = multer({dest:'public/img/users'}) //^ this will make the file saved in a directory in our file system
//? then we use this upload as an middleware with the name of the field in the form which is going to hold the image


const router = express.Router();

//auth
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.post('/forgotpassword',authController.forgetPassword)
//? PATCH as the result of this will be the modification of the password property
router.patch('/restpassword/:token',authController.resetPassword)


//! a trick we can use here rather than putting in all routes under this line the protect middleware is doing:
// router.use(authController.protect)
//! as middlewares are passed by sequance after this line all routes will run this middlware first

router.patch('/updatepassword',authController.protect,authController.updatePassword)
router.patch('/updateme',upload.single('photo'),authController.protect,userController.updateMe)
router.delete('/deleteme',authController.protect,userController.deleteMe)
router.get('/me',authController.protect,userController.getMe,userController.getUser)


router
  .route('/')
  .get(authController.protect,userController.getAllUsers)


//! restrict all routes after this middleware to admins
router.use(authController.restictTo('admin'))

router
  .route('/:id')
  .get(authController.protect,userController.getUser)
  .patch(authController.protect,userController.updateUser)
  .delete(authController.protect,userController.deleteUser);




module.exports = router;

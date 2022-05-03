const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

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
router.patch('/updateme',userController.uploadUserPhoto,userController.resizeUserPhoto,authController.protect,userController.updateMe)
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

const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//auth
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.post('/forgotpassword',authController.forgetPassword)
//? as the result of this will be the modification of the password property
router.patch('/restpassword/:token',authController.resetPassword)
router.patch('/updatepassword',authController.protect,authController.updatePassword)
router.patch('/updateme',authController.protect,userController.updateMe)
router.delete('/deleteme',authController.protect,userController.deleteMe)
router.get('/me',authController.protect,userController.getMe,userController.getUser)


router
  .route('/')
  .get(userController.getAllUsers)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);




module.exports = router;

const express = require('express');
const viewcontroller = require('../controllers/viewController');
const userController = require('../controllers/userController');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();


//^ for rendering pages in the browser we allways use .get('the templet name',handler function: but insted of using JSON we use render which render the templet with the name that we pass in, data that you want to send as variables which are called locals)

//! here is where we want to check if the user purched a tour and added to the booking model
router.get('/',bookingController.createbookingChechout,authController.isLoggedIn,viewcontroller.getOverview)
router.get('/tour/:slug',authController.isLoggedIn,viewcontroller.getTour)
router.get('/login',authController.isLoggedIn,viewcontroller.getLoginForm)
router.get('/signup', authController.isLoggedIn, viewcontroller.getSingupForm);
router.get('/me', authController.protect, viewcontroller.getAccount);


module.exports = router;
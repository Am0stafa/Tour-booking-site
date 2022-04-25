const express = require('express');
const viewcontroller = require('../controllers/viewController');
const userController = require('../controllers/userController');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();


//^ for rendering pages in the browser we allways use .get('the route',handler function: but insted of using JSON we use render which render the templet with the name that we pass in, data that you want to send as variables which are called locals)


router.get('/',viewcontroller.getOverview)
router.get('/tour',viewcontroller.getTour)
  


module.exports = router;
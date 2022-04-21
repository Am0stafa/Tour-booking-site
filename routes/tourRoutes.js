const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController')
const reviewController = require('./../controllers/reviewController');


const router = express.Router();


//paramter middelware
// router.param('id', tourController.checkID);

//this one from the aggregation functions we made in the controller
router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyplan)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  //inside this our query string must look like this ?limt=5&sort=-rateingAverage,price
  //this middelware is prefilling the query string for the user so that the user doesn't have to do it on this own

router
  .route('/')
  //it will run this middleware first to check if the user is permeted to access this route
  .get(authController.protect,tourController.getAllTours)
  .post(tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restictTo('admin', 'lead-guide'),tourController.deleteTour)
  
  
//! POST /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review/245254:reviewId

//& we do it here as the route start with tour
router
  .route('/:tourId/reviews')
  .post(authController.protect,authController.restictTo('user'),reviewController.createReview);

module.exports = router;

const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController')
const reviewController = require('./../controllers/reviewController');
const reviewRoute = require('./../routes/reviewRoutes')


const router = express.Router();


//* paramter middelware
// router.param('id', tourController.checkID);

//! this one from the aggregation functions we made in the controller
router
    .route('/tour-stats')
    .get(tourController.getTourStats)

router
    .route('/monthly-plan/:year')
    .get(authController.protect,authController.restictTo('admin', 'lead-guide','guide'),tourController.getMonthlyplan)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
  //! inside this our query string must look like this ?limt=5&sort=-rateingAverage,price
  //! this middelware is prefilling the query string for the user so that the user doesn't have to do it on this own

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,authController.restictTo('admin', 'lead-guide'),tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,authController.restictTo('admin', 'lead-guide'),tourController.updateTour)
  .delete(authController.protect,authController.restictTo('admin', 'lead-guide'),tourController.deleteTour)
  
  
//! POST /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review/245254:reviewId

//? way 1:

//& we do it here as the route start with tour
// router
//   .route('/:tourId/reviews')
//   .post(authController.protect,authController.restictTo('user'),reviewController.createReview);

//? way 2:

//& this middleware just says that for this specific route we want to use the tour route instead SO we just mount the router same as in app.js file.But a problem we have here is that in the reviewRouter we wont have access to the tourId so we will habe to enable the review router to get access to this parameter here as well BY using merg params in reviewRouter inside the        express.Router({})
router.use('/:tourId/reviews', reviewRoute)



module.exports = router;

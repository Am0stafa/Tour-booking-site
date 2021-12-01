const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();


//paramter middelware
// router.param('id', tourController.checkID);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours); //inside this our query string must look like this ?limt=5&sort=-rateingAverage,price
  //this middelware is prefilling the query string for the user so that the user doesn't have to do it on this own

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour)

module.exports = router;

const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('../controllers/authController');
//^ as each router only have access to the parameters of their specific routes but we want to get access to things that was in the other router
const router = express.Router({mergeParams:true});


//! POST /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review
//! GET /tour/q89645129834:tourId/review/245254:reviewId //single tour single review
//! ALSO /review
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect,authController.restictTo('user'),reviewController.createReview);
  
  
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview)

module.exports = router;

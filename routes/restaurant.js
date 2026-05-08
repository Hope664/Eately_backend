const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurant,
  getMyRestaurant,
  updateRestaurant,
  uploadCoverImage,
  uploadLogo,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadRestaurantImage } = require('../config/multer');

// Public
router.get('/', getAllRestaurants);
router.get('/:id', getRestaurant);

// Private
router.use(protect);
router.get('/owner/my-restaurant', restrictTo('restaurant_owner'), getMyRestaurant);
router.post('/', restrictTo('restaurant_owner'), createRestaurant);
router.put('/:id', restrictTo('restaurant_owner'), updateRestaurant);
router.delete('/:id', restrictTo('restaurant_owner'), deleteRestaurant);
router.post('/:id/cover-image', restrictTo('restaurant_owner'), uploadRestaurantImage.single('image'), uploadCoverImage);
router.post('/:id/logo', restrictTo('restaurant_owner'), uploadRestaurantImage.single('image'), uploadLogo);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getRestaurantBookings,
  checkAvailability,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');

// Public
router.get('/availability/:restaurantId', checkAvailability);

// Private
router.use(protect);
router.post('/:restaurantId', restrictTo('customer'), createBooking);
router.get('/my-bookings', restrictTo('customer'), getMyBookings);
router.put('/:bookingId/cancel', restrictTo('customer'), cancelBooking);
router.get('/restaurant/:restaurantId', restrictTo('restaurant_owner'), getRestaurantBookings);
router.put('/:bookingId/status', restrictTo('restaurant_owner'), updateBookingStatus);

module.exports = router;
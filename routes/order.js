const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getRestaurantOrders,
  updateOrderStatus,
  markAsPaid,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// Customer
router.post('/:restaurantId', restrictTo('customer'), createOrder);
router.get('/my-orders', restrictTo('customer'), getMyOrders);
router.put('/:orderId/cancel', restrictTo('customer'), cancelOrder);

// Restaurant owner
router.get('/restaurant/:restaurantId', restrictTo('restaurant_owner'), getRestaurantOrders);
router.put('/:orderId/status', restrictTo('restaurant_owner'), updateOrderStatus);
router.put('/:orderId/pay', restrictTo('restaurant_owner'), markAsPaid);

// Both
router.get('/:orderId', getOrder);

module.exports = router;
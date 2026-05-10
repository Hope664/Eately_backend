
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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/orders/my-orders:
 *   get:
 *     summary: Get my orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/my-orders', protect, restrictTo('customer'), getMyOrders);

/**
 * @swagger
 * /api/orders/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all orders for a restaurant
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/restaurant/:restaurantId', protect, restrictTo('restaurant_owner'), getRestaurantOrders);

/**
 * @swagger
 * /api/orders/{restaurantId}:
 *   post:
 *     summary: Place an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, orderType, paymentMethod]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: integer
 *                     specialInstructions:
 *                       type: string
 *               orderType:
 *                 type: string
 *                 enum: [dine_in, takeaway]
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, mobile_money]
 *               specialInstructions:
 *                 type: string
 *               bookingId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed
 */
router.post('/:restaurantId', protect, restrictTo('customer'), createOrder);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order returned
 */
router.get('/:orderId', protect, getOrder);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, delivered, cancelled]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:orderId/status', protect, restrictTo('restaurant_owner'), updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}/pay:
 *   put:
 *     summary: Mark order as paid
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order marked as paid
 */
router.put('/:orderId/pay', protect, restrictTo('restaurant_owner'), markAsPaid);

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.put('/:orderId/cancel', protect, restrictTo('customer'), cancelOrder);

module.exports = router;
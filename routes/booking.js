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

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Table booking management
 */

/**
 * @swagger
 * /api/bookings/availability/{restaurantId}:
 *   get:
 *     summary: Check table availability
 *     tags: [Bookings]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-05-20"
 *       - in: query
 *         name: timeSlot
 *         required: true
 *         schema:
 *           type: string
 *         example: "19:00"
 *     responses:
 *       200:
 *         description: Table availability returned
 */
router.get('/availability/:restaurantId', checkAvailability);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get my bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/my-bookings', protect, restrictTo('customer'), getMyBookings);

/**
 * @swagger
 * /api/bookings/{restaurantId}:
 *   post:
 *     summary: Create a booking
 *     tags: [Bookings]
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
 *             required: [tableNumber, date, timeSlot, guestCount, customerName, customerPhone]
 *             properties:
 *               tableNumber:
 *                 type: integer
 *                 example: 3
 *               date:
 *                 type: string
 *                 example: "2026-05-20"
 *               timeSlot:
 *                 type: string
 *                 example: "19:00"
 *               guestCount:
 *                 type: integer
 *                 example: 2
 *               customerName:
 *                 type: string
 *                 example: Jane Customer
 *               customerPhone:
 *                 type: string
 *                 example: "0787654321"
 *               customerEmail:
 *                 type: string
 *               specialRequests:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 *       400:
 *         description: Table already booked
 */
router.post('/:restaurantId', protect, restrictTo('customer'), createBooking);

/**
 * @swagger
 * /api/bookings/restaurant/{restaurantId}:
 *   get:
 *     summary: Get all bookings for a restaurant
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/restaurant/:restaurantId', protect, restrictTo('restaurant_owner'), getRestaurantBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}/status:
 *   put:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
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
 *                 enum: [pending, confirmed, cancelled, completed, no_show]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:bookingId/status', protect, restrictTo('restaurant_owner'), updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.put('/:bookingId/cancel', protect, restrictTo('customer'), cancelBooking);

module.exports = router;
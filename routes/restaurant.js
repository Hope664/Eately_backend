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

/**
 * @swagger
 * tags:
 *   name: Restaurants
 *   description: Restaurant management
 */

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     tags: [Restaurants]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *       - in: query
 *         name: priceRange
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
 *         description: List of restaurants
 */
router.get('/', getAllRestaurants);

/**
 * @swagger
 * /api/restaurants/owner/my-restaurant:
 *   get:
 *     summary: Get logged in owner's restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant returned
 *       404:
 *         description: No restaurant found
 */
router.get('/owner/my-restaurant', protect, restrictTo('restaurant_owner'), getMyRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get a single restaurant
 *     tags: [Restaurants]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant returned
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', getRestaurant);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:
 *                 type: string
 *                 example: The Golden Fork
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Italian", "Mediterranean"]
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               priceRange:
 *                 type: string
 *                 enum: [$, $$, $$$, $$$$]
 *               totalTables:
 *                 type: integer
 *                 example: 15
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Restaurant created
 *       400:
 *         description: Already have a restaurant
 */
router.post('/', protect, restrictTo('restaurant_owner'), createRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Restaurant updated
 */
router.put('/:id', protect, restrictTo('restaurant_owner'), updateRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete a restaurant
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Restaurant deleted
 */
router.delete('/:id', protect, restrictTo('restaurant_owner'), deleteRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}/cover-image:
 *   post:
 *     summary: Upload restaurant cover image
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 */
router.post('/:id/cover-image', protect, restrictTo('restaurant_owner'), uploadRestaurantImage.single('image'), uploadCoverImage);

/**
 * @swagger
 * /api/restaurants/{id}/logo:
 *   post:
 *     summary: Upload restaurant logo
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded
 */
router.post('/:id/logo', protect, restrictTo('restaurant_owner'), uploadRestaurantImage.single('image'), uploadLogo);

module.exports = router;
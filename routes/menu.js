
const express = require('express');
const router = express.Router();
const {
  createMenu,
  getMenu,
  addCategory,
  updateCategory,
  deleteCategory,
  addItem,
  updateItem,
  uploadItemImage,
  deleteItem,
} = require('../controllers/menuController');
const { protect, restrictTo } = require('../middleware/auth');
const { uploadMenuImage } = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management
 */

/**
 * @swagger
 * /api/menu/{restaurantId}:
 *   get:
 *     summary: Get full menu for a restaurant
 *     tags: [Menu]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full menu returned
 *       404:
 *         description: Menu not found
 */
router.get('/:restaurantId', getMenu);

/**
 * @swagger
 * /api/menu/{restaurantId}:
 *   post:
 *     summary: Create a menu for a restaurant
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Menu created
 */
router.post('/:restaurantId', protect, restrictTo('restaurant_owner'), createMenu);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories:
 *   post:
 *     summary: Add a category to the menu
 *     tags: [Menu]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Starters
 *               description:
 *                 type: string
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category added
 */
router.post('/:restaurantId/categories', protect, restrictTo('restaurant_owner'), addCategory);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}:
 *   put:
 *     summary: Update a category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
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
 *         description: Category updated
 */
router.put('/:restaurantId/categories/:categoryId', protect, restrictTo('restaurant_owner'), updateCategory);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/:restaurantId/categories/:categoryId', protect, restrictTo('restaurant_owner'), deleteCategory);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}/items:
 *   post:
 *     summary: Add item to a category
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bruschetta
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 8.99
 *               isAvailable:
 *                 type: boolean
 *               isPopular:
 *                 type: boolean
 *               preparationTime:
 *                 type: integer
 *               calories:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added
 */
router.post('/:restaurantId/categories/:categoryId/items', protect, restrictTo('restaurant_owner'), addItem);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}/items/{itemId}:
 *   put:
 *     summary: Update a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
 *         description: Item updated
 */
router.put('/:restaurantId/categories/:categoryId/items/:itemId', protect, restrictTo('restaurant_owner'), updateItem);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}/items/{itemId}:
 *   delete:
 *     summary: Delete a menu item
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted
 */
router.delete('/:restaurantId/categories/:categoryId/items/:itemId', protect, restrictTo('restaurant_owner'), deleteItem);

/**
 * @swagger
 * /api/menu/{restaurantId}/categories/{categoryId}/items/{itemId}/image:
 *   post:
 *     summary: Upload menu item image
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
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
router.post('/:restaurantId/categories/:categoryId/items/:itemId/image', protect, restrictTo('restaurant_owner'), uploadMenuImage.single('image'), uploadItemImage);

module.exports = router;
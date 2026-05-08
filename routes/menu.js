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

// Public
router.get('/:restaurantId', getMenu);

// Private - restaurant owner only
router.use(protect, restrictTo('restaurant_owner'));
router.post('/:restaurantId', createMenu);
router.post('/:restaurantId/categories', addCategory);
router.put('/:restaurantId/categories/:categoryId', updateCategory);
router.delete('/:restaurantId/categories/:categoryId', deleteCategory);
router.post('/:restaurantId/categories/:categoryId/items', addItem);
router.put('/:restaurantId/categories/:categoryId/items/:itemId', updateItem);
router.delete('/:restaurantId/categories/:categoryId/items/:itemId', deleteItem);
router.post(
  '/:restaurantId/categories/:categoryId/items/:itemId/image',
  uploadMenuImage.single('image'),
  uploadItemImage
);

module.exports = router;
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const path = require('path');
const fs = require('fs');
const { uploadMenuImage } = require('../config/multer');

// helper — make sure the logged in owner owns this restaurant
const verifyOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
  });
  return restaurant;
};

// @POST /api/menu/:restaurantId
// Private - create menu for a restaurant
exports.createMenu = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const existing = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (existing) {
      return res.status(400).json({ message: 'Menu already exists for this restaurant' });
    }

    const menu = await Menu.create({
      restaurant: req.params.restaurantId,
      categories: [],
    });

    res.status(201).json({ message: 'Menu created successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/menu/:restaurantId
// Public - get full menu for a restaurant
exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });

    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this restaurant' });
    }

    res.status(200).json({ menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/menu/:restaurantId/categories
// Private - add a category to the menu
exports.addCategory = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const { name, description, sortOrder } = req.body;

    menu.categories.push({ name, description, sortOrder, items: [] });
    await menu.save();

    res.status(201).json({ message: 'Category added successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/menu/:restaurantId/categories/:categoryId
// Private - update a category
exports.updateCategory = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { name, description, sortOrder, isActive } = req.body;
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await menu.save();

    res.status(200).json({ message: 'Category updated successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/menu/:restaurantId/categories/:categoryId
// Private - delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.deleteOne();
    await menu.save();

    res.status(200).json({ message: 'Category deleted successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/menu/:restaurantId/categories/:categoryId/items
// Private - add item to a category
exports.addItem = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const {
      name,
      description,
      price,
      isAvailable,
      isPopular,
      preparationTime,
      calories,
    } = req.body;

    category.items.push({
      name,
      description,
      price,
      isAvailable,
      isPopular,
      preparationTime,
      calories,
      image: null,
    });

    await menu.save();

    res.status(201).json({ message: 'Item added successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/menu/:restaurantId/categories/:categoryId/items/:itemId
// Private - update a menu item
exports.updateItem = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = category.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const fields = ['name','description','price','isAvailable','isPopular','preparationTime','calories'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) item[field] = req.body[field];
    });

    await menu.save();

    res.status(200).json({ message: 'Item updated successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/menu/:restaurantId/categories/:categoryId/items/:itemId/image
// Private - upload item image
exports.uploadItemImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = category.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete old image if exists
    if (item.image) {
      const oldPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    item.image = `/uploads/menu-items/${req.file.filename}`;
    await menu.save();

    res.status(200).json({ message: 'Item image uploaded', image: item.image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/menu/:restaurantId/categories/:categoryId/items/:itemId
// Private - delete a menu item
exports.deleteItem = async (req, res) => {
  try {
    const restaurant = await verifyOwnership(req.params.restaurantId, req.user.id);
    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }

    const category = menu.categories.id(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const item = category.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete image file if exists
    if (item.image) {
      const oldPath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    item.deleteOne();
    await menu.save();

    res.status(200).json({ message: 'Item deleted successfully', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
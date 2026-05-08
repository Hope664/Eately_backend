const Restaurant = require('../models/Restaurant');
const path = require('path');
const fs = require('fs');

// @POST /api/restaurants
// Private - restaurant_owner only
exports.createRestaurant = async (req, res) => {
  try {
    const existing = await Restaurant.findOne({ owner: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You already have a registered restaurant' });
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      owner: req.user.id,
    });

    res.status(201).json({ message: 'Restaurant created successfully', restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/restaurants
// Public - get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const { search, cuisine, city, priceRange, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (priceRange) {
      query.priceRange = priceRange;
    }

    const skip = (page - 1) * limit;
    const total = await Restaurant.countDocuments(query);
    const restaurants = await Restaurant.find(query)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      restaurants,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/restaurants/:id
// Public - get single restaurant
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/restaurants/my-restaurant
// Private - get logged in owner's restaurant
exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });

    if (!restaurant) {
      return res.status(404).json({ message: 'You have not registered a restaurant yet' });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/restaurants/:id
// Private - owner only
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    }

    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Restaurant updated successfully', restaurant: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/restaurants/:id/cover-image
// Private - upload cover image
exports.uploadCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    }

    // Delete old image if exists
    if (restaurant.coverImage) {
      const oldPath = path.join(__dirname, '..', restaurant.coverImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageUrl = `/uploads/restaurants/${req.file.filename}`;
    restaurant.coverImage = imageUrl;
    await restaurant.save();

    res.status(200).json({ message: 'Cover image uploaded', coverImage: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/restaurants/:id/logo
// Private - upload logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    }

    // Delete old logo if exists
    if (restaurant.logo) {
      const oldPath = path.join(__dirname, '..', restaurant.logo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageUrl = `/uploads/restaurants/${req.file.filename}`;
    restaurant.logo = imageUrl;
    await restaurant.save();

    res.status(200).json({ message: 'Logo uploaded', logo: imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/restaurants/:id
// Private - owner only
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or unauthorized' });
    }

    await restaurant.deleteOne();

    res.status(200).json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
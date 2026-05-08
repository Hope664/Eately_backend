const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: null },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    preparationTime: { type: Number },
    calories: { type: Number },
  },
  { timestamps: true }
);

const menuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  items: [menuItemSchema],
});

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      unique: true,
    },
    categories: [menuCategorySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
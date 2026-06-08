const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const restaurantSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    cuisine: [{ type: String, trim: true }],

    coverImage: {
      type: String,
      default: null,
    },

    logo: {
      type: String,
      default: null,
    },

    address: {
      street: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
      },

      country: {
        type: String,
        required: true,
      },

      zipCode: {
        type: String,
      },
    },

    phone: {
      type: String,
    },

    email: {
      type: String,
    },

    // SIMPLE STRING INSTEAD OF OBJECT ARRAY
    workingHours: {
      type: String,
      default: '',
    },

    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },

    totalTables: {
      type: Number,
      default: 10,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);
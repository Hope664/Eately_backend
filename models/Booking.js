const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    tableNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    guestCount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    specialRequests: { type: String },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
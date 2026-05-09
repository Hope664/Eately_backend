const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');

// @POST /api/bookings/:restaurantId
// Private - customer only
exports.createBooking = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const {
      tableNumber,
      date,
      timeSlot,
      guestCount,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
    } = req.body;

    // Check if table is already booked for that date and time slot
    const conflict = await Booking.findOne({
      restaurant: req.params.restaurantId,
      tableNumber,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (conflict) {
      return res.status(400).json({
        message: 'This table is already booked for the selected date and time',
        taken: true,
      });
    }

    const booking = await Booking.create({
      customer: req.user.id,
      restaurant: req.params.restaurantId,
      tableNumber,
      date: new Date(date),
      timeSlot,
      guestCount,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
    });

    // Emit real-time table update to all customers viewing this restaurant
    const io = req.app.get('io');
    io.to(req.params.restaurantId).emit('table_booked', {
      tableNumber,
      date,
      timeSlot,
      status: 'taken',
    });

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/bookings/my-bookings
// Private - customer sees their own bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('restaurant', 'name address coverImage')
      .sort({ date: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/bookings/restaurant/:restaurantId
// Private - restaurant owner sees all bookings for their restaurant
exports.getRestaurantBookings = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const { date, status } = req.query;
    const query = { restaurant: req.params.restaurantId };

    if (date) query.date = new Date(date);
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .sort({ date: 1 });

    res.status(200).json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/bookings/availability/:restaurantId
// Public - check which tables are taken for a date and time slot
exports.checkAvailability = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const { date, timeSlot } = req.query;
    if (!date || !timeSlot) {
      return res.status(400).json({ message: 'Date and timeSlot are required' });
    }

    const bookedTables = await Booking.find({
      restaurant: req.params.restaurantId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    }).select('tableNumber');

    const takenTableNumbers = bookedTables.map((b) => b.tableNumber);
    const totalTables = restaurant.totalTables;

    const tables = Array.from({ length: totalTables }, (_, i) => ({
      tableNumber: i + 1,
      isAvailable: !takenTableNumbers.includes(i + 1),
    }));

    res.status(200).json({ tables, date, timeSlot });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/bookings/:bookingId/status
// Private - restaurant owner updates booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('restaurant');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure the logged in user owns this restaurant
    if (booking.restaurant.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    booking.status = status;
    await booking.save();

    // Notify all sockets watching this restaurant
    const io = req.app.get('io');
    io.to(booking.restaurant._id.toString()).emit('booking_status_updated', {
      bookingId: booking._id,
      tableNumber: booking.tableNumber,
      status,
    });

    res.status(200).json({ message: 'Booking status updated', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/bookings/:bookingId/cancel
// Private - customer cancels their own booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Notify restaurant room that this table is now free
    const io = req.app.get('io');
    io.to(booking.restaurant.toString()).emit('table_freed', {
      tableNumber: booking.tableNumber,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: 'available',
    });

    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
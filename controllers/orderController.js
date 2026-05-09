const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');

// @POST /api/orders/:restaurantId
// Private - customer only
exports.createOrder = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const { items, orderType, paymentMethod, specialInstructions, bookingId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const order = await Order.create({
      customer: req.user.id,
      restaurant: req.params.restaurantId,
      booking: bookingId || null,
      items,
      subtotal,
      tax,
      total,
      orderType,
      paymentMethod,
      specialInstructions,
      statusHistory: [{ status: 'pending', timestamp: Date.now() }],
    });

    // Notify restaurant owner in real time
    const io = req.app.get('io');
    io.to(req.params.restaurantId).emit('new_order', {
      orderId: order._id,
      total: order.total,
      itemCount: items.length,
      orderType,
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/my-orders
// Private - customer sees their orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name address coverImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/:orderId
// Private - customer or owner
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('restaurant', 'name address phone')
      .populate('customer', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the customer or the restaurant owner can view this order
    const isCustomer = order.customer._id.toString() === req.user.id.toString();
    const isOwner = await Restaurant.findOne({
      _id: order.restaurant._id,
      owner: req.user.id,
    });

    if (!isCustomer && !isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/orders/restaurant/:restaurantId
// Private - restaurant owner sees all their orders
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.restaurantId,
      owner: req.user.id,
    });

    if (!restaurant) {
      return res.status(403).json({ message: 'Not authorized or restaurant not found' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { restaurant: req.params.restaurantId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      orders,
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

// @PUT /api/orders/:orderId/status
// Private - restaurant owner updates order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('restaurant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.restaurant.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, note } = req.body;
    order.status = status;
    order.statusHistory.push({ status, timestamp: Date.now(), note });
    await order.save();

    // Notify the customer in real time
    const io = req.app.get('io');
    io.to(order.customer.toString()).emit('order_status_updated', {
      orderId: order._id,
      status,
      note,
    });

    res.status(200).json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/orders/:orderId/pay
// Private - mark order as paid
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('restaurant');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.restaurant.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.paymentStatus = 'paid';
    await order.save();

    res.status(200).json({ message: 'Order marked as paid', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/orders/:orderId/cancel
// Private - customer cancels order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        message: 'Order cannot be cancelled at this stage',
      });
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: Date.now() });
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
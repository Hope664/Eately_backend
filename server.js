const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.RESTAURANT_CLIENT_URL,
      process.env.CUSTOMER_CLIENT_URL,
    ];
    // Allow requests with no origin (Postman, Thunder Client, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads folder ───────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🍽️ Eataly API is running' });
});

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/restaurant', require('./models/restaurant'));
app.use('/api/menu',        require('./routes/menu'));
app.use('/api/bookings',    require('./routes/booking'));
app.use('/api/orders',      require('./models/order'));

// ── 404 handler ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global error handler ────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ── Socket.io ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [
      process.env.RESTAURANT_CLIENT_URL,
      process.env.CUSTOMER_CLIENT_URL,
    ],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Customer joins a restaurant room to watch table availability
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(restaurantId);
    console.log(`Socket ${socket.id} joined restaurant: ${restaurantId}`);
  });

  socket.on('leave_restaurant', (restaurantId) => {
    socket.leave(restaurantId);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

module.exports = { app, io };
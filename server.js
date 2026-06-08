const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger');

dotenv.config();

connectDB();

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ──────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🍽️ Eataly API is running' });
});

app.use('/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerSpec));
// ── Routes ──────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurant'));
app.use('/api/menu',        require('./routes/menu'));
app.use('/api/bookings',    require('./routes/booking'));
app.use('/api/orders',      require('./routes/order'));

// ── 404 + Error handlers ────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ── Socket.io ───────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: /^http:\/\/localhost:\d+$|^http:\/\/127\.0\.0\.1:\d+$/,
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

  // Customer joins their personal room for order updates
  socket.on('join_customer_room', (customerId) => {
    socket.join(customerId);
    console.log(`Socket ${socket.id} joined customer room: ${customerId}`);
  });

  socket.on('leave_restaurant', (restaurantId) => {
    socket.leave(restaurantId);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

app.set('io', io);

module.exports = { app, io };
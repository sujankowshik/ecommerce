import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// DB and Configs
import connectDB from './config/db.js';
import User from './models/User.js';

// Middlewares
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routers
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

// Load Env variables
dotenv.config();

// Connect to MongoDB Database and run role cleanup migration
connectDB().then(async () => {
  try {
    const result = await User.updateMany(
      { role: 'admin', email: { $ne: 'admin@ecommerce.com' } },
      { $set: { role: 'user' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Reverted ${result.modifiedCount} unauthorized admin accounts back to standard user role.`);
    }
  } catch (err) {
    console.error('[Migration Error] Failed to enforce user role integrity:', err.message);
  }
});

const app = express();

// Standard Morgan Dev Logger
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 1. Helmet Security Middleware (Configure CORS friendly settings)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// 2. CORS configurations
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// 3. Body Parsing Middleware
app.use(express.json());

// 4. Rate Limiting Middleware (100 requests per 15 mins per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Server Ping Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'eCommerce API Server is fully operational.',
    timestamp: new Date()
  });
});

// Root Redirect/Welcome
app.get('/', (req, res) => {
  res.send('Welcome to the premium eCommerce Backend RESTful API Server. Go to /api/health for system status.');
});

// Central Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

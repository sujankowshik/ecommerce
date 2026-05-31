import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - validates custom JWT token
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_development_secret_key_12345');

      const user = await User.findById(decoded.id).select('-firebaseUid');
      if (!user) {
        return res.status(401).json({ message: 'User not found in system.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(`JWT Verification Error: ${error.message}`);
      res.status(401).json({ message: 'Not authorized, token failed.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token supplied.' });
  }
};

// Admin routes authorization checker
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Requires Administrator privileges.' });
  }
};

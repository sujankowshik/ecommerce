import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Automatic TTL index: documents expire after 5 minutes (300 seconds)
  }
}, { timestamps: true });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;

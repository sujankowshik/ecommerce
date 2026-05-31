import { firebaseAuth } from '../config/firebase.js';
import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import generateToken from '../utils/generateToken.js';
import Otp from '../models/Otp.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Authenticate user from Firebase Token & issue JWT
// @route   POST /api/auth/firebase-login
// @access  Public
export const firebaseLogin = async (req, res, next) => {
  const { idToken, phoneNumber } = req.body;

  if (!idToken) {
    res.status(400);
    return next(new Error('Firebase ID Token is required.'));
  }

  try {
    // 1. Verify token via Firebase Admin (or local simulator fallback)
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    const { uid, email, name, picture, phone_number } = decodedToken;

    const finalEmail = email || (phone_number ? `phone_${phone_number.replace(/[^0-9]/g, '')}@ecommerce.com` : `phone_${uid}@ecommerce.com`);
    const finalName = name || (phone_number ? `Customer (${phone_number})` : finalEmail.split('@')[0]);

    // 2. Lookup or register user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Separate Admin credentials: only admin@ecommerce.com gets the admin role
      const role = finalEmail === 'admin@ecommerce.com' ? 'admin' : 'user';

      user = await User.create({
        firebaseUid: uid,
        email: finalEmail,
        name: finalName,
        role,
        avatar: picture || '',
        phoneNumber: phone_number || phoneNumber || '',
        shippingAddress: {
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      });

      // Auto-initialize an empty wishlist for the new user
      await Wishlist.create({ user: user._id, products: [] });
    }

    // 3. Issue our custom lightweight JWT
    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      shippingAddress: user.shippingAddress,
      token,
      isNewUser
    });
  } catch (error) {
    console.error(`Firebase Login Error: ${error.message}`);
    res.status(401);
    next(new Error('Authentication failed, invalid ID token.'));
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      next(new Error('User not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;
      
      if (req.body.shippingAddress) {
        user.shippingAddress = {
          address: req.body.shippingAddress.address !== undefined ? req.body.shippingAddress.address : user.shippingAddress.address,
          city: req.body.shippingAddress.city !== undefined ? req.body.shippingAddress.city : user.shippingAddress.city,
          state: req.body.shippingAddress.state !== undefined ? req.body.shippingAddress.state : user.shippingAddress.state,
          postalCode: req.body.shippingAddress.postalCode !== undefined ? req.body.shippingAddress.postalCode : user.shippingAddress.postalCode,
          country: req.body.shippingAddress.country !== undefined ? req.body.shippingAddress.country : user.shippingAddress.country
        };
      }

      const updatedUser = await User.findByIdAndUpdate(user._id, user, { new: true });
      res.json(updatedUser);
    } else {
      res.status(404);
      next(new Error('User not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send 6-digit OTP code to user's email
// @route   POST /api/auth/send-email-otp
// @access  Public
export const sendEmailOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    return next(new Error('Email address is required.'));
  }

  try {
    // Generate a random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert the OTP in the database (replace existing one for this email if it exists)
    await Otp.findOneAndUpdate(
      { email },
      { otp: generatedOtp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send the email with the OTP code
    const subject = 'Your Antigravity Login Verification Code';
    const html = `
      <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 24px; background: #ffffff; border: 1px solid #f0f0f0; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; font-weight: 800; font-size: 24px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">A</span>
          <h2 style="font-size: 24px; font-weight: 900; color: #1e293b; margin: 16px 0 8px 0; letter-spacing: -0.025em;">Verify Your Identity</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Thanks for choosing Antigravity. Use the verification code below to log in securely.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 900; color: #4f46e5; letter-spacing: 0.15em; font-family: monospace;">${generatedOtp}</span>
          <p style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin: 8px 0 0 0; tracking: 0.05em;">Valid for 5 minutes</p>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6; text-align: center;">If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.</p>
      </div>
    `;
    const text = `Your Antigravity Login Verification Code is: ${generatedOtp}. This code is valid for 5 minutes.`;

    const emailResult = await sendEmail({ to: email, subject, html, text });

    // Always print OTP in backend console if it's the admin address for local developer convenience!
    if (email === 'admin@ecommerce.com') {
      console.log('\n' + '*'.repeat(50));
      console.log(`🔑 [DEVELOPER NOTICE] Admin OTP Code: ${generatedOtp}`);
      console.log('*'.repeat(50) + '\n');
    }

    // Respond to frontend. If SMTP transporter runs in developer simulated mode,
    // we also send the OTP in the payload so the frontend toast helper can display it!
    res.status(200).json({
      success: true,
      message: 'Verification OTP sent successfully.',
      isMock: emailResult.isMock,
      // Only include otp in development mode if running in simulated mode
      otp: emailResult.isMock ? generatedOtp : undefined
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit OTP code & authenticate/register user
// @route   POST /api/auth/verify-email-otp
// @access  Public
export const verifyEmailOtp = async (req, res, next) => {
  const { email, otpCode } = req.body;

  if (!email || !otpCode) {
    res.status(400);
    return next(new Error('Email and verification code are required.'));
  }

  try {
    // 1. Find OTP record in DB
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      res.status(400);
      return next(new Error('Verification code has expired or was not requested.'));
    }

    // 2. Match the OTP code
    if (otpRecord.otp !== otpCode.trim()) {
      res.status(400);
      return next(new Error('Invalid verification OTP code.'));
    }

    // 3. OTP is valid! Delete it immediately to prevent reuse
    await Otp.deleteOne({ _id: otpRecord._id });

    // 4. Find or create user in MongoDB (automatic email signup!)
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Separate Admin credentials: only admin@ecommerce.com gets the admin role
      const role = email === 'admin@ecommerce.com' ? 'admin' : 'user';

      // Create a unique mock Firebase Uid for email OTP users to ensure unique constraints
      const cleanEmailStr = email.replace(/[^a-zA-Z0-9]/g, '');
      const firebaseUid = `email_otp_${cleanEmailStr}_${Date.now()}`;

      user = await User.create({
        firebaseUid,
        email,
        name: `Customer (${email.split('@')[0]})`,
        role,
        avatar: '',
        phoneNumber: '',
        shippingAddress: {
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        }
      });

      // Auto-initialize an empty wishlist for the new user
      await Wishlist.create({ user: user._id, products: [] });
    }

    // 5. Issue our custom lightweight JWT
    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      shippingAddress: user.shippingAddress,
      token,
      isNewUser
    });
  } catch (error) {
    next(error);
  }
};

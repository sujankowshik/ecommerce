import Coupon from '../models/Coupon.js';

// @desc    Validate a discount coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  const { code } = req.body;

  if (!code) {
    res.status(400);
    return next(new Error('Coupon code is required.'));
  }

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      res.status(404);
      return next(new Error('Coupon code is invalid or does not exist.'));
    }

    if (!coupon.isActive) {
      res.status(400);
      return next(new Error('This coupon is no longer active.'));
    }

    // Check expiry
    const currentDate = new Date();
    if (new Date(coupon.expiryDate) < currentDate) {
      res.status(400);
      return next(new Error('This coupon has expired.'));
    }

    res.json({
      _id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  const { code, discountType, discountValue, expiryDate, isActive } = req.body;

  if (!code || !discountValue || !expiryDate) {
    res.status(400);
    return next(new Error('Code, discount value, and expiry date are required.'));
  }

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      res.status(400);
      return next(new Error('Coupon code already exists.'));
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.findByIdAndDelete(coupon._id);
      res.json({ message: 'Coupon deleted successfully.' });
    } else {
      res.status(404);
      next(new Error('Coupon not found.'));
    }
  } catch (error) {
    next(error);
  }
};

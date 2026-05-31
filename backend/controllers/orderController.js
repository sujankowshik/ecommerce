import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

// @desc    Create new order & adjust product stock
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    couponCode
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    return next(new Error('No order items provided.'));
  }

  try {
    let couponAppliedId = null;

    // Optional Coupon Validation
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        // Validate date
        if (new Date(coupon.expiryDate) >= new Date()) {
          couponAppliedId = coupon._id;
        }
      }
    }

    // 1. Create order in database
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponApplied: couponAppliedId
    });

    const createdOrder = await order.save();

    // 2. Adjust Product Inventory Stocks
    const updateStockPromises = orderItems.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    });
    await Promise.all(updateStockPromises);

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('couponApplied', 'code discountType discountValue');

    if (order) {
      // Validate role or ownership
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        return next(new Error('Access Denied: Not authorized to view this order.'));
      }
      res.json(order);
    } else {
      res.status(404);
      next(new Error('Order not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('couponApplied', 'code')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('couponApplied', 'code')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid (Stripe / PayPal callback)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time || new Date().toISOString(),
        email_address: req.body.email_address || req.user.email
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      next(new Error('Order not found.'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Mark as Shipped/Delivered - Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    return next(new Error('Status string is required.'));
  }

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;

      if (status === 'Shipped') {
        order.isShipped = true;
        order.shippedAt = Date.now();
      } else if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      next(new Error('Order not found.'));
    }
  } catch (error) {
    next(error);
  }
};

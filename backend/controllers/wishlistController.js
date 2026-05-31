import Wishlist from '../models/Wishlist.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    
    // Auto-create wishlist if it doesn't exist for some reason
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    // Check if product already in wishlist
    if (wishlist.products.includes(productId)) {
      res.status(400);
      return next(new Error('Product is already in your wishlist.'));
    }

    wishlist.products.push(productId);
    await wishlist.save();
    
    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json(updatedWishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      res.status(404);
      return next(new Error('Wishlist not found.'));
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    const updatedWishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    res.json(updatedWishlist);
  } catch (error) {
    next(error);
  }
};

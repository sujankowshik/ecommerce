import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag, X, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Cart = () => {
  const {
    cartItems,
    coupon,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discount,
    totalPrice,
    updateCartQuantity,
    removeFromCart,
    applyDiscountCoupon,
    removeDiscountCoupon
  } = useCart();

  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleQtyChange = (item, direction) => {
    const currentQty = item.quantity;
    const stockAvailable = item.stock || 1;
    let newQty = currentQty;

    if (direction === 'increase') {
      newQty = Math.min(currentQty + 1, stockAvailable);
    } else {
      newQty = Math.max(currentQty - 1, 1);
    }

    if (newQty !== currentQty) {
      updateCartQuantity(item.product, newQty);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      return toast.error('Please enter a coupon code.');
    }

    setIsApplyingCoupon(true);
    try {
      await applyDiscountCoupon(couponCode);
      toast.success(`Coupon ${couponCode.toUpperCase()} applied successfully!`);
      setCouponCode('');
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCouponClick = () => {
    removeDiscountCoupon();
    toast.success('Coupon removed.');
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6 fade-in">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 text-slate-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black font-display text-slate-800 dark:text-white">Your Cart is Empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
          Looks like you haven't added any items to your shopping cart yet. Explore our premium catalog to get started!
        </p>
        <Link to="/shop" className="btn-primary inline-flex items-center space-x-2 py-3 px-8 rounded-2xl">
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Shopping Cart</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          You have <span className="font-bold text-primary-600 dark:text-primary-400">{cartItems.length}</span> item type(s) inside your shopping bag
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ======================================= */}
        {/* LEFT COLUMN: ITEM LISTS */}
        {/* ======================================= */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl flex items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              
              {/* Product Thumbnail */}
              <Link to={`/products/${item.product}`} className="w-20 sm:w-24 aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </Link>

              {/* Title & Price */}
              <div className="flex-1 min-w-0 space-y-1">
                <Link
                  to={`/products/${item.product}`}
                  className="font-bold text-slate-800 dark:text-slate-100 hover:text-primary-600 truncate block text-sm sm:text-base"
                >
                  {item.title}
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">₹{item.price.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">each</span>
                </div>
              </div>

              {/* Qty Changer Controls */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl px-1.5 py-0.5 shrink-0 select-none">
                <button
                  onClick={() => handleQtyChange(item, 'decrease')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white active:scale-90"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQtyChange(item, 'increase')}
                  className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Trash Icon */}
              <button
                onClick={() => {
                  removeFromCart(item.product);
                  toast.success('Item removed from cart.');
                }}
                className="p-2.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-xl active:scale-90 transition-colors shrink-0"
                aria-label="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>

            </div>
          ))}
        </div>

        {/* ======================================= */}
        {/* RIGHT COLUMN: CART TOTAL SUMMARY */}
        {/* ======================================= */}
        <aside className="space-y-6">
          
          {/* Summary Panel */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="font-extrabold font-display text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
              Order Summary
            </h3>

            {/* Counters row */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal Price</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">₹{itemsPrice.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center space-x-1">
                    <Tag className="w-4 h-4" />
                    <span>Promo Discount ({coupon?.code})</span>
                  </span>
                  <span className="font-bold">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-500">Shipping Rates</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {shippingPrice === 0 ? (
                    <span className="text-emerald-500 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    `₹${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Taxes</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">₹{taxPrice.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2"></div>

              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-800 dark:text-white">Order Total</span>
                <span className="font-black text-xl text-primary-600 dark:text-primary-400 font-display">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Discount Coupon Inputs Form */}
            {!coupon ? (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Promotional Code</label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="e.g. SAVE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-l-xl px-3.5 text-xs uppercase outline-none focus:border-primary-400"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 rounded-r-xl text-xs transition-colors shrink-0 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-xs rounded-xl flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wider">{coupon.code} Applied</span>
                </span>
                <button
                  onClick={handleRemoveCouponClick}
                  className="p-1 rounded-md hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleCheckoutClick}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 rounded-2xl text-base"
            >
              <span>Proceed To Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl text-xs text-slate-400 dark:text-slate-500 font-medium text-center">
            🔒 Fully Encrypted Secure Checkout Locks. Stripe and PayPal Sandbox integrations pre-configured.
          </div>
        </aside>

      </div>

    </div>
  );
};

export default Cart;

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  // 1. Cart Items Local State
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  // 2. Wishlist Local State
  const [wishlistItems, setWishlistItems] = useState([]);
  
  // 3. Discount Coupon State
  const [coupon, setCoupon] = useState(null);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync / fetch wishlist when user changes
  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setCoupon(null);
    }
  }, [user]);

  // Wishlist API Interactions
  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlistItems(data.products || []);
    } catch (error) {
      console.error('Failed to retrieve wishlist:', error.message);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      throw new Error('Please sign in to manage your Wishlist.');
    }
    try {
      const isAlreadyIn = wishlistItems.some((item) => item._id === product._id);
      if (isAlreadyIn) {
        const { data } = await api.delete(`/wishlist/${product._id}`);
        setWishlistItems(data.products || []);
      } else {
        const { data } = await api.post(`/wishlist/${product._id}`);
        setWishlistItems(data.products || []);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error.message);
      throw error;
    }
  };

  // Cart Methods
  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x.product === product._id);
      const stockAvailable = product.stock || 0;
      const quantityToAdd = Number(qty);

      if (existItem) {
        const newQty = Math.min(existItem.quantity + quantityToAdd, stockAvailable);
        return prevItems.map((x) =>
          x.product === product._id ? { ...x, quantity: newQty } : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            title: product.title,
            image: product.images?.[0] || 'https://via.placeholder.com/150',
            price: product.price,
            stock: product.stock,
            quantity: Math.min(quantityToAdd, stockAvailable)
          }
        ];
      }
    });
  };

  const updateCartQuantity = (productId, qty) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product === productId ? { ...item, quantity: Number(qty) } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  // Coupon Methods
  const applyDiscountCoupon = async (code) => {
    try {
      const { data } = await api.post('/coupons/validate', { code });
      setCoupon(data);
      return data;
    } catch (error) {
      setCoupon(null);
      throw error;
    }
  };

  const removeDiscountCoupon = () => {
    setCoupon(null);
  };

  // Cart Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Free shipping over ₹1000, else ₹100.00 flat
  const shippingPrice = itemsPrice > 1000 || itemsPrice === 0 ? 0.0 : 100.0;
  
  // Estimated 8% Tax rate
  const taxPrice = parseFloat((0.08 * itemsPrice).toFixed(2));

  // Discount calculation
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discount = (coupon.discountValue / 100) * itemsPrice;
    } else {
      discount = coupon.discountValue;
    }
    discount = parseFloat(Math.min(discount, itemsPrice).toFixed(2));
  }

  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice - discount).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        coupon,
        itemsPrice: parseFloat(itemsPrice.toFixed(2)),
        shippingPrice,
        taxPrice,
        discount,
        totalPrice,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        applyDiscountCoupon,
        removeDiscountCoupon,
        fetchWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

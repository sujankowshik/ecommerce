import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Rating from '../components/common/Rating';
import { Skeleton } from '../components/common/Skeleton';
import { toast } from 'react-hot-toast';
import { Heart, ShoppingCart, Plus, Minus, Send, ShieldAlert, Star } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review form local state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setActiveImage(data.images[0]);
      }
    } catch (e) {
      console.error(e.message);
      toast.error('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white">Product Not Found</h2>
        <Link to="/shop" className="btn-primary py-2.5 px-6 rounded-xl text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = wishlistItems.some((item) => item._id === product._id);
  const stockAvailable = product.stock || 0;

  const handleAddToCart = () => {
    if (stockAvailable === 0) return;
    addToCart(product, quantity);
    toast.success(`Successfully added ${quantity} item(s) to Cart!`);
  };

  const handleToggleWishlist = async () => {
    try {
      await toggleWishlist(product);
      if (isFavorited) {
        toast.success('Removed from Wishlist.');
      } else {
        toast.success('Saved to Wishlist!');
      }
    } catch (error) {
      toast.error(error.message || 'Please log in to manage Wishlist.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please enter review comment.');
    }

    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${product._id}/reviews`, { rating, comment });
      toast.success('Review successfully submitted!');
      setComment('');
      setRating(5);
      // Re-fetch product to update ratings list
      fetchProduct();
    } catch (error) {
      toast.error(error.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 fade-in">
      
      {/* Back link */}
      <div>
        <Link to="/shop" className="text-sm font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400">
          ← Back to Catalog Listings
        </Link>
      </div>

      {/* 1. Upper Product block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Left Side: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm relative">
            <img
              src={activeImage || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="w-full h-full object-cover transition-all"
            />
            {stockAvailable === 0 && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl">Out of stock</span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-slate-50 dark:bg-slate-900 shrink-0 ${
                    activeImage === img
                      ? 'border-primary-600 shadow-md'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details and Actions */}
        <div className="flex flex-col space-y-6">
          
          {/* Category Tag */}
          <span className="text-xs font-black uppercase tracking-widest text-primary-500 dark:text-primary-400">
            {product.category?.name || 'Catalog Item'}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-800 dark:text-white font-display">
            {product.title}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center space-x-4 pb-2 border-b border-slate-50 dark:border-slate-800/50">
            <Rating value={product.ratings} text={`(${product.numReviews} review${product.numReviews !== 1 ? 's' : ''})`} size={5} />
            
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
            
            <span className={`text-xs font-black uppercase tracking-wider ${
              stockAvailable > 5 
                ? 'text-emerald-500' 
                : stockAvailable > 0 
                ? 'text-amber-500' 
                : 'text-red-500'
            }`}>
              {stockAvailable > 5 
                ? 'In Stock' 
                : stockAvailable > 0 
                ? `Only ${stockAvailable} remaining` 
                : 'Sold Out'}
            </span>
          </div>

          {/* Pricing */}
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Retail Price</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white font-display">
              ₹{product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Product Details</span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-light text-sm sm:text-base">
              {product.description || 'No description provided.'}
            </p>
          </div>

          {/* Quantity and Actions Row */}
          {stockAvailable > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
              
              {/* Quantity Selector */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Qty</span>
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800 dark:text-white text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(q + 1, stockAvailable))}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 py-3.5 rounded-2xl text-base"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add To Shopping Cart</span>
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  className="btn-outline flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500 border-transparent' : ''}`} />
                  <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 2. Reviews Section */}
      <section className="border-t border-slate-100 dark:border-slate-800 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Side: Summary & Review Submission */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h3 className="text-2xl font-black font-display text-slate-800 dark:text-white mb-2">Customer Reviews</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-light">
              Read authentic evaluations from buyers or share your own thoughts to support other shoppers.
            </p>
          </div>

          {/* Submission Form Block */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h4 className="font-bold text-base text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/80 pb-3">
              Write a Review
            </h4>

            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                
                {/* Rating Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Rating Rating</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Rating value={rating} onChange={(val) => setRating(val)} size={6} />
                  </div>
                </div>

                {/* Comment Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Review Details</label>
                  <textarea
                    required
                    placeholder="Enter your detailed comment..."
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 text-sm outline-none focus:border-primary-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full btn-primary flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Submit Evaluation'}</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl text-center space-y-4">
                <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                  You must be registered and authenticated to leave product evaluations.
                </p>
                <Link to="/login" className="btn-secondary py-2 px-4 rounded-xl text-xs inline-block font-bold">
                  Authenticate Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Reviews Grid List */}
        <div className="lg:col-span-2 space-y-6">
          {(!product.reviews || product.reviews.length === 0) ? (
            <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 p-12 rounded-3xl text-center space-y-3">
              <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-lg text-slate-700 dark:text-slate-300">No Reviews Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                Be the first to purchase this item and leave your review details!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-3xl space-y-4 shadow-sm"
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* User Profile */}
                    <div className="flex items-center space-x-3">
                      {rev.user?.avatar ? (
                        <img src={rev.user.avatar} alt={rev.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-sm">
                          {rev.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-sm text-slate-850 dark:text-slate-200 block">{rev.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Rating stars */}
                    <Rating value={rev.rating} size={4} />
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 font-light leading-relaxed pl-1">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
};

export default ProductDetail;

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart } from 'lucide-react';
import Rating from './Rating';
import { toast } from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlistItems } = useCart();

  const isFavorited = wishlistItems.some((item) => item._id === product._id);

  const handleAddToCart = (e) => {
    e.preventDefault(); // Stop click propagating to the card Link anchor
    addToCart(product, 1);
    toast.success(`${product.title.substring(0, 20)}... added to Cart!`);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // Stop click propagating
    try {
      await toggleWishlist(product);
      if (isFavorited) {
        toast.success('Removed from Wishlist.');
      } else {
        toast.success('Added to Wishlist!');
      }
    } catch (error) {
      toast.error(error.message || 'Please log in to manage Wishlist.');
    }
  };

  const mainImage = product.images?.[0] || 'https://via.placeholder.com/400';

  return (
    <div className="group premium-card flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
      
      {/* Wishlist Heart Icon overlay */}
      <button
        onClick={handleToggleWishlist}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-950/85 backdrop-blur-sm border border-slate-200/20 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 shadow-sm active:scale-90 transition-all duration-200"
      >
        <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Product Image Link */}
      <Link to={`/products/${product._id}`} className="block overflow-hidden aspect-square bg-slate-50 dark:bg-slate-950 relative">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg tracking-wider">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Category Tag */}
        <span className="text-[11px] font-black uppercase text-primary-500 dark:text-primary-400 tracking-wider mb-1">
          {product.category?.name || 'Item'}
        </span>

        {/* Title */}
        <Link
          to={`/products/${product._id}`}
          className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-2"
        >
          {product.title}
        </Link>

        {/* Star Rating and Count */}
        <div className="mb-4">
          <Rating value={product.ratings} text={`(${product.numReviews})`} size={4} />
        </div>

        {/* Price and Add Cart Row */}
        <div className="flex justify-between items-center mt-auto pt-2 border-t border-slate-50 dark:border-slate-800/50">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold block uppercase">Price</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              ₹{product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl active:scale-95 shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;

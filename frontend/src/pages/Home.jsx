import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton, Skeleton } from '../components/common/Skeleton';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, HelpCircle } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
        setLoadingCats(false);

        // Fetch products with featured flag
        const prodRes = await api.get('/products?featured=true&limit=4');
        setFeaturedProducts(prodRes.data.products);
        setLoadingProducts(false);
      } catch (error) {
        console.error('Failed to load home page data:', error.message);
        setLoadingCats(false);
        setLoadingProducts(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20 fade-in">
      
      {/* 1. Gorgeous Premium Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-b-[40px] shadow-lg">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col md:flex-row items-center gap-12">
          
          {/* Text block */}
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/50 rounded-full px-4 py-1.5 text-xs font-black uppercase text-primary-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium eCommerce Showcase</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-none text-white">
              Defy Gravity. <br />
              <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
                Elevate Styling.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto md:mx-0 leading-relaxed font-light">
              Welcome to the definitive shopping experience. Seamless transactions, elegant interfaces, and handpicked premium products curated for modern life.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <Link to="/shop" className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-8 rounded-2xl text-base shadow-xl shadow-primary-500/25">
                <ShoppingBag className="w-5 h-5" />
                <span>Shop Catalog</span>
              </Link>
              <Link to="/shop?category=electronics" className="btn-outline w-full sm:w-auto flex items-center justify-center space-x-2 py-3 px-8 rounded-2xl text-base border-slate-700 hover:bg-slate-800 text-white">
                <span>View Tech</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Graphic/Image Carousel block */}
          <div className="flex-1 w-full max-w-md md:max-w-none aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative border border-slate-800">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80"
              alt="Premium lifestyle goods"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            
            {/* Absolute badge overlay */}
            <div className="absolute bottom-6 left-6 right-6 glass-panel backdrop-blur-md bg-slate-900/80 border-slate-800 text-white p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 block mb-0.5">Seasonal Sale</span>
                <span className="text-base font-bold">Apex Aero Knit Performance</span>
              </div>
              <span className="text-xl font-black text-primary-400 font-display">₹110.00</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Top categories grids */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center md:text-left">
          <span className="text-xs font-black uppercase text-primary-500 tracking-widest block mb-1">Browse Categories</span>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Featured Curations</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loadingCats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-3">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative flex flex-col items-center aspect-[5/4] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95 transition-all duration-300"
              >
                <img
                  src={cat.image || 'https://via.placeholder.com/200'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent"></div>
                <span className="absolute bottom-4 text-center text-white font-bold text-base tracking-tight font-display drop-shadow-md">
                  {cat.name}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
          <div className="text-center sm:text-left">
            <span className="text-xs font-black uppercase text-primary-500 tracking-widest block mb-1">Top Curated Items</span>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Trending Now</h2>
          </div>
          <Link to="/shop" className="btn-secondary py-2 px-5 rounded-xl text-sm flex items-center space-x-2 font-bold shrink-0 self-center sm:self-auto">
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingProducts ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* 4. High-conversion banner triggers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[30px] p-8 md:p-12 text-white flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-lg">
          <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
          
          <div className="space-y-4 text-center lg:text-left max-w-xl">
            <span className="bg-white/15 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">Limited Offer</span>
            <h3 className="text-3xl font-extrabold font-display leading-tight">First-time shopping here?</h3>
            <p className="text-sm text-primary-100 font-light leading-relaxed">
              Use standard discount coupon code <span className="font-bold underline text-white">SAVE20</span> during checkout to receive an instant <span className="font-bold text-white">20% off</span> your entire cart total!
            </p>
          </div>

          <Link to="/shop" className="bg-white hover:bg-slate-100 active:scale-95 text-primary-600 font-black px-8 py-3.5 rounded-2xl shadow-xl transition-all duration-200 shrink-0">
            Apply Coupon Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;

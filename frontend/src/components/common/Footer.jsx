import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, CreditCard, ShieldCheck, Truck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Value Proposers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800 text-primary-400 rounded-2xl flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Free Premium Shipping</h4>
              <p className="text-sm text-slate-500">Free delivery on orders exceeding ₹1000</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800 text-primary-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Secure checkout</h4>
              <p className="text-sm text-slate-500">100% encrypted SSL transaction locks</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800 text-primary-400 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-base">Flexible Payments</h4>
              <p className="text-sm text-slate-500">Stripe and PayPal integrations configured</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg">
                A
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Antigravity
              </span>
            </div>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Serving the highest grade of modern products. Hand-selected premium items matching global quality standards, optimized for sleek user experiences.
            </p>
            
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6">Store Directory</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">Catalog Products</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link to="/dashboard" state={{ tab: 'orders' }} className="hover:text-white transition-colors">Order Tracking</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6">Hot Categories</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/shop?category=fashion-apparel" className="hover:text-white transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/shop?category=home-living" className="hover:text-white transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=fitness-outdoors" className="hover:text-white transition-colors">Fitness & Outdoors</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold text-base mb-6">Get 20% Discount</h4>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              Subscribe to receive updates about new featured items. Enter coupon <span className="text-primary-400 font-bold">SAVE20</span> to redeem 20% discount instantly.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-slate-800 border border-slate-700/50 rounded-l-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 rounded-r-xl text-sm transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* Copy / Payments Row */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Antigravity Store. All rights reserved.</p>
          <div className="flex space-x-3 mt-4 md:mt-0 items-center">
            <span className="border border-slate-800 px-2 py-1 rounded bg-slate-950 font-mono tracking-widest text-[9px] uppercase">Stripe</span>
            <span className="border border-slate-800 px-2 py-1 rounded bg-slate-950 font-mono tracking-widest text-[9px] uppercase">PayPal</span>
            <span className="border border-slate-800 px-2 py-1 rounded bg-slate-950 font-mono tracking-widest text-[9px] uppercase">SSL Encrypted</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

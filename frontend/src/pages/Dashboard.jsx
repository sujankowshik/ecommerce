import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { toast } from 'react-hot-toast';
import { User, ClipboardList, Heart, MapPin, Phone, Mail, Loader2, Save } from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const { wishlistItems, fetchWishlist } = useCart();
  const location = useLocation();

  // Tab management
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit Form State
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [address, setAddress] = useState(user?.shippingAddress?.address || '');
  const [city, setCity] = useState(user?.shippingAddress?.city || '');
  const [state, setState] = useState(user?.shippingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(user?.shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(user?.shippingAddress?.country || 'United States');
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile form when user context loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatar(user.avatar || '');
      setAddress(user.shippingAddress?.address || '');
      setCity(user.shippingAddress?.city || '');
      setState(user.shippingAddress?.state || '');
      setPostalCode(user.shippingAddress?.postalCode || '');
      setCountry(user.shippingAddress?.country || 'United States');
    }
  }, [user]);

  // Fetch orders and wishlist on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (e) {
        console.error('Failed to load orders:', e.message);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user) {
      fetchOrders();
      fetchWishlist();
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required.');

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name,
        phoneNumber,
        avatar,
        shippingAddress: {
          address,
          city,
          state,
          postalCode,
          country
        }
      });
      toast.success('Profile successfully updated!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
      case 'Shipped':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
      case 'Cancelled':
        return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 fade-in">
      
      {/* 1. Header greeting details */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-primary-500/10">
            {user?.name?.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">
              Hello, {user?.name}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl select-none font-bold text-sm">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>
          
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'wishlist'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist</span>
          </button>
        </div>
      </div>

      {/* 2. Main Tab content wrapper */}
      <div className="min-h-[50vh]">
        
        {/* ======================================= */}
        {/* PROFILE MANAGEMENT TAB */}
        {/* ======================================= */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left sidebar card: Core Information */}
            <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="font-bold font-display text-base text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3">
                Account Details
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-0199"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Profile Picture URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Right sidebar card: Shipping Address */}
            <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="font-bold font-display text-base text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800 pb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Default Shipping Address</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</label>
                  <input
                    type="text"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">State / Region</label>
                  <input
                    type="text"
                    placeholder="California"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">ZIP / Postal Code</label>
                  <input
                    type="text"
                    placeholder="94103"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Country</label>
                  <input
                    type="text"
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary py-3 px-8 rounded-2xl text-sm font-bold flex items-center space-x-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Details</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </form>
        )}

        {/* ======================================= */}
        {/* ORDER HISTORY TAB */}
        {/* ======================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <p className="text-xs text-slate-400">Loading order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">No Orders Placed</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                  You haven't checked out any products yet! Go to our shop to start shopping.
                </p>
                <Link to="/shop" className="btn-secondary py-2 px-6 rounded-xl text-sm font-bold inline-block">
                  Go to Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord._id}
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 sm:p-8 rounded-[28px] shadow-sm space-y-6 hover:shadow-md transition-shadow"
                  >
                    
                    {/* Order Meta Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-50 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono block">ID: {ord._id}</span>
                        <span className="text-xs font-semibold text-slate-500 mt-0.5 block">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${ord.isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {ord.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {ord.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-sm">
                          <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-50 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{item.title}</p>
                            <p className="text-xs text-slate-400 font-light">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals & Delivery estimates footer */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800/80 text-xs">
                      <div className="text-slate-400 font-light leading-relaxed">
                        {ord.status === 'Delivered' ? (
                          <span className="text-emerald-500 font-semibold">Delivered on: {new Date(ord.deliveredAt).toLocaleDateString()}</span>
                        ) : ord.status === 'Shipped' ? (
                          <span className="text-amber-500 font-semibold">Shipped on: {new Date(ord.shippedAt).toLocaleDateString()}</span>
                        ) : (
                          <span>Estimated Delivery: 2-4 business days</span>
                        )}
                      </div>
                      
                      <div className="text-slate-800 dark:text-slate-200">
                        <span>Total Paid: </span>
                        <span className="text-lg font-black font-display text-primary-600 pl-1">₹{ord.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* WISHLIST TAB GRID */}
        {/* ======================================= */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
                <Heart className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">Your Wishlist is Empty</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                  Favorite products from our store catalog to review them in this section later.
                </p>
                <Link to="/shop" className="btn-secondary py-2 px-6 rounded-xl text-sm font-bold inline-block">
                  Browse Store
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default Dashboard;

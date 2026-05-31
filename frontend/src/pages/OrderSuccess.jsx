import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, Truck, Package, ArrowRight, ClipboardList } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return setLoading(false);
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data);
      } catch (e) {
        console.error('Failed to load order:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 animate-pulse">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 fade-in">
      
      {/* 1. Header Hero Panel */}
      <div className="glass-panel p-8 sm:p-12 rounded-[32px] text-center space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-primary-500 to-indigo-500"></div>

        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-emerald-500 tracking-wider">Payment Captured</span>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-800 dark:text-white">
            Thank you for your order!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed font-light">
            Your transaction has been processed. We have dispatched a confirmation details email to your registered inbox.
          </p>
        </div>

        {order && (
          <div className="inline-flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl text-xs text-slate-500 font-mono">
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span>ID: <span className="font-bold text-slate-700 dark:text-slate-200">{order._id}</span></span>
          </div>
        )}

        {/* Tracking Flow Banner */}
        <div className="pt-6 grid grid-cols-3 text-center gap-4 border-t border-slate-100 dark:border-slate-800/80 max-w-md mx-auto text-xs">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 block">1. Processed</span>
            <span className="text-[10px] text-slate-400">Order confirmed</span>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
              <Truck className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-400 block">2. In Transit</span>
            <span className="text-[10px] text-slate-400">2-4 business days</span>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-400 block">3. Delivered</span>
            <span className="text-[10px] text-slate-400">Awaiting arrival</span>
          </div>
        </div>

        {/* Direct Action Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/dashboard" className="w-full sm:w-auto btn-primary py-3 px-8 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2">
            <span>Track in Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/shop" className="w-full sm:w-auto btn-secondary py-3 px-8 rounded-2xl text-sm font-bold">
            Continue Shopping
          </Link>
        </div>

      </div>

      {/* 2. Compact Bill Summary list */}
      {order && (
        <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-slate-200/40 space-y-5">
          <h3 className="font-bold font-display text-base text-slate-800 dark:text-white border-b border-slate-50 dark:border-slate-800/80 pb-3">
            Summary Receipt
          </h3>

          <div className="space-y-3.5 text-xs sm:text-sm select-none">
            {order.orderItems.map((item) => (
              <div key={item.product} className="flex justify-between items-center">
                <span className="text-slate-500 font-light truncate max-w-sm">
                  {item.title} <span className="font-bold text-slate-400 pl-1">× {item.quantity}</span>
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-300">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2"></div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Items Total</span>
              <span>₹{order.itemsPrice.toFixed(2)}</span>
            </div>
            
            {order.couponApplied && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Applied Promo Code</span>
                <span>Verified</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-slate-500">
              <span>Shipping & Handling</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice.toFixed(2)}`}</span>
            </div>

            <div className="flex justify-between text-xs text-slate-500">
              <span>Estimated Taxes</span>
              <span>₹{order.taxPrice.toFixed(2)}</span>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2"></div>

            <div className="flex justify-between font-bold text-slate-800 dark:text-white text-sm sm:text-base">
              <span>Amount Charged</span>
              <span className="font-black text-primary-600 dark:text-primary-400 font-display">₹{order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderSuccess;

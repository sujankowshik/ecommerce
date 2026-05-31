import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeForm from '../components/checkout/StripeForm';
import PayPalButtons from '../components/checkout/PayPalButtons';
import { toast } from 'react-hot-toast';
import { MapPin, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_stripe_key_placeholder');

const Checkout = () => {
  const { cartItems, coupon, itemsPrice, shippingPrice, taxPrice, discount, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-step Checkout Progress State
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment
  const [shippingAddress, setShippingAddress] = useState({
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    postalCode: user?.shippingAddress?.postalCode || '',
    country: user?.shippingAddress?.country || 'United States'
  });

  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [clientSecret, setClientSecret] = useState('');
  const [loadingSecret, setLoadingSecret] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { address, city, state, postalCode, country } = shippingAddress;
    if (!address || !city || !state || !postalCode || !country) {
      return toast.error('Please enter all shipping details.');
    }
    setStep(2);
    getPaymentIntent();
  };

  const getPaymentIntent = async () => {
    setLoadingSecret(true);
    try {
      const { data } = await api.post('/payments/stripe/create-intent', { amount: totalPrice });
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error(error.message);
      toast.error('Failed to initialize payment gateway.');
    } finally {
      setLoadingSecret(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // 1. Place the order
      const orderData = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        couponCode: coupon?.code || null
      };

      const orderRes = await api.post('/orders', orderData);
      const createdOrder = orderRes.data;

      // 2. Mark order as paid using paymentResult details
      await api.put(`/orders/${createdOrder._id}/pay`, {
        id: paymentResult.id,
        status: paymentResult.status,
        update_time: paymentResult.update_time
      });

      // 3. Clear cart and redirect
      clearCart();
      toast.success('Order placed successfully! Thank you.');
      navigate(`/order-success?orderId=${createdOrder._id}`);
    } catch (error) {
      console.error('Order creation failed:', error.message);
      toast.error(error.message || 'Failed to complete order checkout.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 fade-in">
      {/* Tracker Header */}
      <div className="flex justify-between items-center pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">Complete shipping and payment details securely</p>
        </div>

        {/* Steps tracker indicators */}
        <div className="flex items-center space-x-2 text-sm font-semibold select-none">
          <span className={`px-3 py-1.5 rounded-xl ${step === 1 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
            1. Shipping
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-3 py-1.5 rounded-xl ${step === 2 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 dark:bg-slate-900'}`}>
            2. Payment
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ======================================= */}
        {/* LEFT COLUMN: SHIPMENT / BILLING FORMS */}
        {/* ======================================= */}
        <div className="lg:col-span-2">
          {step === 1 ? (
            <form onSubmit={handleShippingSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
              <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span>Shipping Address</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="123 Main St, Apt 4"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="Los Angeles"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">State / Region</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="California"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="90001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none"
                    placeholder="United States"
                  />
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3 rounded-2xl text-base mt-4 font-bold">
                Continue to Secure Payment
              </button>
            </form>
          ) : (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  <span>Choose Payment Method</span>
                </h2>
                <button onClick={() => setStep(1)} className="text-xs font-semibold text-slate-400 hover:text-primary-600">
                  Edit Shipping Address
                </button>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('Stripe')}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm flex flex-col items-center space-y-2 transition-all ${
                    paymentMethod === 'Stripe'
                      ? 'border-primary-600 bg-primary-500/5 text-primary-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-black tracking-tight">Credit/Debit Card</span>
                  <span className="text-[10px] text-slate-400 font-normal">Processed by Stripe</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('PayPal')}
                  className={`p-4 rounded-2xl border text-center font-bold text-sm flex flex-col items-center space-y-2 transition-all ${
                    paymentMethod === 'PayPal'
                      ? 'border-primary-600 bg-primary-500/5 text-primary-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base font-black tracking-tight text-[#003087]">PayPal</span>
                  <span className="text-[10px] text-slate-400 font-normal">Smart payment buttons</span>
                </button>
              </div>

              {/* Active Gateway mounting */}
              {loadingSecret ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <LoaderIcon className="w-8 h-8 text-primary-500 animate-spin" />
                  <p className="text-xs text-slate-400">Loading secure checkout credentials...</p>
                </div>
              ) : (
                <div className="pt-4">
                  {paymentMethod === 'Stripe' && clientSecret && (
                    <Elements stripe={stripePromise}>
                      <StripeForm
                        clientSecret={clientSecret}
                        totalPrice={totalPrice}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  )}
                  {paymentMethod === 'PayPal' && (
                    <PayPalButtons
                      totalPrice={totalPrice}
                      onSuccess={handlePaymentSuccess}
                    />
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* ======================================= */}
        {/* RIGHT COLUMN: DETAILED ORDER BASKET */}
        {/* ======================================= */}
        <aside className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h3 className="font-extrabold font-display text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Order Review
            </h3>

            {/* List of items */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 select-none">
              {cartItems.map((item) => (
                <div key={item.product} className="flex items-center space-x-3 text-xs">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 dark:text-slate-300 truncate">{item.title}</p>
                    <p className="text-slate-400 text-[10px]">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2"></div>

            {/* Pricing details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Items</span>
                <span>₹{itemsPrice.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Shipping Fees</span>
                <span>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Estimated Taxes</span>
                <span>₹{taxPrice.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2"></div>

              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-800 dark:text-white">Final Total</span>
                <span className="font-black text-base text-primary-600 dark:text-primary-400 font-display">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
};

// Simple loader helper icon
const LoaderIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default Checkout;

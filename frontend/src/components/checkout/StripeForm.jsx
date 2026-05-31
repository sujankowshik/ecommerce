import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Loader2 } from 'lucide-react';

const StripeForm = ({ clientSecret, totalPrice, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const isMockIntent = clientSecret?.startsWith('pi_mock_');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMockIntent) {
      // simulated sandbox capture bypass
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsProcessing(false);
      onSuccess({
        id: `ch_mock_${Math.random().toString(36).substring(4)}`,
        status: 'succeeded',
        update_time: new Date().toISOString()
      });
      return;
    }

    if (!stripe || !elements) {
      return toast.error('Stripe has not initialized correctly.');
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return toast.error('Card Element missing.');
    }

    setIsProcessing(true);
    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast.error(error.message || 'Payment confirmation failed.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment captured by Stripe!');
        onSuccess({
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString()
        });
      }
    } catch (err) {
      toast.error(err.message || 'Stripe error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#1e293b',
        fontFamily: 'Outfit, Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl space-y-4">
        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Card details</label>
        
        {isMockIntent ? (
          <div className="py-4 px-2 text-center text-sm text-primary-600 dark:text-primary-400 font-semibold border border-dashed border-primary-500/25 rounded-xl bg-primary-500/5">
            💳 Stripe Simulator Sandbox Active <br />
            <span className="text-xs font-light text-slate-500 block mt-1">No card input required! Click pay to simulate successful payment instantly.</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
            <CardElement options={cardStyle} />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isProcessing || (!stripe && !isMockIntent)}
        className="w-full btn-primary py-3 rounded-2xl flex items-center justify-center space-x-2 text-base shadow-lg shadow-primary-500/10 active:scale-98"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Securely Pay ₹{totalPrice.toFixed(2)}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default StripeForm;

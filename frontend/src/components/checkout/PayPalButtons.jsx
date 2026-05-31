import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const PayPalButtons = ({ totalPrice, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const isMock = !paypalClientId || paypalClientId === 'your_paypal_client_id';

  const handleMockPay = async () => {
    setIsProcessing(true);
    console.log('[PayPal Simulator] Triggering simulated PayPal checkout...');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    
    onSuccess({
      id: `PAYID-MOCK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: 'paypal.customer@ecommerce.com'
    });
  };

  return (
    <div className="space-y-4">
      {isMock ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 text-center">
            PayPal Credentials Missing. Sandbox PayPal simulator activated.
          </div>
          <button
            onClick={handleMockPay}
            disabled={isProcessing}
            className="w-full bg-[#FFC439] hover:bg-[#F2B522] active:scale-[0.98] text-[#111111] font-bold py-3 rounded-2xl text-center text-sm flex items-center justify-center space-x-2 transition-all"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Simulating PayPal Approval...</span>
              </>
            ) : (
              <span>Simulate PayPal Payment</span>
            )}
          </button>
        </div>
      ) : (
        <div className="p-4 bg-slate-100 rounded-2xl text-center text-xs text-slate-500">
          {/* Real PayPal Script would render PayPal Buttons here */}
          PayPal SDK Loaded. Click PayPal buttons overlay to pay.
          <button
            onClick={handleMockPay}
            className="w-full bg-[#FFC439] hover:bg-[#F2B522] text-[#111111] font-bold py-2 rounded-xl text-xs mt-3 block"
          >
            Mock Pay Bypass
          </button>
        </div>
      )}
    </div>
  );
};

export default PayPalButtons;

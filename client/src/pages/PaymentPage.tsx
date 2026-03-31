import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  IndianRupee, 
  Zap, 
  Users, 
  Handshake, 
  Trophy,
  Loader2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { apiService, apiFetch } from '../services/apiService';

interface PaymentPageProps {
  onPaymentSuccess: () => void;
}

const MembershipBenefits = [
  { icon: Users, text: "Access full referral network" },
  { icon: Handshake, text: "Submit and track referrals" },
  { icon: Zap, text: "Attend chapter meetings" },
  { icon: Trophy, text: "Appear in global leaderboard" },
  { icon: ShieldCheck, text: "Earn professional trust score" }
];

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Standard Razorpay Script Injection
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch Admin Payment Configuration
    const fetchConfig = async () => {
      try {
        const res = await apiFetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/public/payment-config`);
        const data = await res.json();
        setIsLiveMode(data.isLiveMode);
        setRazorpayKey(data.razorpayKeyId);
      } catch (err) {
        console.error('Failed to load payment config', err);
      }
    };
    fetchConfig();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (isLiveMode && razorpayKey) {
      await handleRazorpayPayment();
    } else {
      await handleDemoPayment();
    }
  };

  const handleDemoPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/course/demo-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response');
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to unlock demo access');

      const updatedUser = { ...user, paymentStatus: 'paid' };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onPaymentSuccess();
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await apiFetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/payments/create-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ amount: 999, feature: 'membership', userId: user.id })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid server response');
      }
      const order = await response.json();
      if (!response.ok) throw new Error('Order creation failed');

      const options = {
        key: order.key || razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Xoon Global",
        description: "Professional Membership",
        order_id: order.orderId,
        handler: async function (res: any) {
          try {
            const verifyRes = await apiFetch(`${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/payments/verify`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 ...(token && { 'Authorization': `Bearer ${token}` })
               },
               body: JSON.stringify(res)
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              const updatedUser = { ...user, paymentStatus: 'paid' };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              onPaymentSuccess();
            } else {
              setError('Payment verification failed');
            }
          } catch (e) {
            setError('Verification network error');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (res: any) {
        setError(res.error.description);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Activate Your Membership</h1>
        <p className="text-slate-500 font-medium">Join the professional network and start growing your business today.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Membership Benefits
          </h3>
          <div className="space-y-5">
            {MembershipBenefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <span className="text-slate-600 font-bold text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] block mb-4">Professional Plan</span>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-white">₹999</span>
              <span className="text-indigo-400 font-black uppercase text-[10px] tracking-widest">/ Yearly</span>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Unlocks all core features</span>
              </div>
              <div className="flex items-center gap-2 text-indigo-300">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold">Priority support access</span>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {error && (
              <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-in shake">
                <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                <p className="text-rose-200 text-xs font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-white hover:bg-indigo-50 text-slate-950 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {isLiveMode ? 'Pay via Razorpay' : 'Demo Unlock'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-4">
              {isLiveMode ? 'Secured by Razorpay' : 'Demo Mode Only'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

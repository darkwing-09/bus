'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, User, Phone, ShieldCheck, ArrowRight, Bus, MapPin, Clock } from 'lucide-react';

function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'male' }]);
  const [isProcessing, setIsProcessing] = useState(false);

  const tripId = params.get('trip') || '';
  const seatIds = (params.get('seats') || '').split(',');

  // Ensure passenger count matches seats
  if (passengers.length < seatIds.length) {
    const toAdd = seatIds.length - passengers.length;
    for (let i = 0; i < toAdd; i++) passengers.push({ name: '', age: '', gender: 'male' });
  }

  const updatePassenger = (idx: number, field: string, value: string) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // TODO: Create booking → Create Razorpay order → Open Razorpay checkout
    setTimeout(() => {
      router.push('/bookings');
    }, 2000);
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title mb-1">Checkout</h1>
          <p className="section-subtitle mb-8">Complete your booking</p>
        </motion.div>

        <form onSubmit={handlePayment}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Passenger Details */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-400" /> Passenger Details
                </h2>

                {seatIds.map((seatId, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge-info">Seat {seatId.replace('seat-', '')}</span>
                      <span className="text-dark-500 text-xs">Passenger {idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input type="text" placeholder="Full name" value={passengers[idx]?.name || ''} onChange={e => updatePassenger(idx, 'name', e.target.value)} className="input-field" required />
                      <input type="number" placeholder="Age" value={passengers[idx]?.age || ''} onChange={e => updatePassenger(idx, 'age', e.target.value)} className="input-field" required min={1} max={120} />
                      <select value={passengers[idx]?.gender || 'male'} onChange={e => updatePassenger(idx, 'gender', e.target.value)} className="input-field">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Payment Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-36">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                  <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-400" /> Payment
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Seats</span>
                      <span className="text-white">{seatIds.length} × ₹850</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">Service fee</span>
                      <span className="text-white">₹{seatIds.length * 17}</span>
                    </div>
                    <hr className="border-dark-700/50" />
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-xl font-bold text-gradient-blue">₹{seatIds.length * 867}</span>
                    </div>
                  </div>

                  <button type="submit" disabled={isProcessing} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>Pay Now <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>

                  <div className="flex items-center gap-2 justify-center mt-4">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-dark-500">Secured by Razorpay</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

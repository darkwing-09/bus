'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Bus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); router.push('/'); }, 1000);
  };

  const update = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-accent-950/20 to-dark-950" />
      <div className="absolute top-1/4 right-1/3 w-72 h-72 bg-accent-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-primary-500/8 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-white">BusBook</span>
          </div>

          <h1 className="text-xl font-display font-bold text-white text-center mb-2">Create account</h1>
          <p className="text-dark-400 text-sm text-center mb-8">Start your journey with BusBook</p>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="text" placeholder="Full name" value={formData.full_name} onChange={e => update('full_name', e.target.value)} className="input-field pl-11" required />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => update('email', e.target.value)} className="input-field pl-11" required />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={e => update('phone', e.target.value)} className="input-field pl-11" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input type="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={e => update('password', e.target.value)} className="input-field pl-11" required minLength={6} />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? 'Creating...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-dark-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

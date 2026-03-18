'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Bus, Shield, Zap,
  Smartphone, Star, ArrowRight, ChevronRight, Clock,
  Navigation, Wifi, BatteryCharging
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination && date) {
      router.push(`/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}`);
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/50 via-dark-950 to-dark-950" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              Live Bus Tracking Now Available
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold leading-tight mb-6">
              <span className="text-white">Travel Smarter</span>
              <br />
              <span className="text-gradient">Book Instantly</span>
            </h1>

            <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-12">
              Book bus tickets in seconds. Track your bus live on the map.
              The modern way to travel across India.
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <form onSubmit={handleSearch} className="glass-card p-6 md:p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="From city"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="input-field pl-12"
                    required
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-400" />
                  <input
                    type="text"
                    placeholder="To city"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="input-field pl-12"
                    required
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field pl-12"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 text-base">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>

              {/* Popular routes */}
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-dark-700/50">
                <span className="text-dark-500 text-sm">Popular:</span>
                {['Bangalore → Chennai', 'Mumbai → Pune', 'Delhi → Jaipur', 'Hyderabad → Vijayawada'].map((route) => (
                  <button
                    key={route}
                    type="button"
                    className="text-xs px-3 py-1.5 rounded-full bg-dark-700/50 text-dark-300 hover:text-white hover:bg-dark-600/50 transition-all border border-dark-600/30"
                  >
                    {route}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="section-title">Why Choose <span className="text-gradient">BusBook</span></h2>
            <p className="section-subtitle max-w-xl mx-auto">
              Experience bus travel reimagined with cutting-edge technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-4">
          <div className="glass-card p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-gradient-blue">{stat.value}</div>
                  <div className="text-dark-400 text-sm mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to travel <span className="text-gradient">smarter</span>?
            </h2>
            <p className="text-dark-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of travelers who book and track their bus journeys with BusBook.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/search')}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                Book Now <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/track')}
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" /> Track a Bus
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-display font-bold text-white">BusBook</span>
            </div>
            <p className="text-dark-500 text-sm">© 2024 BusBook. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-dark-500 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-dark-500 hover:text-white text-sm transition-colors">Terms</a>
              <a href="#" className="text-dark-500 hover:text-white text-sm transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: MapPin,
    title: 'Live Tracking',
    description: 'Track your bus in real-time on an interactive map. Know exactly when it arrives.',
    gradient: 'bg-gradient-to-br from-primary-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Seats locked instantly on selection. Secure payments with Razorpay integration.',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
  {
    icon: Smartphone,
    title: 'QR Tickets',
    description: 'Digital tickets with QR codes. No paper needed — just show your phone.',
    gradient: 'bg-gradient-to-br from-accent-500 to-pink-500',
  },
  {
    icon: Clock,
    title: 'Instant Booking',
    description: 'Book your seat in under 60 seconds. Quick checkout with saved preferences.',
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  {
    icon: Wifi,
    title: 'Premium Buses',
    description: 'AC, Volvo, Sleeper — choose from a wide range of premium bus types with amenities.',
    gradient: 'bg-gradient-to-br from-blue-500 to-indigo-500',
  },
  {
    icon: Star,
    title: 'Rated & Reviewed',
    description: 'Make informed decisions with real ratings and reviews from fellow travelers.',
    gradient: 'bg-gradient-to-br from-rose-500 to-red-500',
  },
];

const stats = [
  { value: '50K+', label: 'Happy Travelers' },
  { value: '200+', label: 'Routes' },
  { value: '500+', label: 'Buses' },
  { value: '4.8★', label: 'Rating' },
];

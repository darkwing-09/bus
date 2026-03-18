'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Clock, Star, Bus, Filter,
  ArrowRight, ChevronDown, Wifi, BatteryCharging, Wind
} from 'lucide-react';

// Mock search results (replace with API call)
const mockTrips = [
  {
    id: '1',
    bus: { id: '1', operator_name: 'Royal Express', bus_number: 'KA-01-AB-1234', bus_type: 'ac_seater', total_seats: 40, rating: 4.5, amenities: { wifi: true, charging: true, water: true, blanket: true }, layout_config: {}, image_url: null, created_at: '' },
    route: { id: '1', origin: 'Bangalore', destination: 'Chennai', distance_km: 350, estimated_duration_minutes: 360, stops: [], is_active: true, created_at: '' },
    departure_time: '2024-02-20T22:00:00',
    arrival_time: '2024-02-21T04:00:00',
    price: 850,
    status: 'scheduled',
    available_seats: 24,
  },
  {
    id: '2',
    bus: { id: '2', operator_name: 'Star Travels', bus_number: 'MH-02-CD-5678', bus_type: 'volvo', total_seats: 36, rating: 4.7, amenities: { wifi: true, charging: true, snacks: true, entertainment: true }, layout_config: {}, image_url: null, created_at: '' },
    route: { id: '1', origin: 'Bangalore', destination: 'Chennai', distance_km: 350, estimated_duration_minutes: 330, stops: [], is_active: true, created_at: '' },
    departure_time: '2024-02-20T23:30:00',
    arrival_time: '2024-02-21T05:00:00',
    price: 1200,
    status: 'scheduled',
    available_seats: 12,
  },
  {
    id: '3',
    bus: { id: '3', operator_name: 'Metro Liner', bus_number: 'TN-03-EF-9012', bus_type: 'ac_sleeper', total_seats: 30, rating: 4.2, amenities: { wifi: true, charging: true, water: true }, layout_config: {}, image_url: null, created_at: '' },
    route: { id: '1', origin: 'Bangalore', destination: 'Chennai', distance_km: 350, estimated_duration_minutes: 390, stops: [], is_active: true, created_at: '' },
    departure_time: '2024-02-21T00:30:00',
    arrival_time: '2024-02-21T07:00:00',
    price: 1500,
    status: 'scheduled',
    available_seats: 8,
  },
];

const busTypeLabels: Record<string, string> = {
  ac_seater: 'AC Seater',
  non_ac_seater: 'Non-AC Seater',
  ac_sleeper: 'AC Sleeper',
  non_ac_sleeper: 'Non-AC Sleeper',
  volvo: 'Volvo Multi-Axle',
};

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [origin, setOrigin] = useState(params.get('origin') || '');
  const [destination, setDestination] = useState(params.get('destination') || '');
  const [date, setDate] = useState(params.get('date') || '');
  const [sortBy, setSortBy] = useState('departure');

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getDuration = (dep: string, arr: string) => {
    const diff = new Date(arr).getTime() - new Date(dep).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Search Bar (Sticky) */}
      <div className="sticky top-16 z-40 bg-dark-950/90 backdrop-blur-xl border-b border-white/[0.06] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <form className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input type="text" placeholder="From" value={origin} onChange={e => setOrigin(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-400" />
              <input type="text" placeholder="To" value={destination} onChange={e => setDestination(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field pl-10 py-2.5 text-sm" />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-6 text-sm">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-display font-bold text-white">
              {origin || 'Bangalore'} → {destination || 'Chennai'}
            </h1>
            <p className="text-dark-400 text-sm mt-1">{mockTrips.length} buses found</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-dark-500 text-sm">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field py-2 px-3 text-sm w-auto"
            >
              <option value="departure">Departure</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {mockTrips.map((trip, i) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass-card-hover p-5 cursor-pointer"
              onClick={() => router.push(`/bus/${trip.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Operator Info */}
                <div className="md:w-48">
                  <h3 className="font-semibold text-white text-base">{trip.bus.operator_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge-info">{busTypeLabels[trip.bus.bus_type] || trip.bus.bus_type}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-dark-300">{trip.bus.rating}</span>
                  </div>
                </div>

                {/* Time & Duration */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{formatTime(trip.departure_time)}</div>
                    <div className="text-xs text-dark-500 mt-0.5">{trip.route.origin}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-dark-500">{getDuration(trip.departure_time, trip.arrival_time)}</div>
                    <div className="w-full flex items-center gap-1 my-1">
                      <div className="w-2 h-2 rounded-full bg-primary-400" />
                      <div className="flex-1 h-px bg-gradient-to-r from-primary-400 to-accent-400" />
                      <div className="w-2 h-2 rounded-full bg-accent-400" />
                    </div>
                    <div className="text-xs text-dark-500">{trip.route.distance_km} km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{formatTime(trip.arrival_time)}</div>
                    <div className="text-xs text-dark-500 mt-0.5">{trip.route.destination}</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="hidden md:flex items-center gap-2">
                  {trip.bus.amenities.wifi && <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center" title="WiFi"><Wifi className="w-3.5 h-3.5 text-dark-400" /></div>}
                  {trip.bus.amenities.charging && <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center" title="Charging"><BatteryCharging className="w-3.5 h-3.5 text-dark-400" /></div>}
                  {trip.bus.amenities.blanket && <div className="w-8 h-8 rounded-lg bg-dark-700/50 flex items-center justify-center" title="AC"><Wind className="w-3.5 h-3.5 text-dark-400" /></div>}
                </div>

                {/* Price & Action */}
                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:min-w-[120px]">
                  <div>
                    <div className="text-2xl font-bold text-white">₹{trip.price}</div>
                    <div className="text-xs text-dark-500">{trip.available_seats} seats left</div>
                  </div>
                  <button className="btn-primary text-sm py-2 px-5 flex items-center gap-1">
                    Select <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-20 min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full" /></div>}>
      <SearchContent />
    </Suspense>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Star, MapPin, Clock, Bus, Wifi,
  BatteryCharging, Wind, Droplets, UtensilsCrossed,
  Monitor, ChevronRight
} from 'lucide-react';

// Mock data (replace with API call using trip ID from params)
const mockTripDetail = {
  id: '1',
  bus: {
    id: '1', operator_name: 'Royal Express', bus_number: 'KA-01-AB-1234',
    bus_type: 'ac_seater', total_seats: 40, rating: 4.5,
    amenities: { wifi: true, charging: true, water: true, blanket: true, entertainment: true },
    layout_config: { rows: 10, cols_left: 2, cols_right: 2, aisle_after: 2 },
  },
  route: { origin: 'Bangalore', destination: 'Chennai', distance_km: 350, estimated_duration_minutes: 360, stops: [
    { name: 'Hosur', km_from_origin: 40, duration_minutes: 40 },
    { name: 'Krishnagiri', km_from_origin: 90, duration_minutes: 90 },
    { name: 'Vellore', km_from_origin: 200, duration_minutes: 210 },
  ]},
  departure_time: '2024-02-20T22:00:00',
  arrival_time: '2024-02-21T04:00:00',
  price: 850,
  status: 'scheduled',
};

// Generate seats grid
const generateSeats = () => {
  const seats = [];
  const bookedSeats = ['2A', '3B', '5D', '7A', '7B', '8C', '9A'];
  for (let row = 1; row <= 10; row++) {
    for (let col = 1; col <= 4; col++) {
      const letter = String.fromCharCode(64 + col);
      const number = `${row}${letter}`;
      seats.push({
        id: `seat-${number}`,
        seat_number: number,
        seat_type: col === 1 || col === 4 ? 'window' : 'aisle',
        row_num: row,
        col_num: col,
        is_available: !bookedSeats.includes(number),
      });
    }
  }
  return seats;
};

const amenityIcons: Record<string, any> = {
  wifi: { icon: Wifi, label: 'Free WiFi' },
  charging: { icon: BatteryCharging, label: 'Charging Point' },
  water: { icon: Droplets, label: 'Water Bottle' },
  blanket: { icon: Wind, label: 'Blanket/AC' },
  entertainment: { icon: Monitor, label: 'Entertainment' },
  snacks: { icon: UtensilsCrossed, label: 'Snacks' },
};

export default function BusDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const trip = mockTripDetail;
  const seats = generateSeats();

  const toggleSeat = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const totalPrice = selectedSeats.length * trip.price;

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getSeatClass = (seat: { id: string; is_available: boolean }) => {
    if (selectedSeats.includes(seat.id)) return 'seat-selected';
    if (!seat.is_available) return 'seat-booked';
    return 'seat-available';
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Bus Info + Seat Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bus Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">{trip.bus.operator_name}</h1>
                  <p className="text-dark-400 text-sm mt-1">{trip.bus.bus_number} • AC Seater</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-medium">{trip.bus.rating}</span>
                    <span className="text-dark-500 text-sm">(234 reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">₹{trip.price}</div>
                  <div className="text-dark-500 text-sm">per seat</div>
                </div>
              </div>

              {/* Route Timeline */}
              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{formatTime(trip.departure_time)}</div>
                    <div className="text-sm text-dark-400">{trip.route.origin}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary-500 border-2 border-primary-400" />
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-500 via-dark-600 to-accent-500 relative">
                        {trip.route.stops.map((stop, i) => (
                          <div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${(stop.km_from_origin / trip.route.distance_km) * 100}%` }}>
                            <div className="w-2 h-2 rounded-full bg-dark-400 border border-dark-300" title={stop.name} />
                          </div>
                        ))}
                      </div>
                      <div className="w-3 h-3 rounded-full bg-accent-500 border-2 border-accent-400" />
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-dark-500">{Math.floor(trip.route.estimated_duration_minutes / 60)}h {trip.route.estimated_duration_minutes % 60}m • {trip.route.distance_km} km</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">{formatTime(trip.arrival_time)}</div>
                    <div className="text-sm text-dark-400">{trip.route.destination}</div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6 pt-6 border-t border-dark-700/50">
                <h3 className="text-sm font-medium text-dark-300 mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(trip.bus.amenities).map(([key, available]) => {
                    if (!available || !amenityIcons[key]) return null;
                    const { icon: Icon, label } = amenityIcons[key];
                    return (
                      <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-700/40 border border-dark-600/30">
                        <Icon className="w-4 h-4 text-primary-400" />
                        <span className="text-xs text-dark-300">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Seat Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-lg font-display font-bold text-white mb-4">Select Your Seats</h2>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2"><div className="seat-available w-6 h-6 text-[10px]" /></div>
                <span className="text-xs text-dark-400">Available</span>
                <div className="flex items-center gap-2"><div className="seat-selected w-6 h-6 text-[10px]" /></div>
                <span className="text-xs text-dark-400">Selected</span>
                <div className="flex items-center gap-2"><div className="seat-booked w-6 h-6 text-[10px]" /></div>
                <span className="text-xs text-dark-400">Booked</span>
              </div>

              {/* Bus Layout */}
              <div className="bg-dark-800/40 rounded-2xl p-6 border border-dark-700/40">
                {/* Driver */}
                <div className="flex justify-end mb-4 pb-4 border-b border-dark-700/30">
                  <div className="w-10 h-10 rounded-lg bg-dark-700/60 border border-dark-600/40 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-dark-500" />
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, row) => (
                    <div key={row} className="flex items-center justify-center gap-1">
                      {/* Left 2 seats */}
                      {seats
                        .filter(s => s.row_num === row + 1 && s.col_num <= 2)
                        .map(seat => (
                          <motion.button
                            key={seat.id}
                            whileHover={seat.is_available ? { scale: 1.1 } : {}}
                            whileTap={seat.is_available ? { scale: 0.95 } : {}}
                            onClick={() => toggleSeat(seat.id, seat.is_available)}
                            className={getSeatClass(seat)}
                          >
                            {seat.seat_number}
                          </motion.button>
                        ))}
                      {/* Aisle */}
                      <div className="w-8" />
                      {/* Right 2 seats */}
                      {seats
                        .filter(s => s.row_num === row + 1 && s.col_num > 2)
                        .map(seat => (
                          <motion.button
                            key={seat.id}
                            whileHover={seat.is_available ? { scale: 1.1 } : {}}
                            whileTap={seat.is_available ? { scale: 0.95 } : {}}
                            onClick={() => toggleSeat(seat.id, seat.is_available)}
                            className={getSeatClass(seat)}
                          >
                            {seat.seat_number}
                          </motion.button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-36">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-display font-bold text-white mb-4">Booking Summary</h2>

                {selectedSeats.length === 0 ? (
                  <div className="text-center py-8">
                    <Bus className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                    <p className="text-dark-500 text-sm">Select seats to continue</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Route</span>
                        <span className="text-white">{trip.route.origin} → {trip.route.destination}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Departure</span>
                        <span className="text-white">{formatTime(trip.departure_time)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Seats</span>
                        <span className="text-white">
                          {selectedSeats.map(id => {
                            const seat = seats.find(s => s.id === id);
                            return seat?.seat_number;
                          }).join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Passengers</span>
                        <span className="text-white">{selectedSeats.length}</span>
                      </div>
                      <hr className="border-dark-700/50" />
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Fare ({selectedSeats.length} × ₹{trip.price})</span>
                        <span className="text-white">₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">Service fee</span>
                        <span className="text-white">₹{Math.round(totalPrice * 0.02)}</span>
                      </div>
                      <hr className="border-dark-700/50" />
                      <div className="flex justify-between">
                        <span className="text-white font-semibold">Total</span>
                        <span className="text-xl font-bold text-gradient-blue">₹{totalPrice + Math.round(totalPrice * 0.02)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/checkout?trip=${trip.id}&seats=${selectedSeats.join(',')}`)}
                      className="btn-primary w-full text-center flex items-center justify-center gap-2"
                    >
                      Continue to Checkout <ChevronRight className="w-4 h-4" />
                    </button>
                    <p className="text-dark-600 text-xs text-center mt-3">
                      Seats locked for 5 minutes after selection
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

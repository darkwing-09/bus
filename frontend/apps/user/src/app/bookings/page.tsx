'use client';

import { motion } from 'framer-motion';
import { Ticket, MapPin, Clock, ChevronRight, QrCode, Bus } from 'lucide-react';
import Link from 'next/link';

// Mock bookings
const mockBookings = [
  {
    id: '1', trip_id: '1', status: 'confirmed', boarded: false, total_amount: 1700, created_at: '2024-02-18T10:30:00',
    seat_ids: ['3A', '3B'],
    passenger_details: [{ name: 'John Doe', age: 28, gender: 'male' }, { name: 'Jane Doe', age: 26, gender: 'female' }],
    trip: {
      bus: { operator_name: 'Royal Express', bus_type: 'ac_seater', bus_number: 'KA-01-AB-1234' },
      route: { origin: 'Bangalore', destination: 'Chennai' },
      departure_time: '2024-02-20T22:00:00',
      arrival_time: '2024-02-21T04:00:00',
    },
  },
  {
    id: '2', trip_id: '2', status: 'completed', boarded: true, total_amount: 1200, created_at: '2024-02-10T14:00:00',
    seat_ids: ['5C'],
    passenger_details: [{ name: 'John Doe', age: 28, gender: 'male' }],
    trip: {
      bus: { operator_name: 'Star Travels', bus_type: 'volvo', bus_number: 'MH-02-CD-5678' },
      route: { origin: 'Mumbai', destination: 'Pune' },
      departure_time: '2024-02-15T08:00:00',
      arrival_time: '2024-02-15T11:00:00',
    },
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'badge-warning' },
  confirmed: { label: 'Confirmed', class: 'badge-success' },
  completed: { label: 'Completed', class: 'badge-info' },
  cancelled: { label: 'Cancelled', class: 'badge-danger' },
  refunded: { label: 'Refunded', class: 'badge-danger' },
};

export default function BookingsPage() {
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title mb-1">My Bookings</h1>
          <p className="section-subtitle mb-8">View and manage your bus bookings</p>
        </motion.div>

        {mockBookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Ticket className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-300 mb-2">No bookings yet</h3>
            <p className="text-dark-500 text-sm mb-6">Start your journey by searching for buses</p>
            <Link href="/search" className="btn-primary inline-flex items-center gap-2">
              Search Buses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {mockBookings.map((booking, i) => {
              const status = statusConfig[booking.status];
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-hover p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{booking.trip.bus.operator_name}</h3>
                        <span className={status.class}>{status.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-dark-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{booking.trip.route.origin} → {booking.trip.route.destination}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-dark-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(booking.trip.departure_time)}</span>
                        <span>{formatTime(booking.trip.departure_time)} – {formatTime(booking.trip.arrival_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-dark-500">Seats: {booking.seat_ids.join(', ')}</span>
                        <span className="text-xs text-dark-600">•</span>
                        <span className="text-xs text-dark-500">{booking.passenger_details.length} passenger(s)</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex md:flex-col items-center md:items-end gap-3">
                      <div className="text-xl font-bold text-white">₹{booking.total_amount}</div>
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && (
                          <Link href={`/track/${booking.trip_id}`} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Track
                          </Link>
                        )}
                        <button className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                          <QrCode className="w-3 h-3" /> QR Code
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, Gauge, Bus, Radio } from 'lucide-react';

export default function TrackPage() {
  const [tripId, setTripId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; speed: number; heading: number } | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTracking || !tripId) return;

    // Simulate location updates (replace with WebSocket connection)
    const baseLat = 12.9716;
    const baseLng = 77.5946;
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      setLocation({
        lat: baseLat + step * 0.01,
        lng: baseLng + step * 0.008,
        speed: 55 + Math.random() * 20,
        heading: 45 + Math.random() * 10,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isTracking, tripId]);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="section-title mb-1">Live Bus Tracking</h1>
          <p className="section-subtitle mb-8">Track your bus in real-time on the map</p>
        </motion.div>

        {!isTracking ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 max-w-lg mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
              <Navigation className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Enter Trip ID</h2>
            <p className="text-dark-400 text-sm mb-6">Enter your trip or booking ID to start tracking</p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Trip ID or Booking ID"
                value={tripId}
                onChange={e => setTripId(e.target.value)}
                className="input-field flex-1"
              />
              <button
                onClick={() => setIsTracking(true)}
                disabled={!tripId}
                className="btn-primary disabled:opacity-50"
              >
                Track
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card overflow-hidden"
              >
                {/* Map placeholder - replace with Mapbox */}
                <div
                  ref={mapContainer}
                  className="relative w-full h-[500px] md:h-[600px] bg-dark-800/60"
                >
                  {/* Simulated map with gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-dark-800 via-dark-900 to-primary-950/50">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                      }}
                    />

                    {/* Route line */}
                    <svg className="absolute inset-0 w-full h-full">
                      <line x1="15%" y1="80%" x2="85%" y2="20%" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8,4" opacity="0.6" />
                      <defs>
                        <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Origin marker */}
                    <div className="absolute bottom-[18%] left-[13%] flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow-lg" />
                      <span className="text-xs text-white bg-dark-800/80 px-2 py-1 rounded">Bangalore</span>
                    </div>

                    {/* Destination marker */}
                    <div className="absolute top-[18%] right-[13%] flex items-center gap-2">
                      <span className="text-xs text-white bg-dark-800/80 px-2 py-1 rounded">Chennai</span>
                      <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white shadow-lg" />
                    </div>

                    {/* Bus marker (animated) */}
                    {location && (
                      <motion.div
                        className="absolute"
                        animate={{
                          left: `${20 + ((location.lat - 12.9716) / 0.1) * 60}%`,
                          bottom: `${20 + ((location.lng - 77.5946) / 0.08) * 60}%`,
                        }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border-2 border-white animate-pulse-slow">
                            <Bus className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-50" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-dark-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dark-700/50">
                    <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span className="text-xs font-medium text-white">LIVE</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar Info */}
            <div className="lg:col-span-1 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-semibold text-dark-300 mb-4">Bus Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">In Transit</div>
                      <div className="text-xs text-dark-500">Royal Express</div>
                    </div>
                  </div>

                  {location && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                          <Gauge className="w-5 h-5 text-primary-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{Math.round(location.speed)} km/h</div>
                          <div className="text-xs text-dark-500">Current Speed</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-accent-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°</div>
                          <div className="text-xs text-dark-500">Current Position</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">~2h 15m</div>
                          <div className="text-xs text-dark-500">ETA to Destination</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-semibold text-dark-300 mb-3">Route Progress</h3>
                <div className="space-y-3">
                  {['Bangalore', 'Hosur', 'Krishnagiri', 'Vellore', 'Chennai'].map((stop, i) => (
                    <div key={stop} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i <= 1 ? 'bg-emerald-400' : 'bg-dark-600'}`} />
                        {i < 4 && <div className={`w-px h-4 ${i < 1 ? 'bg-emerald-400' : 'bg-dark-700'}`} />}
                      </div>
                      <span className={`text-sm ${i <= 1 ? 'text-white' : 'text-dark-500'}`}>{stop}</span>
                      {i <= 1 && <span className="text-xs text-emerald-400 ml-auto">✓</span>}
                    </div>
                  ))}
                </div>
              </motion.div>

              <button onClick={() => setIsTracking(false)} className="btn-secondary w-full text-sm">
                Stop Tracking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

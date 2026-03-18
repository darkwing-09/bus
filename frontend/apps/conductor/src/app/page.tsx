'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, Navigation, Users, QrCode, Megaphone, Play, Square,
  MapPin, Clock, CheckCircle2, User, Ticket, Send, Radio
} from 'lucide-react';

type TabType = 'dashboard' | 'passengers' | 'scan' | 'announce';

export default function ConductorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tripStarted, setTripStarted] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const tabs = [
    { key: 'dashboard' as TabType, icon: Bus, label: 'Trip' },
    { key: 'passengers' as TabType, icon: Users, label: 'Passengers' },
    { key: 'scan' as TabType, icon: QrCode, label: 'Scan' },
    { key: 'announce' as TabType, icon: Megaphone, label: 'Announce' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-dark-900/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Bus className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-display font-bold text-white">Conductor</span>
          </div>
          <div className="flex items-center gap-2">
            {tripStarted && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              {/* Trip Card */}
              <div className="glass-card p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="badge-info">Current Trip</span>
                  <span className={tripStarted ? 'badge-success' : 'badge-warning'}>{tripStarted ? 'In Progress' : 'Scheduled'}</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white mb-1">Royal Express</h2>
                <p className="text-dark-400 text-sm mb-4">KA-01-AB-1234 • AC Seater</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">10:00 PM</div>
                    <div className="text-xs text-dark-500">Bangalore</div>
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                    <div className="flex-1 h-px bg-gradient-to-r from-primary-400 to-accent-400" />
                    <div className="w-2 h-2 rounded-full bg-accent-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">04:00 AM</div>
                    <div className="text-xs text-dark-500">Chennai</div>
                  </div>
                </div>

                {/* Trip stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 rounded-xl bg-dark-800/40">
                    <div className="text-lg font-bold text-white">32</div>
                    <div className="text-xs text-dark-500">Passengers</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-dark-800/40">
                    <div className="text-lg font-bold text-emerald-400">24</div>
                    <div className="text-xs text-dark-500">Boarded</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-dark-800/40">
                    <div className="text-lg font-bold text-amber-400">8</div>
                    <div className="text-xs text-dark-500">Pending</div>
                  </div>
                </div>

                {/* Start/End Trip Button */}
                {!tripStarted ? (
                  <button onClick={() => setTripStarted(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Start Trip
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button className="btn-accent w-full flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" /> Update Location
                    </button>
                    <button onClick={() => setTripStarted(false)} className="btn-secondary w-full flex items-center justify-center gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
                      <Square className="w-4 h-4" /> End Trip
                    </button>
                  </div>
                )}
              </div>

              {/* Route Progress */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-dark-300 mb-4">Route Progress</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Bangalore', time: '10:00 PM', done: true },
                    { name: 'Hosur', time: '10:40 PM', done: tripStarted },
                    { name: 'Krishnagiri', time: '11:30 PM', done: false },
                    { name: 'Vellore', time: '01:30 AM', done: false },
                    { name: 'Chennai', time: '04:00 AM', done: false },
                  ].map((stop, i, arr) => (
                    <div key={stop.name} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${stop.done ? 'bg-emerald-400' : 'bg-dark-600'} border-2 ${stop.done ? 'border-emerald-400' : 'border-dark-500'}`} />
                        {i < arr.length - 1 && <div className={`w-px h-6 ${stop.done ? 'bg-emerald-400' : 'bg-dark-700'}`} />}
                      </div>
                      <div className="flex-1 flex justify-between items-start -mt-0.5">
                        <span className={`text-sm ${stop.done ? 'text-white' : 'text-dark-500'}`}>{stop.name}</span>
                        <span className={`text-xs ${stop.done ? 'text-emerald-400' : 'text-dark-600'}`}>{stop.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'passengers' && (
            <motion.div key="passengers" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-display font-bold text-white mb-4">Passengers</h2>
              <div className="space-y-2">
                {[
                  { name: 'John Doe', seats: '3A, 3B', boarded: true },
                  { name: 'Jane Smith', seats: '5C', boarded: true },
                  { name: 'Mike Wilson', seats: '7D', boarded: false },
                  { name: 'Sarah Lee', seats: '8A, 8B', boarded: false },
                  { name: 'Alex Kumar', seats: '9C', boarded: true },
                ].map((p, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${p.boarded ? 'bg-emerald-500/10' : 'bg-dark-700/50'} flex items-center justify-center`}>
                      <User className={`w-5 h-5 ${p.boarded ? 'text-emerald-400' : 'text-dark-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{p.name}</div>
                      <div className="text-xs text-dark-500">Seats: {p.seats}</div>
                    </div>
                    <span className={p.boarded ? 'badge-success' : 'badge-warning'}>{p.boarded ? 'Boarded' : 'Pending'}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-display font-bold text-white mb-4">Scan Ticket</h2>
              <div className="glass-card p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
                  <QrCode className="w-10 h-10 text-primary-400" />
                </div>
                <p className="text-dark-400 text-sm mb-6">Scan the QR code on passenger's ticket</p>
                <button onClick={() => setScanResult('verified')} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
                  <QrCode className="w-4 h-4" /> Open Scanner
                </button>

                {scanResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">Ticket Verified</p>
                    <p className="text-dark-400 text-xs mt-1">Passenger marked as boarded</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'announce' && (
            <motion.div key="announce" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-lg font-display font-bold text-white mb-4">Announcements</h2>
              <div className="glass-card p-5">
                <textarea
                  placeholder="Type your announcement..."
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  rows={4}
                  className="input-field resize-none mb-4"
                />
                <button className="btn-primary w-full flex items-center justify-center gap-2" disabled={!announcement}>
                  <Send className="w-4 h-4" /> Send to All Passengers
                </button>

                <div className="mt-6 space-y-3">
                  <h4 className="text-sm text-dark-400">Quick Messages</h4>
                  {['Bus departing in 5 minutes', 'Rest stop in 15 minutes', 'Arriving at destination soon'].map(msg => (
                    <button key={msg} onClick={() => setAnnouncement(msg)} className="w-full text-left p-3 rounded-xl bg-dark-800/40 border border-dark-700/30 text-sm text-dark-300 hover:text-white hover:bg-dark-700/40 transition-all">
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="sticky bottom-0 bg-dark-900/90 backdrop-blur-xl border-t border-white/[0.06] px-4 py-2">
        <div className="flex justify-around max-w-lg mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-dark-500 hover:text-dark-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bus, Route as RouteIcon, CalendarClock, Users,
  Ticket, BarChart3, Settings, LogOut, Menu, X, ChevronRight,
  TrendingUp, DollarSign, UserCheck, MapPin, Plus
} from 'lucide-react';

// Sidebar Navigation
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', key: 'dashboard' },
  { icon: Bus, label: 'Buses', key: 'buses' },
  { icon: RouteIcon, label: 'Routes', key: 'routes' },
  { icon: CalendarClock, label: 'Trips', key: 'trips' },
  { icon: Users, label: 'Users', key: 'users' },
  { icon: Ticket, label: 'Bookings', key: 'bookings' },
  { icon: BarChart3, label: 'Analytics', key: 'analytics' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-dark-900/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Bus className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="text-lg font-display font-bold text-white">Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.key
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800/50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle */}
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-xl text-dark-500 hover:text-white hover:bg-dark-800/50 transition-all">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-dark-950">
        <div className="p-6 md:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'buses' && <BusesView />}
          {activeTab === 'routes' && <RoutesView />}
          {activeTab === 'trips' && <TripsView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'bookings' && <BookingsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView() {
  const stats = [
    { label: 'Total Users', value: '12,456', icon: Users, color: 'from-primary-500 to-cyan-500', change: '+12%' },
    { label: 'Total Bookings', value: '8,234', icon: Ticket, color: 'from-emerald-500 to-teal-500', change: '+8%' },
    { label: 'Revenue', value: '₹24.5L', icon: DollarSign, color: 'from-amber-500 to-orange-500', change: '+15%' },
    { label: 'Active Trips', value: '48', icon: MapPin, color: 'from-accent-500 to-pink-500', change: '+3' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-emerald-400 text-xs font-medium flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-dark-500 text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="glass-card p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-500 border-b border-dark-700/50">
                <th className="pb-3 pr-4">Booking ID</th>
                <th className="pb-3 pr-4">Route</th>
                <th className="pb-3 pr-4">Passenger</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-dark-200">
              {[
                { id: 'BK-001', route: 'BLR → CHN', passenger: 'John Doe', amount: '₹1,700', status: 'confirmed' },
                { id: 'BK-002', route: 'MUM → PUN', passenger: 'Jane Smith', amount: '₹1,200', status: 'confirmed' },
                { id: 'BK-003', route: 'DEL → JAI', passenger: 'Mike Wilson', amount: '₹950', status: 'pending' },
                { id: 'BK-004', route: 'HYD → VIJ', passenger: 'Sarah Lee', amount: '₹800', status: 'cancelled' },
              ].map(b => (
                <tr key={b.id} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                  <td className="py-3 pr-4 font-mono text-xs">{b.id}</td>
                  <td className="py-3 pr-4">{b.route}</td>
                  <td className="py-3 pr-4">{b.passenger}</td>
                  <td className="py-3 pr-4 font-medium">{b.amount}</td>
                  <td className="py-3">
                    <span className={b.status === 'confirmed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-danger'}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function BusesView() {
  const buses = [
    { id: '1', number: 'KA-01-AB-1234', operator: 'Royal Express', type: 'AC Seater', seats: 40, rating: 4.5 },
    { id: '2', number: 'MH-02-CD-5678', operator: 'Star Travels', type: 'Volvo', seats: 36, rating: 4.7 },
    { id: '3', number: 'TN-03-EF-9012', operator: 'Metro Liner', type: 'AC Sleeper', seats: 30, rating: 4.2 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Buses</h1>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Bus</button>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-dark-500 border-b border-dark-700/50">
            <th className="p-4">Bus Number</th><th className="p-4">Operator</th><th className="p-4">Type</th><th className="p-4">Seats</th><th className="p-4">Rating</th><th className="p-4">Actions</th>
          </tr></thead>
          <tbody className="text-dark-200">
            {buses.map(bus => (
              <tr key={bus.id} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                <td className="p-4 font-mono text-xs">{bus.number}</td>
                <td className="p-4">{bus.operator}</td>
                <td className="p-4"><span className="badge-info">{bus.type}</span></td>
                <td className="p-4">{bus.seats}</td>
                <td className="p-4">⭐ {bus.rating}</td>
                <td className="p-4"><button className="text-primary-400 hover:text-primary-300 text-xs">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function RoutesView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Routes</h1>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Route</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { origin: 'Bangalore', destination: 'Chennai', distance: 350, duration: '6h' },
          { origin: 'Mumbai', destination: 'Pune', distance: 150, duration: '3h' },
          { origin: 'Delhi', destination: 'Jaipur', distance: 280, duration: '5h' },
          { origin: 'Hyderabad', destination: 'Vijayawada', distance: 275, duration: '5h' },
        ].map((route, i) => (
          <div key={i} className="glass-card-hover p-5">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              <span className="text-white font-medium">{route.origin} → {route.destination}</span>
            </div>
            <div className="text-dark-500 text-sm">{route.distance} km • {route.duration}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TripsView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Trips</h1>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Create Trip</button>
      </div>
      <div className="glass-card p-5">
        <p className="text-dark-400 text-sm">Manage trips — assign buses, routes, conductors, and set schedules.</p>
        <div className="mt-4 space-y-3">
          {['Bangalore → Chennai (Royal Express)', 'Mumbai → Pune (Star Travels)', 'Delhi → Jaipur (Metro Liner)'].map((trip, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-dark-700/30">
              <span className="text-white text-sm">{trip}</span>
              <span className="badge-success">Scheduled</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function UsersView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Users</h1>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Conductor</button>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-dark-500 border-b border-dark-700/50">
            <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th>
          </tr></thead>
          <tbody className="text-dark-200">
            {[
              { name: 'System Admin', email: 'admin@busbook.com', role: 'admin', active: true },
              { name: 'Demo Conductor', email: 'conductor@busbook.com', role: 'conductor', active: true },
              { name: 'John Doe', email: 'john@example.com', role: 'user', active: true },
            ].map((u, i) => (
              <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-800/30">
                <td className="p-4 font-medium text-white">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><span className={u.role === 'admin' ? 'badge-danger' : u.role === 'conductor' ? 'badge-warning' : 'badge-info'}>{u.role}</span></td>
                <td className="p-4"><span className="badge-success">Active</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function BookingsView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Bookings</h1>
      <div className="glass-card p-5">
        <p className="text-dark-400 text-sm mb-4">View, cancel, and manage refunds for all bookings.</p>
        <div className="text-dark-500 text-center py-8">Booking management table — loads from API.</div>
      </div>
    </motion.div>
  );
}

function AnalyticsView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-300 mb-4">Revenue Trend</h3>
          <div className="h-48 flex items-end gap-2">
            {[40, 65, 50, 80, 70, 90, 85, 95, 75, 100, 88, 92].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-sm opacity-80"
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-dark-600">
            <span>Jan</span><span>Jun</span><span>Dec</span>
          </div>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-dark-300 mb-4">Bookings by Route</h3>
          <div className="space-y-3">
            {[
              { route: 'BLR → CHN', pct: 35 },
              { route: 'MUM → PUN', pct: 28 },
              { route: 'DEL → JAI', pct: 22 },
              { route: 'HYD → VIJ', pct: 15 },
            ].map(item => (
              <div key={item.route}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-300">{item.route}</span>
                  <span className="text-dark-500">{item.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-dark-700/50 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

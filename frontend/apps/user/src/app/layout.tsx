import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'BusBook — Book Bus Tickets & Track Live',
  description: 'Modern bus booking platform with live tracking. Book seats, track your bus in real-time, and travel smarter.',
  keywords: 'bus booking, live tracking, bus tickets, travel, BusBook',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

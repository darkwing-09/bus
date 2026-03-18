import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BusBook Admin Panel',
  description: 'Administration dashboard for BusBook platform',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

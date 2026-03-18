import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BusBook Conductor Panel',
  description: 'Conductor dashboard for bus trip management',
};

export default function ConductorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Nomad Cities 2026 Report',
  description: 'Data-driven report ranking the top 50 digital nomad cities by cost of living, internet speed, weather, and livability.',
  robots: { index: true, follow: true },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}

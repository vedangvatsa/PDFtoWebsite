import { Metadata } from 'next';
import TimezoneClient from '@/components/timezone-client';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cvin.bio';

export const metadata: Metadata = {
  title: 'Timezone Overlap Tool | Find Shared Work Hours',
  description: 'See work hour overlap between cities worldwide. Plan meetings across time zones and test how overlap changes if you move.',
  keywords: ['timezone overlap', 'remote work', 'time zone calculator', 'meeting planner', 'distributed team'],
  alternates: { canonical: `${siteUrl}/timezone` },
  openGraph: { title: 'Timezone Overlap Tool', description: 'Find shared work hours across time zones.', url: `${siteUrl}/timezone`, siteName: 'CVin.Bio', type: 'website' },
};

export default function TimezonePage() {
  return <TimezoneClient />;
}

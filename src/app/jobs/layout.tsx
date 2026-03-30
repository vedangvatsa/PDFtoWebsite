import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remote Jobs | CVin.Bio',
  description: 'Discover remote jobs matched to your skills. Powered by CVin.Bio — upload your CV and find roles that fit you.',
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

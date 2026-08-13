import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Interview Question Bank',
  description:
    'Interview questions for agent, RAG, fine-tuning, MLOps, safety, research, and ML roles. Short answers, follow-ups, and scoring notes.',
  alternates: { canonical: '/aiq' },
};

export default function AiqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { Suspense } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import SignUpForm from './signup-form';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your CVin.Bio account to continue editing and sharing your professional profile.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="absolute left-4 top-4">
          <Link href="/" className="flex items-center space-x-2 text-primary hover:underline">
            <Icons.logo className="h-6 w-6" />
            <span className="font-semibold text-sm">CVin.Bio</span>
          </Link>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to CVin.Bio</CardTitle>
            <CardDescription>Sign in to continue editing and sharing your profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignUpForm />
          </CardContent>
        </Card>
      </div>
    </Suspense>
  );
}

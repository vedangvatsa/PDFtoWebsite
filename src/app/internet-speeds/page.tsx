import { redirect } from 'next/navigation';

export default function RedirectPage() {
  redirect('/rankings?tab=internet');
}

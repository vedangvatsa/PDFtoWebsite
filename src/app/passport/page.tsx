import { redirect } from 'next/navigation';

export default function RedirectPage() {
  redirect('/visas?tab=checker');
}

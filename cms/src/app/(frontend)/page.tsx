import { redirect } from 'next/navigation'

// The CMS has no public frontend — send visitors straight to the admin panel.
export default function Home() {
  redirect('/admin')
}

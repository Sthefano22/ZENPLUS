import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sesion = cookies().get('zenplus_session')?.value
  if (!sesion) {
    redirect('/login?next=/dashboard')
  }

  return <DashboardShell>{children}</DashboardShell>
}

import { redirect } from 'next/navigation'
import ScanResultClient from '@/components/ScanResultClient'

export default async function ScanResultPage({
  params,
  searchParams: resolvedSearchParams,
}: {
  params: { id?: string },
  searchParams: Promise<{ name?: string; status?: string }>
}) {
  const searchParams = await resolvedSearchParams
  const name = searchParams.name
  const status = searchParams.status
  const gymId = params.id

  if (!name || !['active', 'inactive'].includes(status ?? '')) {
    redirect('/scan')
  }

  return (
    <ScanResultClient 
      name={name as string} 
      status={status as string}
      gymId={gymId}
    />
  )
}
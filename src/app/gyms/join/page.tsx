// app/gyms/join/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { InvitationForm } from '@/components/gyms/InvitationForm'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface Invitation {
  id: string
  email: string
  gym_id: string
  accepted: boolean
  created_at: string
  gyms: {
    name: string
  }
}

export default function JoinGym() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserAndInvites = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (!user || error) {
        router.push('/login?message=Please login to view invitations')
        return
      }

      setUser(user)

      const { data: invites, error: inviteError } = await supabase
        .from('invitations')
        .select('*, gyms(name)')
        .eq('email', user.email)
        .eq('accepted', false)
        .order('created_at', { ascending: false })

      if (inviteError) {
        console.error('Erreur invitations:', inviteError)
      }

      setInvitations(invites || [])
      setLoading(false)
    }

    fetchUserAndInvites()
  }, [supabase, router])

  if (loading) {
    return <p className="p-8">Chargement en cours...</p>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Rejoindre un gym</h1>

      {invitations.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Invitations en attente</h2>
          {invitations.map(invite => (
            <InvitationForm key={invite.id} invitation={invite} userId={user?.id || ''} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <p>Vous n&apos;avez pas d&apos;invitation en attente.</p>
          <p>Demandez à un administrateur de votre gym de vous envoyer une invitation.</p>
        </div>
      )}
    </div>
  )
}
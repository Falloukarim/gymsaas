'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // VÉRIFIER SI L'UTILISATEUR A DÉJÀ UN GYM
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: gbus } = await supabase
      .from('gbus')
      .select('gym_id')
      .eq('user_id', user.id)

    if (gbus && gbus.length > 0) {
      redirect(`/gyms/${gbus[0].gym_id}/dashboard`)
    }

    // Vérifier les invitations
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', user.email)
      .eq('accepted', false)

    if (invitations && invitations.length > 0) {
      redirect('/gyms/join')
    }
  }

  // Si pas de gym et pas d'invitations
  redirect('/gyms/select')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/login?message=Could not sign up user')
  }

  // VÉRIFIER LES INVITATIONS APRÈS INSCRIPTION
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', user.email)
      .eq('accepted', false)

    if (invitations && invitations.length > 0) {
      redirect('/gyms/join')
    }
  }

  // Si pas d'invitations
  redirect('/gyms/select')
}
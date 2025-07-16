// app/api/create-user/route.ts
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseAdmin = createAdminClient()
  const { email, password, user_metadata } = await request.json()

  // 1. Création de l'utilisateur dans Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata,
    email_confirm: true // Pour bypasser la vérification email
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // 2. Insertion dans votre table users
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      role: 'user'
    })

  if (dbError) {
    // Rollback: suppression de l'utilisateur Auth si échec
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const errorRedirect = '/login?message=Erreur de confirmation'

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL(errorRedirect, request.url))
  }

  const supabase = createClient()
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  })

  if (error) {
    console.error('Error verifying OTP:', error.message)
    return NextResponse.redirect(new URL(`${errorRedirect}&details=${encodeURIComponent(error.message)}`, request.url))
  }

  // Création d'une réponse de redirection
  const response = NextResponse.redirect(new URL(next, request.url))
  
  // Optionnel : Rafraîchir la session
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    // Vous pouvez ajouter des cookies personnalisés ici si nécessaire
  }

  return response
}
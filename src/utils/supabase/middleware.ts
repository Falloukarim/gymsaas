import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Vérification de la session
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    if (!request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Récupération FORCÉE des associations gbus sans cache
  const { data: gbus, error: gbusError } = await supabase
    .from('gbus')
    .select('gym_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Debug: log des données récupérées
  console.log('Middleware - User GBUS:', { userId: user.id, gbus })

  // Nouvel utilisateur sans gym
  if ((!gbus || gbus.length === 0) && !request.nextUrl.pathname.startsWith('/gyms/new')) {
    return NextResponse.redirect(new URL('/gyms/new', request.url))
  }

  // Utilisateur avec gym sur la page de création
  if (gbus && gbus.length > 0 && request.nextUrl.pathname.startsWith('/gyms/new')) {
    return NextResponse.redirect(new URL(`/gyms/${gbus[0].gym_id}/dashboard`, request.url))
  }

  // Redirection du dashboard général
  if (gbus && gbus.length > 0 && request.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL(`/gyms/${gbus[0].gym_id}/dashboard`, request.url))
  }

  // Vérification spécifique pour les routes /gyms/[id]
  if (request.nextUrl.pathname.startsWith('/gyms/') && !request.nextUrl.pathname.startsWith('/gyms/new')) {
    const gymId = request.nextUrl.pathname.split('/')[2]
    if (!gymId) {
      return NextResponse.redirect(new URL('/gyms/new', request.url))
    }

    const { data: userAccess, error: accessError } = await supabase
      .from('gbus')
      .select()
      .eq('gym_id', gymId)
      .eq('user_id', user.id)
      .single()

    if (accessError || !userAccess) {
      console.error('Accès refusé au gym', { userId: user.id, gymId })
      return NextResponse.redirect(new URL('/gyms/new', request.url))
    }
  }

  return response
}
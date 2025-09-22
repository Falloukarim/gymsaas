import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/redirect']
const POST_LOGIN_PATHS = ['/gyms/join', '/gyms/select', '/gyms/new']
const ALLOWED_WITHOUT_GBUS = ['/gyms/new', '/gyms/select', '/gyms/join']
const ALLOWED_WITHOUT_SUBSCRIPTION = ['/subscription', '/payment-callback']
const ADMIN_PATHS = ['/admin']

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

  // 1. Vérification de la session
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // 2. Vérification spéciale pour les routes admin
  if (ADMIN_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (authError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Vérifier si l'utilisateur a le rôle superadmin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Seul le superadmin peut accéder à la page d'administration
    if (!userData || userData.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response;
  }

  // 3. Récupérer les gyms de l'utilisateur
  const { data: gbus } = await supabase
    .from('gbus')
    .select('gym_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // 4. Vérification IMPORTANTE: Si l'utilisateur est sur une page publique mais est connecté
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (gbus && gbus.length > 0) {
      // L'utilisateur a déjà un gym → redirection directe vers le dashboard
      return NextResponse.redirect(new URL(`/gyms/${gbus[0].gym_id}/dashboard`, request.url))
    } else {
      // Sinon, il choisit/crée un gym
      return NextResponse.redirect(new URL('/gyms/select', request.url))
    }
  }

  // 5. Vérification spéciale pour /gyms/join
  if (request.nextUrl.pathname.startsWith('/gyms/join')) {
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', user.email)
      .eq('accepted', false)
      .maybeSingle()

    if (!invitations) {
      return NextResponse.redirect(new URL('/gyms/select', request.url))
    }
  }

  // 6. Vérification des accès aux gyms
  if ((!gbus || gbus.length === 0) && 
      !ALLOWED_WITHOUT_GBUS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/gyms/select', request.url))
  }

  // 7. Vérification des accès à un gym spécifique
  if (request.nextUrl.pathname.startsWith('/gyms/') && 
      !POST_LOGIN_PATHS.some(p => request.nextUrl.pathname.startsWith(p))) {
    
    const gymId = request.nextUrl.pathname.split('/')[2]
    if (!gymId) {
      return NextResponse.redirect(new URL('/gyms/select', request.url))
    }

    const { data: userAccess } = await supabase
      .from('gbus')
      .select()
      .eq('gym_id', gymId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!userAccess) {
      return NextResponse.redirect(new URL('/gyms/select', request.url))
    }

    // 8. Vérification de l'abonnement
    if (!ALLOWED_WITHOUT_SUBSCRIPTION.includes(request.nextUrl.pathname)) {
      const { data: gym } = await supabase
        .from('gyms')
        .select('subscription_active, trial_end_date, trial_used')
        .eq('id', gymId)
        .single()

      const isTrialActive = gym?.trial_end_date 
        && new Date(gym.trial_end_date) > new Date() 
        && gym.trial_used === false

      const hasActiveSubscription = gym?.subscription_active || isTrialActive

      if (!hasActiveSubscription && !ALLOWED_WITHOUT_SUBSCRIPTION.includes(request.nextUrl.pathname)) {
        console.log('Redirection vers /subscription', {
          subscription_active: gym?.subscription_active,
          trial_end_date: gym?.trial_end_date,
          trial_used: gym?.trial_used
        })
        return NextResponse.redirect(new URL('/subscription', request.url))
      }
    }
  }

  return response
}

// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
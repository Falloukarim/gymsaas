import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/redirect']
const POST_LOGIN_PATHS = ['/gyms/join', '/gyms/select', '/gyms/new']
const ALLOWED_WITHOUT_GBUS = ['/gyms/new', '/gyms/select', '/gyms/join']
const ALLOWED_WITHOUT_SUBSCRIPTION = ['/subscription', '/payment-callback'] // Nouveaux chemins autorisés

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

  // 2. Si pas authentifié
  if (authError || !user) {
    if (!PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // 3. Vérification spéciale pour /gyms/join
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

  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/gyms/select', request.url))
  }

  const { data: gbus } = await supabase
    .from('gbus')
    .select('gym_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if ((!gbus || gbus.length === 0) && 
      !ALLOWED_WITHOUT_GBUS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/gyms/select', request.url))
  }

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

    if (!ALLOWED_WITHOUT_SUBSCRIPTION.includes(request.nextUrl.pathname)) {
const { data: gym } = await supabase
  .from('gyms')
  .select('subscription_active, trial_end_date, trial_used')
  .eq('id', gymId)
  .single();

const isTrialActive = gym?.trial_end_date 
  && new Date(gym.trial_end_date) > new Date() 
  && gym.trial_used === false;

const hasActiveSubscription = gym?.subscription_active || isTrialActive;

if (!hasActiveSubscription && !ALLOWED_WITHOUT_SUBSCRIPTION.includes(request.nextUrl.pathname)) {
  console.log('Redirection vers /subscription', {
    subscription_active: gym?.subscription_active,
    trial_end_date: gym?.trial_end_date,
    trial_used: gym?.trial_used
  });
  return NextResponse.redirect(new URL('/subscription', request.url));
}
    }
  }

  return response
}

export const config = {
  matcher: '/api/subscriptions/:path*',
};
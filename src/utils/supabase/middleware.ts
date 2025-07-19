import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/redirect']
const POST_LOGIN_PATHS = ['/gyms/join', '/gyms/select', '/gyms/new']
const ALLOWED_WITHOUT_GBUS = ['/gyms/new', '/gyms/select', '/gyms/join']

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

  // 1. Vérification de la session avec timeout
  let authResult;
  try {
    authResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )
    ]);
  } catch (error) {
    console.error('Auth check timeout:', error);
    if (!PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response;
  }

  const { data: { user }, error: authError } = authResult as any;

  // 2. Si pas authentifié
  if (authError || !user) {
    if (!PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response;
  }

  // 3. Vérification spéciale pour /gyms/join
  if (request.nextUrl.pathname.startsWith('/gyms/join')) {
    // Vérifier les invitations avant toute redirection
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', user.email)
      .eq('accepted', false)
      .maybeSingle();

    if (invitations) {
      return response; // Laisser passer
    } else {
      return NextResponse.redirect(new URL('/gyms/select', request.url));
    }
  }

  // 4. Si authentifié mais sur une route publique (sauf post-login)
  if (PUBLIC_PATHS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/gyms/select', request.url))
  }

  // 5. Récupération des associations gbus avec cache court
  const { data: gbus } = await supabase
    .from('gbus')
    .select('gym_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // 6. Routes autorisées sans gbus
  if ((!gbus || gbus.length === 0) && 
      !ALLOWED_WITHOUT_GBUS.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/gyms/select', request.url))
  }

  // 7. Vérification des permissions pour /gyms/[id]
  if (request.nextUrl.pathname.startsWith('/gyms/') && 
      !POST_LOGIN_PATHS.some(p => request.nextUrl.pathname.startsWith(p))) {
    
    const gymId = request.nextUrl.pathname.split('/')[2];
    if (!gymId) {
      return NextResponse.redirect(new URL('/gyms/select', request.url));
    }

    const { data: userAccess } = await supabase
      .from('gbus')
      .select()
      .eq('gym_id', gymId)
      .eq('user_id', user.id)
      .maybeSingle(); // Utiliser maybeSingle au lieu de single

    if (!userAccess) {
      return NextResponse.redirect(new URL('/gyms/select', request.url));
    }
  }

  return response;
}
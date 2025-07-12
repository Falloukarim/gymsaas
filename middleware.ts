import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  const { data: { session } } = await supabase.auth.getSession();

  // 1. Redirection si non connecté
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/private')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // 2. Vérification des gyms
  const { data: gbus } = await supabase
    .from('gbus')
    .select('gym_id, role')
    .eq('user_id', session.user.id);

  // 3. Redirection si aucun gym
  if ((!gbus || gbus.length === 0) && request.nextUrl.pathname !== '/gyms/new') {
    return NextResponse.redirect(new URL('/gyms/new', request.url));
  }

  // 4. Protection des routes admin
  if (request.nextUrl.pathname.startsWith('/admin/roles')) {
    const isOwner = gbus?.some(g => g.role === 'owner');
    if (!isOwner) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/private/:path*',
    '/gyms/new',
    '/admin/roles/:path*'
  ]
};
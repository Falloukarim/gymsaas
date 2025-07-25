// src/app/api/renew-subscription/route.ts
import { renewSubscription } from '@/actions/subscriptions/renew';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { memberId, gymId, subscriptionId } = await request.json();

  if (!memberId || !gymId || !subscriptionId) {
    return NextResponse.json(
      { error: 'Paramètres manquants' },
      { status: 400 }
    );
  }

  try {
    const result = await renewSubscription(memberId, gymId, subscriptionId);
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
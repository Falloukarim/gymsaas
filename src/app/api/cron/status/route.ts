// Dans votre API Next.js - /api/cron/status/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Récupérer le statut du cron
    const { data: status, error: statusError } = await (await supabase)
      .rpc('get_cron_status');

    // Récupérer les alertes actives
    const { data: alerts, error: alertsError } = await (await supabase)
      .rpc('get_active_alerts');

    // Récupérer la santé du système
    const { data: health, error: healthError } = await (await supabase)
      .rpc('get_cron_health');

    if (statusError || alertsError || healthError) {
      throw new Error('Erreur lors de la récupération des statuts');
    }

    return NextResponse.json({
      success: true,
      data: {
        status: status?.[0] || null,
        alerts: alerts || [],
        health: health || []
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur monitoring cron:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur de monitoring',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
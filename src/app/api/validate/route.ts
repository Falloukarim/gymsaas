import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { qrCode, gymId } = await request.json() // Ajout de gymId depuis le frontend

  console.log("📥 Requête reçue - QR Code:", qrCode, "Gym ID:", gymId)

  try {
    // 1. Recherche du membre
    console.log("🔍 Recherche du membre avec QR Code:", qrCode)
    const { data: member, error: memberError } = await (await supabase)
      .from('members')
      .select(`
        id,
        full_name,
        gym_id,
        member_subscriptions!inner(
          end_date,
          status,
          subscriptions!inner(
            type
          )
        )
      `)
      .eq('qr_code', qrCode)
      .single()

    if (memberError || !member) {
      console.error("❌ Erreur recherche membre:", memberError?.message || "Membre non trouvé")
      return NextResponse.json(
        { 
          valid: false, 
          error: memberError?.message || 'Membre non trouvé',
          details: { qrCode }
        },
        { status: 404 }
      )
    }

    console.log("✅ Membre trouvé:", {
      id: member.id,
      name: member.full_name,
      gym_id: member.gym_id
    })

    // 2. Vérification de l'abonnement
    const activeSubscription = member.member_subscriptions.find(
      (      sub: { end_date: string | number | Date; status: string }) => new Date(sub.end_date) > new Date() && sub.status === 'active'
    )

    const accessGranted = !!activeSubscription
    console.log("🔍 Statut abonnement:", {
      accessGranted,
subscriptionType: (activeSubscription as any)?.subscriptions?.type,
      endDate: activeSubscription?.end_date
    })

    // 3. Enregistrement de l'accès
    console.log("📝 Enregistrement de l'accès dans la base...")
    const { error: logError } = await (await supabase)
      .from('access_logs')
      .insert({
        member_id: member.id,
        gym_id: gymId || member.gym_id, // Utilise gymId du frontend ou du membre
        access_granted: accessGranted,
        access_method: 'qr',
        details: {
          member_name: member.full_name,
          subscription_type: (activeSubscription?.subscriptions as any)?.type,
          attempted_at: new Date().toISOString()
        }
      })

    if (logError) {
      console.error("❌ Erreur enregistrement accès:", logError)
      throw new Error("Erreur lors de l'enregistrement de l'accès")
    }

    console.log("📌 Accès enregistré avec succès")
    const subscriptionStatus = accessGranted ? 'active' : 'inactive';

  return NextResponse.json({
  valid: true,
  accessGranted,
  subscriptionStatus, // 🔥 clé ajoutée ici
  member: {
    id: member.id,
    name: member.full_name,
    gym_id: member.gym_id
  },
  subscription: activeSubscription ? {
    type: (activeSubscription?.subscriptions as any)?.type,
    end_date: activeSubscription.end_date,
    status: 'active'
  } : null,
      log: {
        timestamp: new Date().toISOString(),
        status: accessGranted ? 'granted' : 'denied'
      }
    })

  } catch (error) {
    console.error("🔥 Erreur serveur:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      qrCode
    })

    return NextResponse.json(
      { 
        valid: false, 
        error: 'Erreur serveur',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : undefined,
          stack: error instanceof Error ? error.stack : undefined
        } : null
      },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { qrCode } = await request.json()

  console.log("📥 Code QR reçu :", qrCode)

  try {
    const { data: member, error } = await (await supabase)
      .from('members')
      .select(`
        id,
        full_name,
        member_subscriptions!inner(
          end_date,
          status
        )
      `)
      .eq('qr_code', qrCode)
      .single()

    if (error || !member) {
      console.error("❌ Membre non trouvé ou erreur Supabase :", error)
      return NextResponse.json(
        { valid: false, error: 'Membre non trouvé' },
        { status: 404 }
      )
    }

    console.log("👤 Membre trouvé :", member)

    const hasActiveSubscription = member.member_subscriptions.some(
      sub => new Date(sub.end_date) > new Date() && sub.status === 'active'
    )

    return NextResponse.json({
      valid: true,
      member: {
        id: member.id,
        name: member.full_name
      },
      subscriptionStatus: hasActiveSubscription ? 'active' : 'inactive'
    })
  } catch (error) {
    console.error("🔥 Erreur serveur :", error)
    return NextResponse.json(
      { valid: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

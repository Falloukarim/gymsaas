'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { toDataURL } from 'qrcode';
import { uploadQRCode } from '@/utils/cloudinary';

export async function createMember(formData: FormData) {
  const supabase = createClient();

  // Récupérer l'utilisateur connecté
  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) return { error: 'Authentication required' };

  // Extraction des données du formulaire
  const memberData = {
    gym_id: formData.get('gym_id')?.toString() || '',
    full_name: formData.get('full_name')?.toString() || '',
    email: formData.get('email')?.toString(),
    phone: formData.get('phone')?.toString() || '',
    role: 'member',
  };

  const subscription_id = formData.get('subscription_id')?.toString();
  const session_amount = formData.get('session_amount')?.toString();

  // Validation
  if (!memberData.gym_id || !memberData.full_name || !memberData.phone) {
    return { error: 'Tous les champs obligatoires doivent être remplis' };
  }

  try {
    let qrToken = null;
    let qrImageUrl = null;

    // Si abonnement sélectionné et ce n'est pas une session => Génération QR code
    if (subscription_id && subscription_id !== 'session') {
      qrToken = nanoid();
      const qrDataUrl = await toDataURL(qrToken, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
      const uploadResult = await uploadQRCode(qrBuffer, qrToken) as { secure_url: string };
      qrImageUrl = uploadResult.secure_url;
    }

    // Insertion du membre
    const { data: member, error: insertError } = await (await supabase)
      .from('members')
      .insert({
        ...memberData,
        qr_code: qrToken,
        qr_image_url: qrImageUrl,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Gestion abonnement ou session
    if (subscription_id && subscription_id !== 'session') {
      // Abonnement normal
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 1); // Durée par défaut : 1 mois

      const { error: subError } = await (await supabase)
        .from('member_subscriptions')
        .insert({
          member_id: member.id,
          subscription_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          gym_id: memberData.gym_id
        });

      if (subError) throw subError;

      // Création d’un paiement pour l’abonnement (optionnel mais recommandé)
      const { data: subscriptionData } = await (await supabase)
        .from('subscriptions')
        .select('price')
        .eq('id', subscription_id)
        .single();

     const { error: paymentError } = await (await supabase)
  .from('payments')
  .insert({
    member_id: member.id,
    gym_id: memberData.gym_id, // Ajouté
    amount: subscriptionData?.price || 0,
    type: 'subscription',
    subscription_id,
    payment_method: 'cash' // Valeur par défaut
  });

      if (paymentError) throw paymentError;

    } else if (subscription_id === 'session') {
      // Session : création paiement unique
      if (!session_amount) {
        return { error: 'Veuillez saisir le montant de la session.' };
      }

     const { error: paymentError } = await (await supabase)
  .from('payments')
  .insert({
    member_id: member.id,
    gym_id: memberData.gym_id, // Ajouté
    amount: parseFloat(session_amount),
    type: 'session',
    payment_method: 'cash' // Valeur par défaut
  });
      if (paymentError) throw paymentError;
    }

    // Revalidation
    revalidatePath('/members');
    revalidatePath(`/gyms/${memberData.gym_id}/members`);

    return { 
      success: true, 
      member,
      redirectUrl: `/gyms/${member.gym_id}/members/${member.id}`
    };

  } catch (error) {
    console.error('Erreur création membre:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: memberData
    };
  }
}

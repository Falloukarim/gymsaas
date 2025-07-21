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
  const avatarFile = formData.get('avatar') as File | null;

  // Validation
  if (!memberData.gym_id || !memberData.full_name || !memberData.phone) {
    return { 
      error: 'Tous les champs obligatoires doivent être remplis',
      fieldErrors: {
        full_name: !memberData.full_name ? 'Nom requis' : undefined,
        phone: !memberData.phone ? 'Téléphone requis' : undefined
      }
    };
  }

  try {
    let qrToken = null;
    let qrImageUrl = null;
    let avatarUrl = null;

    // 1. Upload de l'avatar si fourni
    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `members/${memberData.gym_id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await (await supabase)
        .storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      avatarUrl = (await supabase)
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path).data.publicUrl;
    }

    // 2. Génération QR code si abonnement
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

    // 3. Insertion du membre
    const { data: member, error: insertError } = await (await supabase)
      .from('members')
      .insert({
        ...memberData,
        qr_code: qrToken,
        qr_image_url: qrImageUrl,
        avatar_url: avatarUrl,
        has_subscription: !!subscription_id && subscription_id !== 'session'
      })
      .select('*')
      .single();

    if (insertError) throw insertError;

    // 4. Gestion abonnement ou session
    if (subscription_id) {
      if (subscription_id !== 'session') {
        // Création abonnement
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1);

        const { data: subscriptionData } = await (await supabase)
          .from('subscriptions')
          .select('price, duration_days')
          .eq('id', subscription_id)
          .single();

        if (subscriptionData?.duration_days) {
          endDate.setDate(startDate.getDate() + subscriptionData.duration_days);
        }

        const { error: subError } = await (await supabase)
          .from('member_subscriptions')
          .insert({
            member_id: member.id,
            subscription_id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            gym_id: memberData.gym_id,
            status: 'active'
          });

        if (subError) throw subError;

        // Paiement pour l'abonnement
        await (await supabase)
          .from('payments')
          .insert({
            member_id: member.id,
            gym_id: memberData.gym_id,
            amount: subscriptionData?.price || 0,
            type: 'subscription',
            subscription_id,
            payment_method: 'cash',
            status: 'paid'
          });

      } else if (session_amount) {
        // Paiement pour session
        await (await supabase)
          .from('payments')
          .insert({
            member_id: member.id,
            gym_id: memberData.gym_id,
            amount: parseFloat(session_amount),
            type: 'session',
            payment_method: 'cash',
            status: 'paid'
          });
      }
    }

    // Revalidation
    revalidatePath(`/gyms/${memberData.gym_id}/members`);
    revalidatePath(`/gyms/${memberData.gym_id}/dashboard`);

    return { 
      success: true,
      message: `${memberData.full_name} a été ajouté avec succès`,
      memberId: member.id,
      redirectUrl: `/gyms/${member.gym_id}/members/${member.id}`
    };

  } catch (error) {
    console.error('Erreur création membre:', error);
    return { 
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
      details: String(error)
    };
  }
}
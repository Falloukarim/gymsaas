'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { toDataURL } from 'qrcode';
import { uploadQRCode } from '@/utils/cloudinary';

export async function createMember(formData: FormData) {
    const file = formData.get('avatar') as File | null;
  
  if (file && file.size > 10 * 1024 * 1024) { // 10MB max après compression
    throw new Error('Fichier trop volumineux après compression');
  }

  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) return { error: 'Authentification requise' };

  // 1. Extraction et validation des données
  const rawData = {
    gym_id: formData.get('gym_id') as string,
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string || null,
    phone: formData.get('phone') as string,
    subscription_id: formData.get('subscription_id') as string || null,
    avatar: formData.get('avatar') as File | null
  };

  // 2. Utilisation d'une transaction RPC pour atomicité
  try {
    // 2.1. Upload de l'avatar (si fourni)
    let avatar_url = null;
    if (rawData.avatar?.size > 0) {
      const fileExt = rawData.avatar.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `members/${rawData.gym_id}/${fileName}`;

      const { error: uploadError } = await (await supabase).storage
        .from('avatars')
        .upload(filePath, rawData.avatar);

      if (uploadError) throw uploadError;
      avatar_url = (await supabase).storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
    }

    // 2.2. Appel à une fonction stockée pour la création atomique
    const { data: member, error: rpcError } = await (await supabase).rpc(
      'handle_member_creation', 
      {
        p_gym_id: rawData.gym_id,
        p_full_name: rawData.full_name,
        p_phone: rawData.phone,
        p_email: rawData.email,
        p_avatar_url: avatar_url,
        p_subscription_id: rawData.subscription_id,
        p_created_by: user.id
      }
    ).select().single();

    if (rpcError) throw rpcError;

    // 2.3. Génération du QR code pour les abonnements
    if (rawData.subscription_id) {
      const { data: subscription } = await (await supabase)
        .from('subscriptions')
        .select('is_session')
        .eq('id', rawData.subscription_id)
        .single();

      if (!subscription?.is_session) {
        const qrToken = `GYM-${member.id}-${nanoid(8)}`;
        const qrDataUrl = await toDataURL(qrToken, { width: 300 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const uploadResult = await uploadQRCode(qrBuffer, qrToken);

        await (await supabase)
          .from('members')
          .update({
            qr_code: qrToken,
            qr_image_url: uploadResult.secure_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', member.id);
      }
    }

    // 3. Rafraîchissement et retour
    revalidatePath(`/gyms/${rawData.gym_id}/members`);
    revalidatePath(`/gyms/${rawData.gym_id}/dashboard`);

    return {
      success: true,
      memberId: member.id,
      redirectUrl: `/gyms/${rawData.gym_id}/members/${member.id}`
    };

  } catch (error) {
    console.error('Erreur création membre:', error);
    return {
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error instanceof Error ? error.stack : undefined
    };
  }
}
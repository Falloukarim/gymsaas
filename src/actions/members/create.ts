'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { toDataURL } from 'qrcode';
import { uploadQRCode } from '@/utils/cloudinary';

export async function createMember(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Authentication required' };

  const memberData = {
    gym_id: formData.get('gym_id')?.toString() || '',
    full_name: formData.get('full_name')?.toString() || '',
    email: formData.get('email')?.toString(),
    phone: formData.get('phone')?.toString() || '',
    role: 'member',
  };

  // Validation
  if (!memberData.gym_id || !memberData.full_name || !memberData.phone) {
    return { error: 'Tous les champs obligatoires doivent être remplis' };
  }

  try {
    const subscription_id = formData.get('subscription_id')?.toString();
    let qrToken = null;
    let qrImageUrl = null;

    // Génération du QR code UNIQUEMENT si abonnement
    if (subscription_id) {
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

    // Insertion du membre (sans has_subscription)
    const { data: member, error } = await supabase
      .from('members')
      .insert({
        ...memberData,
        qr_code: qrToken,
        qr_image_url: qrImageUrl,
        // Retirer has_subscription
      })
      .select()
      .single();

    if (error) throw error;

    // Création de l'abonnement SEULEMENT si sélectionné
    if (subscription_id) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(startDate.getMonth() + 1);

      const { error: subError } = await supabase
        .from('member_subscriptions')
        .insert({
          member_id: member.id,
          subscription_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          gym_id: memberData.gym_id
        });

      if (subError) throw subError;
    }

    revalidatePath('/members');
    revalidatePath(`/gyms/${memberData.gym_id}/members`);
    
    return { 
      success: true, 
      member,
      redirectUrl: `/members/${member.id}` 
    };
  } catch (error) {
    console.error('Erreur création membre:', error);
    return { 
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: memberData
    };
  }
}
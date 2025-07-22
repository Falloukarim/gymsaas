'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { nanoid } from 'nanoid';
import { toDataURL } from 'qrcode';
import { uploadQRCode } from '@/utils/cloudinary';

export async function createMember(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();
  if (!user) return { error: 'Authentication required' };

  const memberData = {
    gym_id: formData.get('gym_id') as string,
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
  };

  const subscription_id = formData.get('subscription_id') as string;
  const avatarFile = formData.get('avatar') as File | null;

  try {
    // 1. Upload avatar
    let avatarUrl = null;
    if (avatarFile?.size > 0) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `members/${memberData.gym_id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await (await supabase)
        .storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;
      avatarUrl = (await supabase).storage.from('avatars').getPublicUrl(uploadData.path).data.publicUrl;
    }

    // 2. Create member
    const { data: member, error: insertError } = await (await supabase)
      .from('members')
      .insert({
        ...memberData,
        avatar_url: avatarUrl,
        has_subscription: !!subscription_id
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 3. Handle subscription/session
    
    if (subscription_id) {
      const { data: subscription } = await (await supabase)
        .from('subscriptions')
        .select('*')
        .eq('id', subscription_id)
        .single();

      if (!subscription) throw new Error('Subscription not found');

      if (subscription.is_session) {
        // Session payment
        await (await supabase)
          .from('payments')
          .insert({
            member_id: member.id,
            gym_id: memberData.gym_id,
            amount: subscription.price,
            type: 'session',
            subscription_id: subscription.id,
            status: 'paid'
          });
      } else {
        // Regular subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + subscription.duration_days);

        await (await supabase)
          .from('member_subscriptions')
          .insert({
            member_id: member.id,
            subscription_id: subscription.id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            gym_id: memberData.gym_id,
            status: 'active'
          });

        await (await supabase)
          .from('payments')
          .insert({
            member_id: member.id,
            gym_id: memberData.gym_id,
            amount: subscription.price,
            type: 'subscription',
            subscription_id: subscription.id,
            status: 'paid'
          });

        // Generate QR code for subscriptions only
        const qrToken = nanoid();
        const qrDataUrl = await toDataURL(qrToken, { width: 300 });
        const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
        const uploadResult = await uploadQRCode(qrBuffer, qrToken) as { secure_url: string };

        await (await supabase)
          .from('members')
          .update({
            qr_code: qrToken,
            qr_image_url: uploadResult.secure_url
          })
          .eq('id', member.id);
      }
    }

    revalidatePath(`/gyms/${memberData.gym_id}/members`);
    return { 
      success: true,
      memberId: member.id,
      redirectUrl: `/gyms/${member.gym_id}/members/${member.id}`
    };

  } catch (error) {
    console.error('Error creating member:', error);
    return { 
      error: error instanceof Error ? error.message : 'Creation failed'
    };
  }
}
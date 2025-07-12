import { createClient } from '@/utils/supabase/server';

export async function generateQRCodeForMember(memberId: string): Promise<string> {
  const supabase = createClient();
  const token = crypto.randomUUID();

  const { error } = await supabase
    .from('members')
    .update({ qr_code: token })
    .eq('id', memberId);

  if (error) {
    throw new Error('Failed to generate QR code');
  }

  return token;
}

export async function validateQRCode(token: string) {
  const supabase = createClient();

  const { data: member, error } = await supabase
    .from('members')
    .select('*, subscriptions(*)')
    .eq('qr_code', token)
    .single();

  if (error || !member) {
    return { valid: false, error: 'Invalid QR code' };
  }

  return { 
    valid: true, 
    member,
    accessType: member.subscription_id ? 'subscription' : 'session' 
  };
}
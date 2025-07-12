import { createClient } from '@/utils/supabase/server';
import { Payment, PaymentWithMember } from '@/utils/types/supabase';

export async function processPayment(
  paymentData: Omit<Payment, 'id' | 'created_at'>
): Promise<{ data?: PaymentWithMember; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select('*, member:members(full_name, phone)')
    .single();

  if (error) return { error: error.message };

  return { data };
}

export async function generatePaymentReceipt(paymentId: string): Promise<string> {
  const supabase = createClient();

  const { data } = await supabase
    .from('payments')
    .select('*, member:members(full_name)')
    .eq('id', paymentId)
    .single();

  return `
    Receipt #${paymentId}
    Member: ${data?.member?.full_name || 'N/A'}
    Amount: €${data?.amount.toFixed(2)}
    Date: ${new Date(data?.created_at || '').toLocaleDateString()}
  `;
}

export async function validatePaymentMethod(method: string): Promise<boolean> {
  const validMethods = ['cash', 'card', 'mobile_money'];
  return validMethods.includes(method);
}
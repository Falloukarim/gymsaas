import { verifyPayment } from '@/lib/paydunya';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function PaymentConfirmation({
  searchParams,
}: {
  searchParams: { token: string };
}) {
  const supabase = createClient();
  const payment = await verifyPayment(searchParams.token);

  // Récupérer l'ID du gym de l'utilisateur
  const { data: { user } } = await (await supabase).auth.getUser();
  const { data: gymUser } = await (await supabase)
    .from('gbus')
    .select('gym_id')
    .eq('user_id', user?.id)
    .single();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {payment.success ? (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Paiement Réussi!
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Votre abonnement a été activé avec succès.
            </p>
            {payment.data?.invoice && (
              <div className="bg-gray-100 p-4 rounded mb-6">
                <p className="font-semibold">Référence: {payment.data.invoice.receipt_number || 'N/A'}</p>
                <p>Montant: {payment.data.invoice.total_amount || '0'} FCFA</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Paiement Échoué
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Une erreur est survenue lors du traitement de votre paiement.
            </p>
          </>
        )}

        {gymUser?.gym_id ? (
          <Link href={`/gyms/${gymUser.gym_id}/dashboard`} passHref>
            <Button className="w-full">
              Retour au tableau de bord
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard" passHref>
            <Button className="w-full">
              Retour à l'accueil
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
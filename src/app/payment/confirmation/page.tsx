import { verifyPayment } from '@/lib/paydunya';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md">
        {/* Header avec dégradé */}
        <div className={`bg-gradient-to-r ${payment.success ? 'from-green-400 to-emerald-600' : 'from-red-400 to-rose-600'} p-6 text-center`}>
          {payment.success ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Paiement Réussi!</h1>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Paiement Échoué</h1>
            </div>
          )}
        </div>

        {/* Corps de la carte */}
        <div className="p-8">
          {payment.success ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                Votre abonnement a été activé avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.
              </p>
              {payment.data?.invoice && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Référence:</span>
                    <span className="font-medium">{payment.data.invoice.receipt_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Montant:</span>
                    <span className="font-bold text-green-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XOF',
                        minimumFractionDigits: 0
                      }).format(payment.data.invoice.total_amount || 0)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-center mb-6">
              Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer ou contacter le support.
            </p>
          )}

          {/* Bouton avec animation */}
          {gymUser?.gym_id ? (
            <Link href={`/gyms/${gymUser.gym_id}/dashboard`} passHref>
              <Button 
                className={`w-full py-3 mt-4 ${payment.success ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'} text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-md`}
              >
                {payment.success ? 'Accéder au tableau de bord' : 'Retour à la page de paiement'}
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard" passHref>
              <Button className="w-full py-3 mt-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-all duration-300">
                Retour à l'accueil
              </Button>
            </Link>
          )}

          {/* Message supplémentaire */}
          {payment.success && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Un email de confirmation vous a été envoyé.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
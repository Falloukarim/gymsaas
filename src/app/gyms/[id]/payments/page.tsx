import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

export default async function PaymentsPage({
  searchParams,
  params
}: {
  searchParams: Promise<{ q?: string }>
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const gymId = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.q;

  const supabase = createClient();

  let query = (await supabase)
    .from('payments')
    .select(`
      id,
      amount,
      payment_method,
      status,
      created_at,
      members!inner(
        full_name
      ),
      subscriptions:subscription_id(
        type  
      )
    `)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    query = query.ilike('members.full_name', `%${searchQuery}%`);
  }

  const { data: payments, error } = await query;

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      code: error.code,
      details: error.details
    });
    return (
      <div className="p-4 sm:p-6 text-red-500">
        Erreur technique: {error.message}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <Link
          href={`/gyms/${gymId}/dashboard`}
          className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="whitespace-nowrap">Retour au dashboard</span>
        </Link>
        
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-xl sm:text-2xl font-bold">Gestion des Paiements</CardTitle>
            <Button asChild className="bg-[#00c9a7] hover:bg-[#00a58e] text-white w-full sm:w-auto">
              <Link href={`/gyms/${gymId}/payments/new`} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Nouveau paiement</span>
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <SearchBar 
              placeholder="Rechercher un paiement..." 
              defaultValue={searchQuery}
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1e3a4b]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Membre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                {payments?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#1a2e3a] transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-white font-medium text-sm">
                      {payment.members?.full_name || 'Membre inconnu'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-white text-sm">
                      {payment.subscriptions?.type || payment.type || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-white text-sm">
                      {payment.amount} fcfa
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-white/10 border-gray-600 text-xs">
                        {payment.payment_method}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          payment.status === 'paid'
                            ? 'default'
                            : payment.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-xs"
                      >
                        {payment.status === 'paid'
                          ? 'Payé'
                          : payment.status === 'pending'
                          ? 'En attente'
                          : 'Échoué'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-white text-sm">
                      {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {payments?.map((payment) => (
              <div key={payment.id} className="bg-[#0d1a23] rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-white text-sm">
                    {payment.members?.full_name || 'Membre inconnu'}
                  </div>
                  <Badge
                    variant={
                      payment.status === 'paid'
                        ? 'default'
                        : payment.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="text-xs"
                  >
                    {payment.status === 'paid'
                      ? 'Payé'
                      : payment.status === 'pending'
                      ? 'En attente'
                      : 'Échoué'}
                  </Badge>
                </div>
                
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white">
                  <div>
                    <span className="text-gray-400">Type: </span>
                    {payment.subscriptions?.type || payment.type || '-'}
                  </div>
                  <div>
                    <span className="text-gray-400">Montant: </span>
                    {payment.amount} fcfa
                  </div>
                  <div>
                    <span className="text-gray-400">Méthode: </span>
                    <Badge variant="outline" className="bg-white/10 border-gray-600 text-xs inline-block">
                      {payment.payment_method}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Date: </span>
                    {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
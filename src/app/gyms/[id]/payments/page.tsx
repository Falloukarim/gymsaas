import { createClient } from '@/utils/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SearchBar } from '@/components/search-bar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = createClient();
  
  let query = (await supabase)
    .from('payments')
    .select(`
      id, 
      amount, 
      payment_method, 
      status, 
      payment_date, 
      members(full_name),
      member_subscriptions(
        subscriptions(name)
      )
    `)
    .order('payment_date', { ascending: false });

  if (searchParams.q) {
    query = query.ilike('members.full_name', `%${searchParams.q}%`);
  }

  const { data: payments } = await query;

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Gestion des Paiements</CardTitle>
            <Button asChild className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
              <Link href="/payments/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau paiement
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <SearchBar placeholder="Rechercher un paiement..." />
          </div>
          
          <div className="rounded-lg overflow-hidden border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#1e3a4b]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Membre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Abonnement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Méthode
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                {payments?.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#1a2e3a] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      {payment.members?.full_name || 'Membre inconnu'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {payment.member_subscriptions?.[0]?.subscriptions?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {payment.amount} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-white/10 border-gray-600">
                        {payment.payment_method}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={payment.status === "paid" ? "default" : payment.status === "pending" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {payment.status === "paid" ? "Payé" : payment.status === "pending" ? "En attente" : "Échoué"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="link" 
                        className="text-[#00c9a7] hover:text-[#00a58e] p-0 h-auto"
                        asChild
                      >
                        <Link href={`/payments/${payment.id}`}>
                          Détails
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
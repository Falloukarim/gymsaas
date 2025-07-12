import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, QrCode } from 'lucide-react';
import { SubscriptionStatusBadge } from '@/components/subscription-status-badge';
import { QRCodeGenerator } from '@/components/members/QRCodeGenerator';
import { DownloadMemberBadgeButton } from '@/components/members/DownloadMemberBadgeButton';

export default async function MemberDetailPage({ params: resolvedParams }: { params: Promise<{ id: string }> }) {
  const params = await resolvedParams;
  const { id } = params;

  const supabase = createClient();

  // 🔹 Fetch member + subscriptions
  const { data: member, error } = await supabase
    .from('members')
    .select(`
      *,
      gyms(name),
      member_subscriptions(
        *,
        subscriptions(name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !member) {
    return notFound();
  }

  // 🔹 Fetch payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', id)
    .order('created_at', { ascending: false });

  // 🔹 Fetch access logs
  const { data: accessLogs } = await supabase
    .from('access_logs')
    .select('*')
    .eq('member_id', id)
    .order('timestamp', { ascending: false });

  const activeSubscription = member.member_subscriptions?.find(
    (sub: { end_date: string | number | Date }) => new Date(sub.end_date) > new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/members" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Retour aux membres</span>
        </Link>
        <Button asChild>
          <Link href={`/members/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{member.full_name}</h3>
                <p className="text-sm text-muted-foreground">{member.gyms?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{member.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Téléphone</p>
                <p className="text-sm text-muted-foreground">{member.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{activeSubscription.subscriptions?.name}</span>
                  <SubscriptionStatusBadge status="active" />
                </div>
                <div className="text-sm">
                  <p>Début: {new Date(activeSubscription.start_date).toLocaleDateString()}</p>
                  <p>Fin: {new Date(activeSubscription.end_date).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Aucun abonnement actif</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Ajouter un abonnement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Afficher la carte du badge uniquement si abonnement actif */}
        {activeSubscription && (
          <Card>
            <CardHeader>
              <CardTitle>Badge Membre</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="border p-4 rounded-lg mb-4 bg-white w-full max-w-xs">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center mb-4">
                  <h3 className="font-bold text-lg">{member.full_name}</h3>
                  <p className="text-sm">{member.gyms?.name}</p>
                  <Badge className="mt-2 bg-white text-blue-600">
                    {activeSubscription.subscriptions?.name}
                  </Badge>
                </div>
                
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    value={member.qr_code} 
                    size={160}
                    className="p-2"
                  />
                </div>
                <p className="text-center text-xs mt-4 text-gray-500">
                  ID: {member.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <DownloadMemberBadgeButton member={member} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Historique des abonnements</CardTitle>
          </CardHeader>
          <CardContent>
            {member.member_subscriptions?.length ? (
              <ul className="space-y-2">
                {member.member_subscriptions.map((sub: any) => (
                  <li key={sub.id} className="flex justify-between">
                    <span>{sub.subscriptions?.name}</span>
                    <span>
                      {new Date(sub.start_date).toLocaleDateString()} -{' '}
                      {new Date(sub.end_date).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucun abonnement</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {payments?.length ? (
              <ul className="space-y-2">
                {payments.map((payment: any) => (
                  <li key={payment.id} className="flex justify-between">
                    <span>{payment.type}</span>
                    <span>{payment.amount} F CFA</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucun paiement enregistré</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Historique des accès</CardTitle>
          </CardHeader>
          <CardContent>
            {accessLogs?.length ? (
              <ul className="space-y-2">
                {accessLogs.map((log: any) => (
                  <li key={log.id} className="flex justify-between">
                    <span>{log.type}</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aucun accès enregistré</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

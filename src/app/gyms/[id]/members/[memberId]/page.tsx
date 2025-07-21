import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, CreditCard, User, Activity } from 'lucide-react';
import { SubscriptionStatusBadge } from '@/components/subscription-status-badge';
import { QRCodeGenerator } from '@/components/members/QRCodeGenerator';
import { DownloadMemberBadgeButton } from '@/components/members/DownloadMemberBadgeButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';


export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const resolvedParams = await params;
  const gymId = resolvedParams.id;
  const memberId = resolvedParams.memberId;

  const supabase = createClient();

  // Fetch member + subscriptions
  const { data: member, error } = await (await supabase)
    .from('members')
    .select(`
      *,
      gyms(name),
      member_subscriptions (
        *,
        subscriptions (type, description)
      )
    `)
    .eq('id', memberId)
    .single();

  if (error || !member) {
    return notFound();
  }

  // Fetch payments
  const { data: payments } = await (await supabase)
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  // Fetch access logs
  const { data: accessLogs } = await (await supabase)
    .from('access_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('timestamp', { ascending: false });

  const activeSubscription = member.member_subscriptions?.find(
    (sub: { end_date: string | number | Date }) => new Date(sub.end_date) > new Date()
  );

  // Get initials for avatar
  const initials = member.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  return (
       <div className="bg-gray-800 text-white">
      {/* Header with back button and actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/gyms/${gymId}/members`} className="flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux membres</span>
          </Link>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/gyms/${gymId}/members/${memberId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
          </Button>
        </div>
      </div>

      {/* Member profile header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={member.avatar_url || undefined} />
          <AvatarFallback className="bg-gradient-to-r from-black-500 to-blue-700 text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{member.full_name}</h1>
          <p className="text-muted-foreground">{member.gyms?.name}</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Member information card */}
       <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Informations du membre</CardTitle>
            <CardDescription>Détails personnels et coordonnées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nom complet</span>
                </div>
                <p>{member.full_name}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date d'inscription</span>
                </div>
                <p>{new Date(member.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span>Email</span>
                </div>
                <p>{member.email || '-'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>Téléphone</span>
                </div>
                <p>{member.phone || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription status card */}
       <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Abonnement</CardTitle>
            <CardDescription>Statut et détails de l'abonnement</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activeSubscription.subscriptions?.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {activeSubscription.subscriptions?.description}
                    </p>
                  </div>
                  <SubscriptionStatusBadge status="active" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Début</span>
                    <span>{new Date(activeSubscription.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fin</span>
                    <span>{new Date(activeSubscription.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  Gérer l'abonnement
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 text-center py-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun abonnement actif</p>
                <Button size="sm" className="mt-2">
                  Ajouter un abonnement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member badge card (if active subscription) */}
      {activeSubscription && (
       <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Badge Membre</CardTitle>
            <CardDescription>Badge d'accès et QR Code</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between gap-8">
              <div className="border p-4 rounded-lg bg-white shadow-sm w-full max-w-xs dark:bg-gray-700">
                <div className="flex justify-center">
                  <QRCodeGenerator 
                    value={member.qr_code} 
                    size={160} 
                    className="p-2 border rounded bg-white dark:bg-gray-800" 
                  />
                </div>
                <p className="text-center text-xs mt-4 text-muted-foreground">
                  ID: {member.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-black-500 to-blue-400 text-white">
<DownloadMemberBadgeButton 
  member={{
    id: member.id,
    full_name: member.full_name,
    avatar_url: member.avatar_url,
    qr_code: member.qr_code,
    gyms: member.gyms,
    member_subscriptions: member.member_subscriptions
  }}
/>              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription history */}
       <Card className="bg-gray-800 text-white">
  <CardHeader>
    <CardTitle>Historique des abonnements</CardTitle>
    <CardDescription className="text-gray-400">
      Tous les abonnements passés et actuels
    </CardDescription>
  </CardHeader>
  <CardContent>
    {member.member_subscriptions?.length ? (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-900 text-white">Type</TableHead>
            <TableHead className="bg-gray-900 text-white">Période</TableHead>
            <TableHead className="bg-gray-900 text-white text-right">Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {member.member_subscriptions.map((sub: any) => (
            <TableRow key={sub.id} className="border-gray-700">
              <TableCell>{sub.subscriptions?.type}</TableCell>
              <TableCell>
                {new Date(sub.start_date).toLocaleDateString()} -{' '}
                {new Date(sub.end_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <SubscriptionStatusBadge 
                  status={new Date(sub.end_date) > new Date() ? 'active' : 'expired'} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    ) : (
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
        <Calendar className="h-8 w-8 mb-2" />
        <p>Aucun abonnement enregistré</p>
      </div>
    )}
  </CardContent>
</Card>


        {/* Payment history */}
       <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>Toutes les transactions financières</CardDescription>
          </CardHeader>
          <CardContent>
            {payments?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-gray-100 dark:bg-gray-700">Type</TableHead>
                    <TableHead className="bg-gray-100 dark:bg-gray-700">Date</TableHead>
                    <TableHead className="bg-gray-100 dark:bg-gray-700 text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {payment.amount} F CFA
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucun paiement enregistré</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Access logs */}
       <Card className="bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Historique des accès</CardTitle>
          <CardDescription>Dernières entrées et sorties</CardDescription>
        </CardHeader>
        <CardContent>
          {accessLogs?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead className="bg-gray-100 dark:bg-gray-700">Type</TableHead>
                      <TableHead className="bg-gray-100 dark:bg-gray-700">Date et heure</TableHead>
                      <TableHead className="bg-gray-100 dark:bg-gray-700 text-right">Méthode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessLogs.map((log: any) => (
                    <TableRow key={log.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell>
                        <Badge variant={log.type === 'entry' ? 'default' : 'secondary'}>
                          {log.type === 'entry' ? 'Entrée' : 'Sortie'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.method === 'qr' ? 'QR Code' : 'Manuel'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aucun accès enregistré</p>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Payment {
  id: string;
  type: string;
  created_at: string;
  amount: number;
}

interface AccessLog {
  id: string;
  type: 'entry' | 'exit';
  timestamp: string;
  method: 'qr' | 'manual';
}

interface MemberSubscription {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  is_session?: boolean;
  subscriptions?: {
    type: string;
    description?: string;
    price?: number;
    is_session?: boolean;
  };
}

interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  created_at: string;
  qr_code?: string;
  avatar_url?: string;
  gyms?: {
    name: string;
  };
  member_subscriptions?: MemberSubscription[];
}

function PaymentRow({ payment }: { payment: Payment }) {
  return (
    <>
      <div className="lg:hidden border-b border-gray-700 py-3">
        <div className="flex justify-between">
          <span className="font-medium">Type:</span>
          <span>{payment.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Montant:</span>
          <span>{payment.amount} F CFA</span>
        </div>
      </div>

      <TableRow className="hidden lg:table-row border-gray-700 hover:bg-gray-700">
        <TableCell>{payment.type}</TableCell>
        <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
        <TableCell className="text-right">{payment.amount} F CFA</TableCell>
      </TableRow>
    </>
  );
}

function SubscriptionRow({ sub }: { sub: MemberSubscription }) {
  return (
    <>
      <div className="lg:hidden border-b border-gray-700 py-3">
        <div className="flex justify-between">
          <span className="font-medium">Type:</span>
          <span className="truncate">{sub.subscriptions?.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Période:</span>
          <span className="text-right">
            {new Date(sub.start_date).toLocaleDateString()} -{' '}
            {new Date(sub.end_date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Statut:</span>
          <SubscriptionStatusBadge 
            status={
              sub.status === 'active' && new Date(sub.end_date) > new Date() 
                ? 'active' 
                : 'expired'
            } 
          />
        </div>
      </div>

      <TableRow className="hidden lg:table-row border-gray-700 hover:bg-gray-700">
        <TableCell className="truncate max-w-[100px]">{sub.subscriptions?.type}</TableCell>
        <TableCell>
          {new Date(sub.start_date).toLocaleDateString()} -{' '}
          {new Date(sub.end_date).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">
          <SubscriptionStatusBadge 
            status={
              sub.status === 'active' && new Date(sub.end_date) > new Date() 
                ? 'active' 
                : 'expired'
            } 
          />
        </TableCell>
      </TableRow>
    </>
  );
}

function AccessLogRow({ log }: { log: AccessLog }) {
  return (
    <>
      <div className="lg:hidden border-b border-gray-700 py-3">
        <div className="flex justify-between">
          <span className="font-medium">Type:</span>
          <Badge variant={log.type === 'entry' ? 'default' : 'secondary'}>
            {log.type === 'entry' ? 'Entrée' : 'Sortie'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Date:</span>
          <span>{new Date(log.timestamp).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Méthode:</span>
          <span>{log.method === 'qr' ? 'QR Code' : 'Manuel'}</span>
        </div>
      </div>

      <TableRow className="hidden lg:table-row border-gray-700 hover:bg-gray-700">
        <TableCell>
          <Badge variant={log.type === 'entry' ? 'default' : 'secondary'}>
            {log.type === 'entry' ? 'Entrée' : 'Sortie'}
          </Badge>
        </TableCell>
        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
        <TableCell className="text-right">{log.method === 'qr' ? 'QR Code' : 'Manuel'}</TableCell>
      </TableRow>
    </>
  );
}

function isSubscription(sub: MemberSubscription): boolean {
  const start = new Date(sub.start_date);
  const end = new Date(sub.end_date);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 1;
}

export default async function MemberDetailPage({
  params: resolvedParams,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const { id: gymId, memberId } = await resolvedParams;
  const supabase = createClient();

  const { data: member, error } = await (await supabase)
    .from('members')
    .select(`
      *,
      gyms(name),
      member_subscriptions (
        *,
        subscriptions (type, description, price, is_session)
      )
    `)
    .eq('id', memberId)
    .single();

  if (error || !member) {
    return notFound();
  }

  const { data: payments } = await (await supabase)
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  const { data: accessLogs } = await (await supabase)
    .from('access_logs')
    .select('*')
    .eq('member_id', memberId)
    .order('timestamp', { ascending: false });

  const subscriptions = member.member_subscriptions || [];

  const activeSubscription = subscriptions.find(
    sub =>
      sub.status === 'active' &&
      new Date(sub.end_date) > new Date() &&
      isSubscription(sub)
  );
  const hasActiveSubscription = !!activeSubscription;

  const lastSubscription = subscriptions
    .filter(isSubscription)
    .sort((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];

  const sessions = subscriptions.filter(sub => !isSubscription(sub));

  const initials = member.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 overflow-hidden">
      <Card className="bg-gray-800 text-white border-gray-700 w-full">
        <CardHeader className="border-b border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <Link
                href={`/gyms/${gymId}/members`}
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors mb-4 sm:mb-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="whitespace-nowrap">Retour aux membres</span>
              </Link>

              <div className="flex items-center gap-4 w-full">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                  <AvatarImage src={member.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{member.full_name}</h1>
                  <p className="text-sm text-gray-400 truncate">{member.gyms?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Member Information */}
            <div className="space-y-4 sm:space-y-6 md:col-span-1">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Informations du membre</CardTitle>
                  <CardDescription className="text-gray-400">
                    Détails personnels et coordonnées
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-400">Nom complet</p>
                        <p className="truncate">{member.full_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400">Date d'inscription</p>
                        <p>{new Date(member.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="truncate">{member.email || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <div>
                        <p className="text-sm text-gray-400">Téléphone</p>
                        <p>{member.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Status */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Abonnement</CardTitle>
                  <CardDescription className="text-gray-400">
                    Statut et détails de l'abonnement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {hasActiveSubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{activeSubscription.subscriptions?.type}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {activeSubscription.subscriptions?.description}
                          </p>
                        </div>
                        <SubscriptionStatusBadge status="active" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Début</span>
                          <span>{new Date(activeSubscription.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Fin</span>
                          <span>{new Date(activeSubscription.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="bg-green-500 hover:bg-gray-100 border-gray-600"
                          asChild
                        >
                          <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                            Renouveler
                          </Link>
                        </Button>
                        <Button 
                          variant="secondary"
                          asChild
                        >
                          <Link href={`/gyms/${gymId}/members/${memberId}/new-session`}>
                            Ajouter une session
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : lastSubscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{lastSubscription.subscriptions?.type}</p>
                          <p className="text-sm text-gray-400 truncate">
                            {lastSubscription.subscriptions?.description}
                          </p>
                        </div>
                        <SubscriptionStatusBadge status="expired" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Dernier abonnement</span>
                          <span>{new Date(lastSubscription.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button 
                          variant="outline" 
                          className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600"
                          asChild
                        >
                          <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                            Renouveler l'abonnement
                          </Link>
                        </Button>
                        <Button 
                          variant="secondary"
                          className="w-full"
                          asChild
                        >
                          <Link href={`/gyms/${gymId}/members/${memberId}/new-session`}>
                            Nouvelle session
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 text-center py-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-400">Aucun abonnement actif</p>
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button size="sm" asChild className="w-full">
                          <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                            Ajouter un abonnement
                          </Link>
                        </Button>
                        <Button size="sm" variant="secondary" asChild className="w-full">
                          <Link href={`/gyms/${gymId}/members/${memberId}/new-session`}>
                            Nouvelle session
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Middle Column - Badge and QR Code */}
            <div className="space-y-4 sm:space-y-6 md:col-span-1">
              {hasActiveSubscription && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg">Badge Membre</CardTitle>
                    <CardDescription className="text-gray-400">
                      Badge d'accès et QR Code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                      <div className="border border-gray-600 p-4 rounded-lg bg-gray-700 w-full max-w-xs">
                        <div className="flex justify-center">
                          <QRCodeGenerator 
                            value={member.qr_code || ''} 
                            size={160}
                            className="p-2 border border-gray-600 rounded bg-white" 
                          />
                        </div>
                        <p className="text-center text-xs mt-3 sm:mt-4 text-gray-400">
                          ID: {member.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      
                      <DownloadMemberBadgeButton 
                        member={{
                          id: member.id,
                          full_name: member.full_name,
                          avatar_url: member.avatar_url,
                          qr_code: member.qr_code,
                          gyms: member.gyms,
                          member_subscriptions: member.member_subscriptions
                        }}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment History */}
              <Card className="bg-gray-800 border-gray-700 h-full">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Historique des paiements</CardTitle>
                  <CardDescription className="text-gray-400">
                    Toutes les transactions financières
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {payments?.length ? (
                    <ScrollArea className="h-64">
                      <Table className="hidden lg:table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-gray-300 bg-gray-900">Type</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900">Date</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900 text-right">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment: any) => (
                            <PaymentRow key={payment.id} payment={payment} />
                          ))}
                        </TableBody>
                      </Table>

                      <div className="lg:hidden space-y-2">
                        {payments.map((payment: any) => (
                          <PaymentRow key={payment.id} payment={payment} />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400">Aucun paiement enregistré</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - History Sections */}
            <div className="space-y-4 sm:space-y-6 md:col-span-2 lg:col-span-1">
              {/* Subscription History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Historique des abonnements</CardTitle>
                  <CardDescription className="text-gray-400">
                    Tous les abonnements passés et actuels
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {subscriptions.filter(isSubscription).length ? (
                    <ScrollArea className="h-64">
                      <Table className="hidden lg:table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-gray-300 bg-gray-900">Type</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900">Période</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900 text-right">Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.filter(isSubscription).map((sub: any) => (
                            <SubscriptionRow key={sub.id} sub={sub} />
                          ))}
                        </TableBody>
                      </Table>

                      <div className="lg:hidden space-y-2">
                        {subscriptions.filter(isSubscription).map((sub: any) => (
                          <SubscriptionRow key={sub.id} sub={sub} />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400">Aucun abonnement enregistré</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session History */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Historique des sessions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sessions ponctuelles utilisées
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {sessions.length ? (
                    <ScrollArea className="h-64">
                      <Table className="hidden lg:table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-gray-300 bg-gray-900">Date</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900">Type</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900 text-right">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sessions.map((session: any) => (
                            <TableRow key={session.id} className="border-gray-700 hover:bg-gray-700">
                              <TableCell>
                                {new Date(session.start_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {session.subscriptions?.description || 'Session ponctuelle'}
                              </TableCell>
                              <TableCell className="text-right">
                                {session.subscriptions?.price} F CFA
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="lg:hidden space-y-2">
                        {sessions.map((session: any) => (
                          <div key={session.id} className="border-b border-gray-700 py-3">
                            <div className="flex justify-between">
                              <span className="font-medium">Date:</span>
                              <span>{new Date(session.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Type:</span>
                              <span>{session.subscriptions?.description || 'Session'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Montant:</span>
                              <span>{session.subscriptions?.price} F CFA</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400">Aucune session enregistrée</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Access Logs */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg">Historique des accès</CardTitle>
                  <CardDescription className="text-gray-400">
                    Dernières entrées et sorties
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {accessLogs?.length ? (
                    <ScrollArea className="h-64">
                      <Table className="hidden lg:table">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="text-gray-300 bg-gray-900">Type</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900">Date et heure</TableHead>
                            <TableHead className="text-gray-300 bg-gray-900 text-right">Méthode</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accessLogs.map((log: any) => (
                            <AccessLogRow key={log.id} log={log} />
                          ))}
                        </TableBody>
                      </Table>

                      <div className="lg:hidden space-y-2">
                        {accessLogs.map((log: any) => (
                          <AccessLogRow key={log.id} log={log} />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Activity className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-400">Aucun accès enregistré</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
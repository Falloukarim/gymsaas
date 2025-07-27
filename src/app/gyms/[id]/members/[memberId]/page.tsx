import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, CreditCard, User, Activity } from 'lucide-react';
import { SubscriptionStatusBadge } from '@/components/subscription-status-badge';
import { QRCodeGenerator } from '@/components/members/QRCodeGenerator';
import { DownloadMemberBadgeButton } from '@/components/members/DownloadMemberBadgeButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    (    sub: MemberSubscription) => sub.status === 'active' && new Date(sub.end_date) > new Date() && isSubscription(sub)
  );
  const hasActiveSubscription = !!activeSubscription;
  const lastSubscription = subscriptions
    .filter(isSubscription)
    .sort((a: { end_date: string | number | Date; }, b: { end_date: string | number | Date; }) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())[0];
  const sessions = subscriptions.filter((sub: MemberSubscription) => !isSubscription(sub));

  const initials = member.full_name
    .split(' ')
    .map((n: any[]) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 overflow-hidden">
      <div className="bg-gray-800 text-white border border-gray-700 rounded-lg w-full">
        {/* Header Section */}
        <div className="border-b border-gray-700 p-4 sm:p-6">
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
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Member Information Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Informations du membre</h2>
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Nom complet</p>
                  <p>{member.full_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Date d'inscription</p>
                  <p>{new Date(member.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p>{member.email || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p>{member.phone || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Abonnement</h2>
            <div className="bg-gray-700 rounded-lg p-4 space-y-4">
              {hasActiveSubscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{activeSubscription.subscriptions?.type}</p>
                      <p className="text-sm text-gray-400">
                        {activeSubscription.subscriptions?.description}
                      </p>
                    </div>
                    <SubscriptionStatusBadge status="active" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Début</span>
                      <span>{new Date(activeSubscription.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fin</span>
                      <span>{new Date(activeSubscription.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
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
                </>
              ) : lastSubscription ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lastSubscription.subscriptions?.type}</p>
                      <p className="text-sm text-gray-400">
                        {lastSubscription.subscriptions?.description}
                      </p>
                    </div>
                    <SubscriptionStatusBadge status="expired" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Dernier abonnement</span>
                    <span>{new Date(lastSubscription.end_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600"
                      asChild
                    >
                      <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
                        Renouveler l'abonnement
                      </Link>
                    </Button>
                    <Button 
                      variant="secondary"
                      asChild
                    >
                      <Link href={`/gyms/${gymId}/members/${memberId}/new-session`}>
                        Nouvelle session
                      </Link>
                    </Button>
                  </div>
                </>
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
            </div>
          </div>

          {/* QR Code Section */}
          {hasActiveSubscription && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Badge Membre</h2>
              <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center space-y-4">
                <div className="border border-gray-600 p-4 rounded-lg bg-gray-800 w-full max-w-xs">
                  <div className="flex justify-center">
                    <QRCodeGenerator 
                      value={member.qr_code || ''} 
                      size={160}
                      className="p-2 border border-gray-600 rounded bg-white" 
                    />
                  </div>
                  <p className="text-center text-xs mt-3 text-gray-400">
                    ID: {member.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
<DownloadMemberBadgeButton 
  member={{
    id: member.id,
    full_name: member.full_name,
    phone: member.phone, // Added required field
    created_at: member.created_at, // Added required field
    has_subscription: !!activeSubscription, // Added required field
    avatar_url: member.avatar_url,
    qr_code: member.qr_code,
    gyms: member.gyms ? {
      id: gymId,
      name: member.gyms.name,
      logo_url: member.gyms.logo_url
    } : undefined,
    member_subscriptions: member.member_subscriptions
  }}
  className="w-full max-w-xs"
/>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historique des paiements</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {payments?.length ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {payments.map((payment: any) => (
                      <div key={payment.id} className="border-b border-gray-600 pb-3 last:border-0">
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
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-400">Aucun paiement enregistré</p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historique des abonnements</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {subscriptions.filter(isSubscription).length ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {subscriptions.filter(isSubscription).map((sub: any) => (
                      <div key={sub.id} className="border-b border-gray-600 pb-3 last:border-0">
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
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-400">Aucun abonnement enregistré</p>
                </div>
              )}
            </div>
          </div>

          {/* Session History */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historique des sessions</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {sessions.length ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="border-b border-gray-600 pb-3 last:border-0">
                        <div className="flex justify-between">
                          <span className="font-medium">Date:</span>
                          <span>{new Date(session.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Type:</span>
                          <span>{session.subscriptions?.description || 'Session ponctuelle'}</span>
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
            </div>
          </div>

          {/* Access Logs */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Historique des accès</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              {accessLogs?.length ? (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {accessLogs.map((log: any) => (
                      <div key={log.id} className="border-b border-gray-600 pb-3 last:border-0">
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
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-400">Aucun accès enregistré</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
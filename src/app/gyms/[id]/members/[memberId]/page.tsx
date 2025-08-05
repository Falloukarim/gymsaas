import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  User, 
  Activity,
  Mail,
  Phone,
  Clock,
  ScanLine,
  Ticket,
  History
} from 'lucide-react';
import { SubscriptionStatusBadge } from '@/components/subscription-status-badge';
import { QRCodeGenerator } from '@/components/members/QRCodeGenerator';
import { DownloadMemberBadgeButton } from '@/components/members/DownloadMemberBadgeButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

     const getImageUrl = (url: string | null) => {
  if (!url) return '';
  
  // Vérifie si l'URL est déjà une URL complète
  if (url.startsWith('http')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Si c'est un chemin relatif, construisez l'URL complète
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${url}`;
  return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
};

 return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header avec bouton retour et infos membre */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/gyms/${gymId}/members`}
          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux membres</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getImageUrl(member.avatar_url)} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">{member.full_name}</h1>
            <p className="text-sm text-muted-foreground">{member.gyms?.name}</p>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Infos membre */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {member.email || 'Non renseigné'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {member.phone || 'Non renseigné'}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Carte Abonnement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span>Abonnement</span>
              </CardTitle>
            </CardHeader>
           <CardContent>
  {hasActiveSubscription ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{activeSubscription.subscriptions?.type}</p>
          <p className="text-sm text-muted-foreground">
            {activeSubscription.subscriptions?.description}
          </p>
        </div>
        <SubscriptionStatusBadge status="active" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Début</p>
          <p className="text-sm">{new Date(activeSubscription.start_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fin</p>
          <p className="text-sm">{new Date(activeSubscription.end_date).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  ) : lastSubscription ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{lastSubscription.subscriptions?.type}</p>
          <p className="text-sm text-muted-foreground">
            {lastSubscription.subscriptions?.description}
          </p>
        </div>
        <SubscriptionStatusBadge status="expired" />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Expiré le</p>
        <p>{new Date(lastSubscription.end_date).toLocaleDateString()}</p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center text-center space-y-3 py-4">
      <Activity className="h-8 w-8 text-muted-foreground" />
      <p className="text-muted-foreground">Aucun abonnement actif</p>
    </div>
  )}

  {/* Bouton Nouvelle Session - Toujours visible */}
  <div className="flex flex-col xs:flex-row gap-2 pt-4">
    {hasActiveSubscription || lastSubscription ? (
      <Button asChild size="sm" className="w-full">
        <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
          Renouveler
        </Link>
      </Button>
    ) : (
      <Button asChild size="sm" className="w-full">
        <Link href={`/gyms/${gymId}/members/${memberId}/renew`}>
          Ajouter un abonnement
        </Link>
      </Button>
    )}
    <Button variant="outline" size="sm" asChild className="w-full">
      <Link href={`/gyms/${gymId}/members/${memberId}/new-session`}>
        Nouvelle session
      </Link>
    </Button>
  </div>
</CardContent>
          </Card>

          {/* QR Code Section */}
          {hasActiveSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5" />
                  <span>Badge Membre</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="border p-4 rounded-lg bg-background w-full">
                  <QRCodeGenerator 
                    value={member.qr_code || ''} 
                    size={160}
                    className="p-2 border rounded bg-white mx-auto" 
                  />
                  <p className="text-center text-xs mt-3 text-muted-foreground">
                    ID: {member.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <DownloadMemberBadgeButton 
                  member={{
                    ...member,
                    has_subscription: true,
                    gyms: member.gyms ? {
                      id: gymId,
                      name: member.gyms.name,
                      logo_url: member.gyms.logo_url
                    } : undefined
                  }}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne de droite - Historiques */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <Tabs defaultValue="payments">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <span>Historique</span>
                  </CardTitle>
                  <TabsList>
                    <TabsTrigger value="payments" className="flex gap-2">
                      <CreditCard className="h-4 w-4" /> Paiements
                    </TabsTrigger>
                    <TabsTrigger value="access" className="flex gap-2">
                      <ScanLine className="h-4 w-4" /> Accès
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="payments">
                  {payments?.length ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {payments.map((payment: Payment) => (
                          <div key={payment.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <p className="font-medium">{payment.type}</p>
                              <p className="font-semibold">{payment.amount} F CFA</p>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                              <span>{new Date(payment.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CreditCard className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun paiement enregistré</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="access">
                  {accessLogs?.length ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {accessLogs.map((log: AccessLog) => (
                          <div key={log.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <Badge variant={log.type === 'entry' ? 'default' : 'secondary'}>
                                {log.type === 'entry' ? 'Entrée' : 'Sortie'}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {log.method === 'qr' ? 'QR Code' : 'Manuel'}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Aucun accès enregistré</p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          {/* Abonnements et sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Abonnements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.filter(isSubscription).length ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {subscriptions.filter(isSubscription).map((sub: MemberSubscription) => (
                        <div key={sub.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between">
                            <p className="font-medium">{sub.subscriptions?.type}</p>
                            <SubscriptionStatusBadge 
                              status={
                                sub.status === 'active' && new Date(sub.end_date) > new Date() 
                                  ? 'active' 
                                  : 'expired'
                              } 
                            />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Aucun abonnement</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {sessions.map((session: MemberSubscription) => (
                        <div key={session.id} className="border-b pb-4 last:border-0">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {session.subscriptions?.description || 'Session'}
                            </p>
                            <p>{session.subscriptions?.price} F CFA</p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.start_date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Aucune session</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
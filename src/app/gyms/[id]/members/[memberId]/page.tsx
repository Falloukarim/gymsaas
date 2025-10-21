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
import { MemberActionButtons } from '@/components/members/MemberActionButtons';

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
  
  // Logique améliorée pour la gestion des abonnements
  const activeSubscription = subscriptions.find(isSubscription);
  const subscriptionStatus = !activeSubscription
    ? "expired"
    : new Date(activeSubscription.end_date) < new Date()
    ? "expired"
    : "active";
  const hasValidSubscription = subscriptionStatus === "active";
  
  const sessions = subscriptions.filter((sub: MemberSubscription) => !isSubscription(sub));

  const initials = member.full_name
    .split(' ')
    .map((n: string) => n[0])
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
      {/* Header avec bouton retour et infos membre - AVATAR TRÈS GRAND ET PRO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
        <Link
          href={`/gyms/${gymId}/members`}
          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux membres</span>
        </Link>
        
        {/* Section avatar et infos avec avatar très grand */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Avatar très grand et professionnel */}
         <div className="relative">
  <Avatar className="h-52 w-52 sm:h-56 sm:w-56 lg:h-60 lg:w-60 border-4 border-background shadow-2xl ring-8 ring-primary/20 transition-transform duration-300 hover:scale-105">
    <AvatarImage 
      src={getImageUrl(member.avatar_url)} 
      className="object-cover h-full w-full rounded-full"
      alt={`Photo de ${member.full_name}`}
    />
    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
      {initials}
    </AvatarFallback>
  </Avatar>

  {/* Badge de statut en overlay */}
  {hasValidSubscription && (
    <div className="absolute -bottom-3 -right-3">
      <div className="bg-green-500 text-white text-sm sm:text-base font-semibold px-3 py-1 rounded-full shadow-xl border-2 border-white">
        ✓ Actif
      </div>
    </div>
  )}
</div>

          
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {member.full_name}
              </h1>
              <p className="text-xl text-muted-foreground mt-1">{member.gyms?.name}</p>
            </div>
            
            {/* Badges d'information */}
           <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
  {hasValidSubscription ? (
    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-sm py-1 px-3">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        Abonnement actif
      </div>
    </Badge>
  ) : (
    <Badge variant="secondary" className="text-sm py-1 px-3">
      Sans abonnement
    </Badge>
  )}
  <Badge variant="outline" className="text-sm py-1 px-3 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
    Membre depuis {new Date(member.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
  </Badge>
</div>
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
                <span>Informations personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{member.email || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{member.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Membre depuis</p>
                    <p className="font-medium">{new Date(member.created_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carte Abonnement - LOGIQUE AMÉLIORÉE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span>Abonnement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasValidSubscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-lg">{activeSubscription?.subscriptions?.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {activeSubscription?.subscriptions?.description}
                      </p>
                    </div>
                    <SubscriptionStatusBadge status={subscriptionStatus} />
                  </div>
                  
             <div className="grid grid-cols-2 gap-4 p-4 bg-green-100 rounded-lg border border-green-300 shadow-sm">
  <div>
    <p className="text-sm font-medium text-green-800">Début</p>
    <p className="text-base font-semibold text-green-900">
      {new Date(activeSubscription!.start_date).toLocaleDateString()}
    </p>
  </div>
  <div>
    <p className="text-sm font-medium text-green-800">Fin</p>
    <p className="text-base font-semibold text-green-900">
      {new Date(activeSubscription!.end_date).toLocaleDateString()}
    </p>
  </div>
</div>

                </div>
              ) : activeSubscription ? (
                // Abonnement existant mais expiré
            <div className="space-y-4">
  {/* Type et description */}
  <div className="flex justify-between items-center">
    <div>
      <p className="font-semibold text-xl text-gray-900">
        {activeSubscription.subscriptions?.type}
      </p>
      <p className="text-sm text-gray-600">
        {activeSubscription.subscriptions?.description}
      </p>
    </div>
    <SubscriptionStatusBadge status={subscriptionStatus} />
  </div>
  
  {/* Bloc date expirée / début-fin */}
  <div className="p-4 bg-amber-200 rounded-lg border border-amber-300 shadow-sm">
    <p className="text-sm font-medium text-amber-800">Expiré le</p>
    <p className="text-lg font-semibold text-amber-900">
      {new Date(activeSubscription.end_date).toLocaleDateString()}
    </p>
  </div>
</div>

              ) : (
                // Aucun abonnement trouvé
                <div className="flex flex-col items-center text-center space-y-3 py-6">
                  <Activity className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Aucun abonnement actif</p>
                  <p className="text-sm text-muted-foreground">Ajoutez un abonnement pour ce membre</p>
                </div>
              )}

              {/* Utilisation du composant client pour les boutons */}
              <div className="mt-6">
                <MemberActionButtons
                  gymId={gymId}
                  memberId={memberId}
                  hasActiveSubscription={hasValidSubscription}
                  hasLastSubscription={!!activeSubscription}
                />
              </div>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          {hasValidSubscription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5" />
                  <span>Badge Membre</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="border-2 p-4 rounded-xl bg-background w-full border-dashed border-primary/20">
                  <QRCodeGenerator 
                    value={member.qr_code || ''} 
                    size={160}
                    className="p-2 border rounded-lg bg-white mx-auto shadow-sm" 
                  />
                  <p className="text-center text-xs mt-3 text-muted-foreground font-mono">
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                  <span>Historique des abonnements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptions.filter(isSubscription).length ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {subscriptions.filter(isSubscription).map((sub: MemberSubscription) => {
                        const subStatus = new Date(sub.end_date) < new Date() ? "expired" : "active";
                        return (
                          <div key={sub.id} className="border-b pb-4 last:border-0">
                            <div className="flex justify-between">
                              <p className="font-medium">{sub.subscriptions?.type}</p>
                              <SubscriptionStatusBadge status={subStatus} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
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
                  <span>Sessions ponctuelles</span>
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
                            <p className="font-semibold">{session.subscriptions?.price} F CFA</p>
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
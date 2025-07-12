import { createClient } from '@/utils/supabase/server';
import { Activity, ArrowUpRight, Clock, CreditCard, Users, Euro } from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/revenue-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = createClient();

  // 1. Récupération des statistiques principales
  const { count: activeMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact' })
    .eq('status', 'active');

  const { count: activeSubscriptions } = await supabase
    .from('member_subscriptions')
    .select('*', { count: 'exact' })
    .gt('end_date', new Date().toISOString());

  // 2. Récupération des données financières
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const { data: todayRevenue } = await supabase
    .from('payments')
    .select('amount')
    .gte('created_at', today.toISOString());

  const { data: monthlyRevenue } = await supabase
    .from('payments')
    .select('amount')
    .gte('created_at', new Date(new Date().setDate(1)).toISOString());

  // Calcul des totaux
  const todayRevenueTotal = todayRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const monthlyRevenueTotal = monthlyRevenue?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  // 3. Récupération des entrées aujourd'hui
  const { count: todayEntries } = await supabase
    .from('access_logs')
    .select('*', { count: 'exact' })
    .gte('timestamp', today.toISOString())
    .eq('access_granted', true);

  // 4. Derniers abonnements
  const { data: recentSubscriptions } = await supabase
    .from('member_subscriptions')
    .select(`
      *,
      members(full_name),
      subscriptions(name)
    `)
    .order('start_date', { ascending: false })
    .limit(5);

  // 5. Dernières entrées
  const { data: recentEntries } = await supabase
    .from('access_logs')
    .select(`
      *,
      members(full_name)
    `)
    .order('timestamp', { ascending: false })
    .limit(5);

  // Préparation des statistiques
  const stats = [
    { 
      name: "Membres actifs", 
      value: activeMembers?.toLocaleString() || "0", 
      icon: Users, 
      change: "+0%", 
      changeType: "positive" 
    },
    { 
      name: "Abonnements actifs", 
      value: activeSubscriptions?.toLocaleString() || "0", 
      icon: CreditCard, 
      change: "+0%", 
      changeType: "positive" 
    },
    { 
      name: "Revenu du jour", 
      value: `€${todayRevenueTotal.toFixed(2)}`, 
      icon: Euro, 
      change: "+0%", 
      changeType: "positive" 
    },
    { 
      name: "Revenus mensuels", 
      value: `€${monthlyRevenueTotal.toFixed(2)}`, 
      icon: Activity, 
      change: "+0%", 
      changeType: "positive" 
    },
    { 
      name: "Entrées aujourd'hui", 
      value: todayEntries?.toString() || "0", 
      icon: Clock, 
      change: "+0%", 
      changeType: "positive" 
    },
  ];

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Tableau de Bord</CardTitle>
            <Button asChild className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
              <Link href="/members/new">Ajouter un membre</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat) => (
              <Card key={stat.name} className="bg-[#0d1a23] border-gray-700 min-h-[120px]">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center mb-2">
                    <div className="rounded-md bg-[#00c9a7]/20 p-2">
                      <stat.icon className="h-4 w-4 text-[#00c9a7]" />
                    </div>
                    <h3 className="text-xs font-medium text-gray-300 ml-2 text-center line-clamp-2">
                      {stat.name}
                    </h3>
                  </div>
                  <div className="mt-auto">
                    <p className="text-xl font-semibold text-white text-center truncate">
                      {stat.value}
                    </p>
                    <div className={`flex items-center justify-center mt-1 text-xs ${
                      stat.changeType === "positive" ? "text-green-400" : "text-red-400"
                    }`}>
                      <ArrowUpRight className={`h-3 w-3 ${
                        stat.changeType === "positive" ? "" : "rotate-180"
                      }`} />
                      <span className="ml-1">{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graphique des revenus */}
          <RevenueChart />

          {/* Derniers abonnements et entrées */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Derniers abonnements */}
            <Card className="border-gray-700 bg-[#0d1a23]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Derniers abonnements</span>
                  <Link href="/subscriptions" className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                    Voir tous →
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubscriptions?.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{(sub.members as any)?.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-400">{(sub.subscriptions as any)?.name}</p>
                          <Badge 
                            variant={
                              new Date(sub.end_date) > new Date() ? "default" : "destructive"
                            }
                            className="text-xs"
                          >
                            {new Date(sub.end_date) > new Date() ? "Actif" : "Expiré"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">€{sub.amount}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(sub.start_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dernières entrées */}
            <Card className="border-gray-700 bg-[#0d1a23]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Dernières entrées</span>
                  <Link href="/access-logs" className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                    Voir tous →
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEntries?.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{(entry.members as any)?.full_name}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={entry.access_granted ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {entry.access_granted ? "Validé" : "Refusé"}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-white">
                            {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
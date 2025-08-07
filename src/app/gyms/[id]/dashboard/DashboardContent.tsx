'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AnimatedCards } from "@/components/animated-cards";
import { AnimatedSubscriptions, AnimatedEntries } from "@/components/animated-lists";
import { Button } from '@/components/ui/button';
import { PrinterIcon, Ticket, Tickets } from 'lucide-react'; 
import { connectAndPrint } from '@/utils/bluetoothPrinter';
import LoadingSkeleton from './LoadingSkeleton';

type Member = { full_name: string };
type Subscription = { name: string };
type MemberSubscription = {
  id: string;
  start_date: string;
  end_date: string;
  amount: number;
  members: Member;
  subscriptions: Subscription;
};
type AccessLog = {
  id: string;
  timestamp: string;
  access_granted: boolean;
  members: Member;
};

type Stat = {
  name: string;
  value: string;
  iconName: "Users" | "CreditCard" | "Euro" | "Activity" | "Clock" | "Ticket" | "Tickets";
  change: string;
  changeType: "positive" | "negative";
  description?: string;
};

interface DashboardData {
  stats: Stat[];
  chartData: any[];
  recentSubscriptions: MemberSubscription[];
  recentEntries: AccessLog[];
  gym: { name: string; address: string };
  ticketStats: {
    today_count: number;
    today_total: number;
    week_count: number;
    week_total: number;
  };
}

export default function DashboardContent({ gymId }: { gymId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

 const handlePrint = async () => {
  if (!data?.gym?.name) return;

  try {
    
    const response = await fetch(`/api/gyms/${gymId}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionType: 'session' }),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du ticket');

    const ticket = await response.json();

    await connectAndPrint(data.gym.name, ticket);

    const dashboardResponse = await fetch(`/api/gyms/${gymId}/dashboard`);
    if (dashboardResponse.ok) {
      setData(await dashboardResponse.json());
    }

  } catch (error) {
    console.error('Print error:', error);
    alert('Erreur : ' + (error instanceof Error ? error.message : String(error)));
  }
};


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gyms/${gymId}/dashboard`);
        if (!response.ok) throw new Error('Erreur lors du chargement des données');
        setData(await response.json());
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gymId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return <div>Aucune donnée disponible</div>;

  const { stats, recentSubscriptions, recentEntries, gym, ticketStats } = data;
// Dans DashboardContent.tsx
const allStats: Stat[] = [
  ...stats.filter(stat => 
    !stat.name.includes("Tickets") // Exclure les anciennes stats de tickets si elles existent
  ),
  {
    name: "Tickets aujourd'hui",
    value: ticketStats.today_count.toString(),
    iconName: "Ticket",
    change: `${ticketStats.today_total} XOF`,
    changeType: "positive",
    description: "Nombre de tickets vendus aujourd'hui"
  },
  {
    name: "Tickets cette semaine",
    value: ticketStats.week_count.toString(),
    iconName: "Tickets",
    change: `${ticketStats.week_total} XOF`,
    changeType: "positive",
    description: "Nombre de tickets vendus cette semaine"
  }
];

  return (
    <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="p-4 rounded-xl border border-green-500 bg-gradient-to-r from-green-100/10 via-green-200/10 to-green-100/10 shadow-md">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-300">
              {gym?.name}
            </CardTitle>
            <p className="text-xs sm:text-sm text-green-200">{gym?.address}</p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              disabled={!gym?.name}
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimer Ticket
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatedCards stats={allStats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Derniers abonnements</span>
                <Link href={`/gyms/${gymId}/subscriptions`} className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                  Voir tous →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedSubscriptions subscriptions={recentSubscriptions} gymId={gymId} />
            </CardContent>
          </Card>

          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Dernières entrées</span>
                <Link href={`/gyms/${gymId}/access-logs`} className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e]">
                  Voir tous →
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatedEntries entries={recentEntries} gymId={gymId} />
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorComponent({ error }: { error: string }) {
  return (
    <Card className="border-0 bg-red-900/20 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Erreur</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error}</p>
        <button 
          className="mt-4 bg-[#00c9a7] hover:bg-[#00a58e] text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </CardContent>
    </Card>
  );
}
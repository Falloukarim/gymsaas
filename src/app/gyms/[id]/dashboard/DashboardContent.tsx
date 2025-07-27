// src/app/gyms/[id]/dashboard/DashboardContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AnimatedCards } from "@/components/animated-cards";
import { AnimatedSubscriptions, AnimatedEntries } from "@/components/animated-lists";
import { AddMemberButton } from '@/components/buttons/AddMemberButton';
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

export default function DashboardContent({ gymId }: { gymId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    stats: any[];
    chartData: any[];
    recentSubscriptions: MemberSubscription[];
    recentEntries: AccessLog[];
    gym: { name: string; address: string };
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gyms/${gymId}/dashboard`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données');
        }
        const result = await response.json();
        setData(result);
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

  const { stats, chartData, recentSubscriptions, recentEntries, gym } = data;

  return (
    <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">{gym?.name}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-300">{gym?.address}</p>
          </div>
          <AddMemberButton gymId={gymId} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatedCards stats={stats} />

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
              <AnimatedSubscriptions 
                subscriptions={recentSubscriptions} 
                gymId={gymId} 
              />
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
              <AnimatedEntries 
                entries={recentEntries} 
                gymId={gymId} 
              />
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
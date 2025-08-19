'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AnimatedCards } from "@/components/animated-cards";
import { AnimatedSubscriptions, AnimatedEntries } from "@/components/animated-lists";
import { Button } from '@/components/ui/button';
import { PrinterIcon, Ticket, Tickets } from 'lucide-react'; 
import { 
  connectToPrinter, 
  printTicket, 
  disconnectPrinter, 
  isPrinterConnected, 
  getConnectedPrinterName,
  getPrinterStatus,
  setPrinterConfig
} from '@/utils/bluetoothPrinter';
import LoadingSkeleton from './LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { Loader2} from 'lucide-react';
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
  const [printerStatus, setPrinterStatus] = useState({
    isConnected: false,
    printerName: null as string | null,
    isPrinting: false
  });
      useEffect(() => {
    setPrinterConfig({
      serviceUUID: process.env.NEXT_PUBLIC_PRINTER_SERVICE_UUID || '000018f0-0000-1000-8000-00805f9b34fb',
      characteristicUUID: process.env.NEXT_PUBLIC_PRINTER_CHARACTERISTIC_UUID || '00002af1-0000-1000-8000-00805f9b34fb'
    });
  }, []);
  const updatePrinterStatus = () => {
    setPrinterStatus({
      isConnected: isPrinterConnected(),
      printerName: getConnectedPrinterName(),
      isPrinting: false
    });
  };

const handlePrint = async () => {
  if (!data?.gym?.name || printerStatus.isPrinting) return;

  setPrinterStatus(prev => ({ ...prev, isPrinting: true }));
  const toastId = toast.loading('Impression en cours...');
  
  try {

    if (!isPrinterConnected()) {
      throw new Error("L'imprimante n'est pas connectée");
    }

    await printTicket(data.gym.name, { id: 'temp-test' });

    const response = await fetch(`/api/gyms/${gymId}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionType: 'session' }),
    });

    if (!response.ok) throw new Error('Erreur lors de la création du ticket');

    toast.success(`Ticket #${(await response.json()).id} imprimé !`, { 
      id: toastId,
      duration: 4000 
    });

    const dashboardResponse = await fetch(`/api/gyms/${gymId}/dashboard`);
    if (dashboardResponse.ok) setData(await dashboardResponse.json());

  } catch (error) {
    toast.error(`Échec : ${error instanceof Error ? error.message : ''}`, { 
      id: toastId,
      duration: 4000 
    });
  } finally {
    setPrinterStatus(prev => ({ ...prev, isPrinting: false }));
  }
};

  const handleConnectPrinter = async () => {
    const toastId = toast.loading('Connexion à l\'imprimante...');
    try {
      await connectToPrinter();
      updatePrinterStatus();
      toast.success(`Imprimante connectée: ${getConnectedPrinterName()}`, { id: toastId });
    } catch (error) {
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Échec de connexion'}`, { id: toastId });
    }
  };

  const handleDisconnectPrinter = () => {
    disconnectPrinter();
    toast.success('Imprimante déconnectée');
    updatePrinterStatus();
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
    updatePrinterStatus(); // Vérifier l'état de connexion au montage
  }, [gymId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorComponent error={error} />;
  if (!data) return <div>Aucune donnée disponible</div>;

  const { stats, recentSubscriptions, recentEntries, gym, ticketStats } = data;
  const allStats: Stat[] = [
    ...stats.filter(stat => !stat.name.includes("Tickets")),
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

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            {printerStatus.isConnected ? (
              <>
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  <span className="text-xs text-green-300">
                    {printerStatus.printerName || 'Imprimante connectée'}
                  </span>
                </div>
                <Button
                  onClick={handleDisconnectPrinter}
                  className="text-xs h-8 px-2 bg-red-600 hover:bg-red-700 transition-colors"
                  variant="destructive"
                  disabled={printerStatus.isPrinting}
                >
                  Déconnecter
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectPrinter}
                className="text-xs h-8 px-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                disabled={printerStatus.isPrinting}
              >
                {printerStatus.isPrinting ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  'Connecter l\'imprimante'
                )}
              </Button>
            )}
          </div>
          
          <Button 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={!printerStatus.isConnected || printerStatus.isPrinting}
          >
            {printerStatus.isPrinting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="animate-pulse">Impression...</span>
              </>
            ) : (
              <>
                <PrinterIcon className="h-4 w-4" />
                Imprimer Ticket
              </>
            )}
          </Button>
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-6">
      <AnimatedCards stats={allStats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-700 bg-[#0d1a23] hover:bg-[#0f202d] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Derniers abonnements</span>
              <Link 
                href={`/gyms/${gymId}/subscriptions`} 
                className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e] transition-colors"
              >
                Voir tous →
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatedSubscriptions subscriptions={recentSubscriptions} gymId={gymId} />
          </CardContent>
        </Card>

        <Card className="border-gray-700 bg-[#0d1a23] hover:bg-[#0f202d] transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dernières entrées</span>
              <Link 
                href={`/gyms/${gymId}/access-logs`} 
                className="text-sm font-normal text-[#00c9a7] hover:text-[#00a58e] transition-colors"
              >
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
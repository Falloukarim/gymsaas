'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AnimatedCards } from "@/components/animated-cards";
import { AnimatedSubscriptions, AnimatedEntries } from "@/components/animated-lists";
import { Button } from '@/components/ui/button';
import { PrinterIcon, AlertTriangle, ShoppingCart, TrendingUp, Package } from 'lucide-react'; 
import { 
  connectToPrinter, 
  printTicket, 
  disconnectPrinter, 
  isPrinterConnected, 
  getConnectedPrinterName,
  setPrinterConfig
} from '@/utils/bluetoothPrinter';
import LoadingSkeleton from './LoadingSkeleton';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

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

interface Session {
  id: string;
  price: number;
  description: string;
  type?: string;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  min_stock_level: number;
}

interface SaleStat {
  today_sales: number;
  today_revenue: number;
  best_selling_product: string;
  low_stock_count: number;
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
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [saleStats, setSaleStats] = useState<SaleStat>({
    today_sales: 0,
    today_revenue: 0,
    best_selling_product: 'Aucun',
    low_stock_count: 0
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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`/api/gyms/${gymId}/sessions`);
        if (response.ok) {
          const sessions = await response.json();
          setAvailableSessions(sessions);
          if (sessions.length > 0) {
            setSelectedSession(sessions[0].id);
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des sessions:', err);
      }
    };
    
    if (gymId) {
      fetchSessions();
    }
  }, [gymId]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Récupérer les produits en stock faible
        const productsResponse = await fetch(`/api/gyms/${gymId}/products`);
        if (productsResponse.ok) {
          const products: Product[] = await productsResponse.json();
          const lowStock = products.filter(
            p => p.quantity <= p.min_stock_level && p.quantity > 0
          );
          setLowStockProducts(lowStock);
        }

        // Récupérer les statistiques de vente
        const salesResponse = await fetch(`/api/gyms/${gymId}/sales/stats`);
        if (salesResponse.ok) {
          const stats = await salesResponse.json();
          setSaleStats(stats);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de stock:', error);
      }
    };

    if (gymId) {
      fetchStockData();
    }
  }, [gymId]);

  const handlePrint = async () => {
    if (!data?.gym?.name || printerStatus.isPrinting || !selectedSession) return;

    setPrinterStatus(prev => ({ ...prev, isPrinting: true }));
    const toastId = toast.loading('Impression en cours...');
    
    try {
      if (!isPrinterConnected()) {
        throw new Error("L'imprimante n'est pas connectée");
      }

      const selectedSessionDetails = availableSessions.find(s => s.id === selectedSession);
      
      await printTicket(
        data.gym.name, 
        { id: 'temp-test' }, 
        {
          type: selectedSessionDetails?.type || 'session',
          price: selectedSessionDetails?.price || 0,
          description: selectedSessionDetails?.description || ''
        },
        {
          additionalText: `Session: ${selectedSessionDetails?.description || ''}\nPrix: ${selectedSessionDetails?.price} XOF`
        }
      );

      const response = await fetch(`/api/gyms/${gymId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionType: 'session',
          subscriptionId: selectedSession
        }),
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
    updatePrinterStatus();
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
    <div className="space-y-6">
      {/* Alertes de stock faible */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Alertes de Stock</h3>
          </div>
          <p className="text-yellow-700 text-sm mb-2">
            {lowStockProducts.length} produit(s) ont un stock faible:
          </p>
          <ul className="text-yellow-700 text-sm list-disc list-inside">
            {lowStockProducts.slice(0, 3).map(product => (
              <li key={product.id}>
                {product.name} ({product.quantity} restant(s))
              </li>
            ))}
            {lowStockProducts.length > 3 && (
              <li>...et {lowStockProducts.length - 3} autres</li>
            )}
          </ul>
          <Link href={`/gyms/${gymId}/stock/products`}>
            <Button variant="outline" size="sm" className="mt-2">
              Voir tous les produits
            </Button>
          </Link>
        </div>
      )}

      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="p-4 rounded-xl border border-green-500 bg-gradient-to-r from-green-100/10 via-green-200/10 to-green-100/10 shadow-md">
              <CardTitle className="text-xl sm:text-2xl font-bold text-green-300">
                {gym?.name}
              </CardTitle>
              <p className="text-xs sm:text-sm text-green-200">{gym?.address}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bloc Gestion imprimante */}
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <PrinterIcon className="h-5 w-5" />
                Gestion de l'imprimante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connexion imprimante */}
              {printerStatus.isConnected ? (
                <div className="flex items-center justify-between bg-green-900/20 px-3 py-2 rounded">
                  <span className="flex items-center gap-2 text-green-300 text-sm">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    {printerStatus.printerName || 'Imprimante connectée'}
                  </span>
                  <Button
                    onClick={handleDisconnectPrinter}
                    className="text-xs h-8 px-3 bg-red-600 hover:bg-red-700 rounded-lg shadow-md"
                    disabled={printerStatus.isPrinting}
                  >
                    Déconnecter
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectPrinter}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-900 to-green-1000 
                            hover:from-blue-600 hover:to-green-600 
                            text-white font-medium h-9 px-4 rounded-lg shadow-md transition-all"
                  disabled={printerStatus.isPrinting}
                >
                  {printerStatus.isPrinting ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </span>
                  ) : (
                    "Connecter l'imprimante"
                  )}
                </Button>
              )}

              {/* Sélection session */}
              {availableSessions.length > 0 && (
                <div>
                  <label htmlFor="session-select" className="text-xs text-gray-400 mb-1 block">
                    Choisir une session :
                  </label>
                  <select
                    id="session-select"
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-600"
                    disabled={printerStatus.isPrinting}
                  >
                    {availableSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.description || "Session"} — {session.price} XOF
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Impression */}
              <Button
                onClick={handlePrint}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-green-1000 
                          hover:from-blue-600 hover:to-green-600 
                          flex items-center justify-center gap-2 h-10 px-6
                          text-white font-semibold rounded-lg shadow-md transition-all"
                disabled={!printerStatus.isConnected || printerStatus.isPrinting || !selectedSession}
              >
                {printerStatus.isPrinting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Impression en cours...
                  </>
                ) : (
                  <>
                    <PrinterIcon className="h-5 w-5" />
                    Imprimer Ticket
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Statistiques de vente */}
          <Card className="border-gray-700 bg-[#0d1a23]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <TrendingUp className="h-5 w-5" />
                Statistiques de Vente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4 text-blue-400" />
                    <h3 className="text-sm font-medium text-blue-300">Ventes Aujourd'hui</h3>
                  </div>
                  <p className="text-2xl font-bold text-white">{saleStats.today_sales}</p>
                  <p className="text-xs text-blue-300">{saleStats.today_revenue} XOF</p>
                </div>
                
                <div className="bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-green-400" />
                    <h3 className="text-sm font-medium text-green-300">Produit Populaire</h3>
                  </div>
                  <p className="text-lg font-bold text-white truncate">{saleStats.best_selling_product}</p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Link href={`/gyms/${gymId}/stock/pos`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Point de Vente
                  </Button>
                </Link>
                <Link href={`/gyms/${gymId}/stock/products`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    Gestion Stock
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats + autres sections */}
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
    </div>
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
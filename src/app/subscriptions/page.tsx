'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface SubscriptionWithMember {
  id: string;
  start_date: string;
  end_date: string;
  member: { full_name: string };
  subscription: { name: string; price: number };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscriptions() {
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
      setLoading(false);
    }
    fetchSubscriptions();
  }, []);

  function getStatus(start: string, end: string) {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (now < startDate) return 'Pending';
    if (now > endDate) return 'Expiré';
    return 'Actif';
  }

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Gestion des Abonnements</CardTitle>
            <Button asChild className="bg-[#00c9a7] hover:bg-[#00a58e] text-white">
              <Link href="/subscriptions/new">
                + Créer un abonnement
              </Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="rounded-lg overflow-hidden border border-gray-700">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1e3a4b]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Membre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Abonnement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Période</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0d1a23] divide-y divide-gray-700">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#1a2e3a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/members/${sub.member.full_name}`}>
                          <span className="text-white font-medium hover:text-[#00c9a7]">
                            {sub.member.full_name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{sub.subscription.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{sub.subscription.price.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        <div className="text-sm">{new Date(sub.start_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">au {new Date(sub.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getStatus(sub.start_date, sub.end_date) === "Actif" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {getStatus(sub.start_date, sub.end_date)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/subscriptions/${sub.id}`} className="text-[#00c9a7] hover:text-[#00a58e] mr-4">
                          Voir
                        </Link>
                        <Link href={`/subscriptions/${sub.id}/edit`} className="text-[#00c9a7] hover:text-[#00a58e]">
                          Modifier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SubscriptionDetailsPage() {
  const { id } = useParams();

  // Simulation d'abonnement
  const subscription = {
    id,
    member: "Aliou Diop",
    memberId: "user-123",
    plan: "Premium Mensuel",
    price: "59.99",
    status: "active",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    paymentMethod: "Carte de crédit",
    createdAt: "2025-06-25"
  };

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/subscriptions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle className="text-xl">Détails de l'Abonnement</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Membre</Label>
                <p className="text-white font-medium">
                  <Link 
                    href={`/members/${subscription.memberId}`}
                    className="text-[#00c9a7] hover:underline"
                  >
                    {subscription.member}
                  </Link>
                </p>
              </div>
              
              <div>
                <Label className="text-gray-300">Plan</Label>
                <p className="text-white font-medium">{subscription.plan}</p>
              </div>
              
              <div>
                <Label className="text-gray-300">Prix</Label>
                <p className="text-white font-medium">{subscription.price} €</p>
              </div>
              
              <div>
                <Label className="text-gray-300">Méthode de paiement</Label>
                <p className="text-white font-medium">{subscription.paymentMethod}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Statut</Label>
                <div className="mt-1">
                  <Badge 
                    variant={subscription.status === "active" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {subscription.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">Date de début</Label>
                <p className="text-white font-medium">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label className="text-gray-300">Date de fin</Label>
                <p className="text-white font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <Label className="text-gray-300">Créé le</Label>
                <p className="text-white font-medium">
                  {new Date(subscription.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button
              variant="outline"
              className="border-gray-600 text-white hover:bg-white/10"
              asChild
            >
              <Link href={`/subscriptions/${id}/edit`}>
                Modifier
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant Label pour une meilleure cohérence
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-xs text-gray-400 mb-1 ${className}`}>
      {children}
    </p>
  );
}
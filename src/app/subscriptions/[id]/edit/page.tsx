"use client";

import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionEditPage() {
  const { id } = useParams();

  // Simulation d'abonnement (à remplacer par un fetch Supabase)
  const subscription = {
    id,
    member: "Aliou Diop",
    plan: "Premium Mensuel",
    price: "59.99",
    duration: "30",
    status: "active",
    startDate: "2025-07-01",
    endDate: "2025-07-31",
    description: "Accès illimité à toutes les installations"
  };

  return (
    <div className="p-6">
      <Card className="border-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] text-white">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href={`/subscriptions/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle className="text-xl">Modifier l'Abonnement</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Abonnement #{subscription.id}</h2>
              <Badge 
                variant={subscription.status === "active" ? "default" : "destructive"}
                className="text-xs"
              >
                {subscription.status === "active" ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <p className="text-sm text-gray-300 mt-1">Membre: {subscription.member}</p>
          </div>

          <form className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="plan" className="text-white">
                  Nom du plan
                </Label>
                <Input
                  id="plan"
                  name="plan"
                  defaultValue={subscription.plan}
                  className="bg-white/10 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  Prix (€)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={subscription.price}
                  className="bg-white/10 border-gray-700 text-white"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">
                  Durée (jours)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  defaultValue={subscription.duration}
                  className="bg-white/10 border-gray-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  Statut
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={subscription.status}
                  className="flex h-10 w-full rounded-md border border-gray-700 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c9a7]"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-white">
                Date de début
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={subscription.startDate}
                className="bg-white/10 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-white">
                Date de fin
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={subscription.endDate}
                className="bg-white/10 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={subscription.description}
                className="flex w-full rounded-md border border-gray-700 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c9a7]"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-white hover:bg-white/10"
                asChild
              >
                <Link href={`/subscriptions/${id}`}>
                  Annuler
                </Link>
              </Button>
              <Button type="submit" className="bg-[#00c9a7] hover:bg-[#00a58e]">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
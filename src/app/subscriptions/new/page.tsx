import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createSubscription } from "@/actions/subscriptions/create";

export default function NewSubscriptionPage() {
  const gymId = "TON_GYM_ID_ICI"; // récupère dynamiquement selon ta logique

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
            <CardTitle className="text-xl">Nouvel Abonnement</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form action={createSubscription} className="space-y-6 max-w-md">
            <input type="hidden" name="gym_id" value={gymId} />

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Nom de l'abonnement
              </Label>
              <Input
                id="name"
                name="name"
                className="bg-white/10 border-gray-700 text-white"
                placeholder="Premium, Basique, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-white">
                  Prix (€)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  className="bg-white/10 border-gray-700 text-white"
                  placeholder="29.99"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_days" className="text-white">
                  Durée (jours)
                </Label>
                <Input
                  id="duration_days"
                  name="duration_days"
                  type="number"
                  className="bg-white/10 border-gray-700 text-white"
                  placeholder="30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="flex w-full rounded-md border border-gray-700 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00c9a7]"
                placeholder="Avantages de cet abonnement..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-[#00c9a7] hover:bg-[#00a58e]">
                Créer l'abonnement
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

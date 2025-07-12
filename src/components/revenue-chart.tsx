// components/revenue-chart.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function RevenueChart() {
  return (
    <Card className="border-gray-700 bg-[#0d1a23]">
      <CardHeader>
        <CardTitle>Revenus mensuels</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {/* Votre implémentation de graphique ici */}
          <div className="h-full flex items-center justify-center text-gray-400">
            [Graphique des revenus]
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
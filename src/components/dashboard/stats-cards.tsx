"use client";

import { Card } from "../ui/card";
import { Activity, ArrowUpRight, Clock, CreditCard, Users } from "lucide-react";

const stats = [
  { name: "Membres actifs", value: "134", icon: Users, change: "+12%", changeType: "positive" },
  { name: "Abonnements actifs", value: "17", icon: CreditCard, change: "+4%", changeType: "positive" },
  { name: "Revenus mensuels", value: "Cfa 244560", icon: Activity, change: "+8.2%", changeType: "positive" },
  { name: "Entrées aujourd'hui", value: "87", icon: Clock, change: "-2%", changeType: "negative" },
];

export function StatsCards() {
  return (
    
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center">
            <div className="rounded-md bg-indigo-100 p-3">
              <stat.icon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
              <div className="mt-1 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-medium ${
                    stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center text-red-500 rotate-180" />
                  )}
                  <span className="sr-only">{stat.changeType === "positive" ? "Increased" : "Decreased"} by</span>
                  {stat.change}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
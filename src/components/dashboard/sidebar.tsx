"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CreditCard, DoorOpen, Activity, Settings, User } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
    { href: "/members", icon: <Users className="h-4 w-4" />, label: "Membres" },
    { href: "/subscriptions", icon: <CreditCard className="h-4 w-4" />, label: "Abonnements" },
    { href: "/access-logs", icon: <DoorOpen className="h-4 w-4" />, label: "Accès" },
    { href: "/payments", icon: <Activity className="h-4 w-4" />, label: "Paiements" },
    { href: "/settings", icon: <Settings className="h-4 w-4" />, label: "Paramètres" },
  ];

  return (
    <div className="hidden md:flex md:w-56 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-700 bg-gradient-to-b from-[#1a2e3a] to-[#0d1a23]">
        <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-3">
          <div className="flex flex-shrink-0 items-center px-3 py-3">
            <h1 className="text-lg font-bold text-white">🏋️ GymPro</h1>
          </div>
          <nav className="mt-2 flex-1 space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded px-2 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-[#00c9a7] text-white"
                    : "text-gray-300 hover:bg-[#00c9a7]/30 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
              
            ))}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-700 p-3 bg-[#0d1a23]">
          <div className="flex items-center">         
          </div>
        </div>
      </div>
    </div>
  );
}
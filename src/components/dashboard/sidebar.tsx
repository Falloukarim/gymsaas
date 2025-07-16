"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { MotionAside } from "@/lib/motion";
import {
  Home,
  Users,
  CreditCard,
  DoorOpen,
  Activity,
} from "lucide-react";

import MotionSidebarButton from "@/components/ui/MotionSidebarButton";

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const gymId = params.id;

  const navItems = [
    { href: `/gyms/${gymId}/dashboard`, icon: Home, label: "Dashboard" },
    { href: `/gyms/${gymId}/members`, icon: Users, label: "Membres" },
    { href: `/gyms/${gymId}/subscriptions`, icon: CreditCard, label: "Abonnements" },
    { href: `/gyms/${gymId}/access-logs`, icon: DoorOpen, label: "Accès" },
    { href: `/gyms/${gymId}/payments`, icon: Activity, label: "Paiements" },
  ];

  return (
    <MotionAside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden md:flex md:w-52 flex-col border-r border-black-700 bg-[#00624f] shadow-lg"
    >
      <div className="flex flex-col flex-1 py-4 px-3">
        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            const isDashboard = label === "Dashboard";

            return (
              <Link key={href} href={href}>
                <MotionSidebarButton
                  isActive={isActive}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                    transition-colors duration-200
                    ${isDashboard
                      ? "text-white hover:bg-gray-800"
                      : "bg-[#1f2937] text-[#00c9a7] hover:bg-[#374151]"}
                    ${isActive ? "border border-[#00c9a7]" : ""}
                  `}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive && !isDashboard ? "text-[#00c9a7]" : ""
                    }`}
                  />
                  <span>{label}</span>
                </MotionSidebarButton>
              </Link>
            );
          })}
        </nav>
      </div>
    </MotionAside>
  );
}

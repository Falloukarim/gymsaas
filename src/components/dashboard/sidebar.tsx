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
  { href: `/gyms/${gymId}/roles`, icon: Users, label: "Rôles" }, // <== lien vers Role Manager
];


  return (
    <MotionAside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="hidden md:flex md:w-52 flex-col border-r border-black-700 bg-[#00624f
] shadow-lg"
    >
      <div className="flex flex-col flex-1 py-4 px-3">
        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
             <Link key={href} href={href}>
  <MotionSidebarButton isActive={isActive}>
    <Icon className={`h-4 w-4 ${isActive ? "drop-shadow-[0_0_8px_#00c9a7]" : ""}`} />
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

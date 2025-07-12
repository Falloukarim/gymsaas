"use client";

import { Bell, ChevronDown, Search, Settings, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ gymId }: { gymId?: string }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Vérifier si on est sur une page de gym
  const isGymPage = pathname?.includes('/gyms/');

  return (
    <div className="sticky top-0 z-10 flex h-14 flex-shrink-0 bg-gradient-to-r from-[#1a2e3a] to-[#0d1a23] shadow">
      <div className="flex flex-1 justify-between px-4">
        <div className="flex flex-1 items-center">
          <div className="flex w-full max-w-md">
            <div className="relative w-full text-gray-300 focus-within:text-white">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="search"
                name="search"
                className="block w-full rounded-md border-0 bg-white/10 py-1.5 pl-10 pr-3 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-[#00c9a7]"
                placeholder="Rechercher..."
                type="search"
              />
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-gray-300 hover:bg-white/10 hover:text-white h-8 w-8"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <div className="relative ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center rounded-full h-8 w-8"
            >
              <ChevronDown className="h-3 w-3 text-gray-300" />
            </Button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-md bg-[#0d1a23] py-1 shadow-lg ring-1 ring-gray-700">
                <Link 
                  href="/profile" 
                  className="flex items-center px-3 py-1.5 text-xs text-gray-300 hover:bg-[#00c9a7]/20 hover:text-white"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Votre profil
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center px-3 py-1.5 text-xs text-gray-300 hover:bg-[#00c9a7]/20 hover:text-white"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Paramètres
                </Link>
                <Link 
                  href="/logout" 
                  className="flex items-center px-3 py-1.5 text-xs text-gray-300 hover:bg-[#00c9a7]/20 hover:text-white"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-3 w-3 mr-2" />
                  Déconnexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
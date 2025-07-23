"use client";

import { Bell, ChevronDown, LogOut, Settings, User, Search, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { QRScanner } from "@/components/QRScanner";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Menu } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { PulsatingButton } from "../buttons/PulsatingButton";

type UserData = {
  email: string;
  avatar_url: string | null;
  full_name: string | null;
};

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const pathname = usePathname();
  const { toggle } = useSidebar();

  // Extraire l'ID du gymnase de l'URL
  const gymId = pathname.split('/')[2];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("email, avatar_url, full_name")
          .eq("id", user.id)
          .single();

        setUserData(data || { email: user.email || "", avatar_url: null, full_name: null });
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchUser());

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [pathname]);

// Solution : Modifiez la fonction handleLogout dans votre navbar
const handleLogout = async () => {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
    });
    
    if (response.ok) {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

  const getInitials = () =>
    userData?.full_name?.charAt(0).toUpperCase() ||
    userData?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0d1a23]/90 backdrop-blur-sm flex items-center justify-between px-4 border-b border-gray-800 w-full">
      {/* Bouton Hamburger visible sur mobile */}
      <button onClick={toggle} className="md:hidden p-2 text-gray-400 hover:text-white">
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex items-center gap-4 w-full max-w-sm">
        {/* Bouton SG modifié pour rediriger vers le dashboard du gymnase */}
        <Link href={`/gyms/${gymId}/dashboard`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PulsatingButton
              className="rounded-full bg-white/20 backdrop-blur-md border-2 border-white hidden md:flex items-center justify-center"
              pulseColor="#ffffff"
              duration="0.8s"
              pulseIntensity={0.4}
              style={{ width: "50px", height: "50px", padding: 0 }}
            >
              <span className="text-xl font-bold text-white">SG</span>
            </PulsatingButton>
            <span className="text-white font-bold text-lg md:hidden">SG</span>
          </motion.div>
        </Link>

      </div>

      {/* Right (Actions) */}
      <div className="flex items-center gap-3">
        <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
          <DialogTrigger asChild>
            <button
              className="rounded-full p-2 text-gray-400 hover:text-white transition"
              aria-label="Scanner QR Code"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle className="sr-only">Scanner QR Code</DialogTitle>
            <QRScanner />
          </DialogContent>
        </Dialog>

        <button
          className="rounded-full p-2 text-gray-400 hover:text-white transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded-full p-1 text-gray-300 hover:text-white"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData?.avatar_url || ""} />
              <AvatarFallback className="bg-[#00c9a7] text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className={`h-4 w-4 transition ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 rounded-md bg-[#0f1f2a] shadow-lg ring-1 ring-gray-800 z-50"
              >
                <div className="p-2 text-sm text-white">
                  <div className="px-3 py-2 text-xs text-gray-400">Connecté en tant que</div>
                  <div className="px-3 py-1 truncate">{userData?.email || "Chargement..."}</div>

                  <div className="mt-2 border-t border-gray-700" />

                  <Link href={`/gyms/${gymId}/profile`} className="flex items-center px-3 py-2 hover:bg-gray-800/50">
  <User className="h-4 w-4 mr-2" />
  Mon profil
</Link>
                  <Link href="/settings" className="flex items-center px-3 py-2 hover:bg-gray-800/50">
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Link>

                  <div className="mt-2 border-t border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-2 text-red-400 hover:bg-gray-800/50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
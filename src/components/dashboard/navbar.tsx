"use client";

import { Bell, ChevronDown, LogOut, Settings, User, Search, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { QRScanner } from "@/components/QRScanner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getInitials = () =>
    userData?.full_name?.charAt(0).toUpperCase() ||
    userData?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0d1a23]/90 backdrop-blur-sm flex items-center justify-between px-4 border-b border-gray-800">
      {/* Left (Logo + Search) */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <Link href="/" className="text-white font-bold text-lg hidden md:block">
          SG
        </Link>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full rounded-md bg-gray-800/50 py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
          />
        </div>
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

                  <Link href="/profile" className="flex items-center px-3 py-2 hover:bg-gray-800/50">
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
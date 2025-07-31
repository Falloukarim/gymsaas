'use client';

import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  QrCode,
  Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabaseClient';
import { QRScanner } from '@/components/QRScanner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSidebar } from '@/context/SidebarContext';

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

  const gymId = pathname?.split('/')[2] || '';

  const getImageUrl = (url: string | null) => {
  if (!url) return '';
  
  // Vérifie si l'URL est déjà une URL complète
  if (url.startsWith('http')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  
  // Si c'est un chemin relatif, construisez l'URL complète
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fullUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${url}`;
  return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
};

  const fetchUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('users')
        .select('email, avatar_url, full_name')
        .eq('id', user.id)
        .single();

      setUserData(data || {
        email: user.email || '',
        avatar_url: null,
        full_name: null,
      });
      return user;
    }
    return null;
  };

  useEffect(() => {
    const setupRealtimeUpdates = async () => {
      const user = await fetchUser();
      const supabase = createClient();

      if (user?.id) {
        const channel = supabase
          .channel('realtime users')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'users',
              filter: `id=eq.${user.id}`
            },
            () => fetchUser()
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    setupRealtimeUpdates();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.assign('/login');
      } else {
        const errorData = await response.json();
        console.error('Logout failed:', errorData.error);
        alert('Échec de la déconnexion');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Erreur réseau');
    } finally {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    console.log('Current avatar URL:', userData?.avatar_url);
  }, [userData?.avatar_url]);

  const getInitials = () =>
    userData?.full_name?.charAt(0).toUpperCase() ||
    userData?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <header className="sticky top-0 z-50 h-14 bg-[#0d1a23]/90 backdrop-blur-sm flex items-center justify-between px-4 border-b border-gray-800 w-full">
      {/* Menu burger mobile */}
      <button
        onClick={toggle}
        className="md:hidden p-2 text-gray-400 hover:text-white"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Logo SG */}
      <div className="flex items-center gap-4 w-full max-w-sm">
        <Link href={gymId ? `/gyms/${gymId}/dashboard` : '#'} className="hidden md:flex">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
          </motion.div>
        </Link>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-3">
        {/* Scanner QR */}
        <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
          <DialogTrigger asChild>
            <button
              className="rounded-full p-2 text-gray-400 hover:text-white transition"
              aria-label="Scanner un QR Code"
            >
              <QrCode className="h-4 w-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle className="sr-only">Scanner QR Code</DialogTitle>
            <QRScanner />
          </DialogContent>
        </Dialog>

        {/* Notifications (placeholder) */}
        <button
          className="rounded-full p-2 text-gray-400 hover:text-white transition"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Menu utilisateur */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded-full p-1 text-gray-300 hover:text-white"
            aria-label="Menu utilisateur"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={getImageUrl(userData?.avatar_url || null)}
                onError={(e) => {
                  e.currentTarget.src = '';
                  e.currentTarget.style.display = 'none';
                }}
              />
              <AvatarFallback className="bg-[#00c9a7] text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown
              className={`h-4 w-4 transition ${dropdownOpen ? 'rotate-180' : ''}`}
            />
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
                  <div className="px-3 py-2 text-xs text-gray-400">
                    Connecté en tant que
                  </div>
                  <div className="px-3 py-1 truncate">
                    {userData?.email || 'Chargement...'}
                  </div>

                  <div className="mt-2 border-t border-gray-700" />

                  <Link
                    href={gymId ? `/gyms/${gymId}/profile` : '#'}
                    className="flex items-center px-3 py-2 hover:bg-gray-800/50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mon profil
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
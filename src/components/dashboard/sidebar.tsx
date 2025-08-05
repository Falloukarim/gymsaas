"use client";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useSidebar } from "@/context/SidebarContext";
import { Home, Users, CreditCard, DoorOpen, Activity, X } from "lucide-react";
import MotionSidebarButton from "@/components/ui/MotionSidebarButton";
import { motion, AnimatePresence, Variants } from "framer-motion";
import useIsMobile from "../../../hooks/useIsMobile";
import { createClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { USER_ROLES } from "@/lib/constants/role";

export default function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const gymId = params.id;
  const { isOpen, close } = useSidebar();
  const isMobile = useIsMobile();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && gymId) {
        const { data } = await supabase
          .from("gbus")
          .select("role")
          .eq("gym_id", gymId)
          .eq("user_id", user.id)
          .single();
        
        setCurrentUserRole(data?.role || null);
      }
    };

    fetchUserRole();
  }, [gymId, supabase]);

  const navItems = [
    { href: `/gyms/${gymId}/dashboard`, icon: Home, label: "Dashboard" },
    { href: `/gyms/${gymId}/members`, icon: Users, label: "Membres" },
    { href: `/gyms/${gymId}/subscriptions`, icon: CreditCard, label: "Abonnements" },
    { href: `/gyms/${gymId}/access-logs`, icon: DoorOpen, label: "Accès" },
    { href: `/gyms/${gymId}/payments`, icon: Activity, label: "Paiements" },
    ...(currentUserRole === USER_ROLES.OWNER
      ? [{ href: `/gyms/${gymId}/roles`, icon: Users, label: "Rôles" }]
      : []),
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      } 
    },
  };

  const handleLinkClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.aside
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed md:relative top-0 left-0 z-50 md:z-auto h-full
                       w-64 md:w-52 bg-[#00624f] shadow-lg border-r border-black-700 flex flex-col"
          >
            {isMobile && (
              <div className="flex justify-end p-2">
                <button onClick={close}>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col flex-1 py-4 px-3"
            >
              <motion.nav className="flex flex-col gap-2">
                {navItems.map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href;
                  return (
                    <motion.div key={href} variants={itemVariants}>
                      <Link href={href} onClick={handleLinkClick}>
                        <MotionSidebarButton isActive={isActive}>
                          <Icon className={`h-4 w-4 ${isActive ? "drop-shadow-[0_0_8px_#00c9a7]" : ""}`} />
                          <span className="truncate">{label}</span>
                        </MotionSidebarButton>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.nav>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { usePathname } from "next/navigation";
import { Menu, X, Box, Wallet, Mail, Sparkles, User } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname?.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      path: "/features",
      name: "Fonctionnalités",
      icon: <Sparkles className="w-5 h-5" />,
      mobileIcon: <Sparkles className="w-6 h-6" />
    },
    {
      path: "/pricing",
      name: "Tarifs",
      icon: <Wallet className="w-5 h-5" />,
      mobileIcon: <Wallet className="w-6 h-6" />
    },
    {
      path: "/contact",
      name: "Contact",
      icon: <Mail className="w-5 h-5" />,
      mobileIcon: <Mail className="w-6 h-6" />
    }
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "bg-[#01012b]/90 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative w-20 h-20">
              <Image
                src="/logo1.png"
                alt="EasyFit"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <Link 
              href={item.path} 
              key={item.path}
              className={`group flex flex-col items-center px-3 py-2 hover:text-cyan-300 transition ${
                isActive(item.path) ? "text-cyan-400" : "text-white"
              }`}
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-cyan-500/10 transition">
                {item.icon}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* CTA Desktop */}
        <div className="hidden md:block">
          <Link href="/login">
            <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200 text-sm px-4 py-2">
              <User className="w-4 h-4 mr-2" />
              Se connecter
            </InteractiveHoverButton>
          </Link>
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/login">
            <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200 text-sm px-3 py-1.5">
              <User className="w-4 h-4" />
            </InteractiveHoverButton>
          </Link>
          
          <button 
            onClick={toggleMobileMenu}
            className="text-white p-2 focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#01012b]/95 backdrop-blur-md overflow-hidden"
          >
            <nav className="flex flex-col gap-2 p-4">
              {navItems.map((item) => (
                <Link 
                  href={item.path} 
                  key={item.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition ${
                    isActive(item.path) ? "text-cyan-400 font-semibold" : "text-white"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white/5">
                    {item.mobileIcon}
                  </div>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
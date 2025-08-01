"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

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
            {/* Votre logo ici */}
          </motion.div>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link 
            href="/features" 
            className={`hover:text-cyan-300 transition ${
              isActive("/features") ? "text-cyan-400 font-semibold" : "text-white"
            }`}
          >
            Fonctionnalités
          </Link>
          <Link 
            href="/pricing" 
            className={`hover:text-cyan-300 transition ${
              isActive("/pricing") ? "text-cyan-400 font-semibold" : "text-white"
            }`}
          >
            Tarifs
          </Link>
          <Link 
            href="/contact" 
            className={`hover:text-cyan-300 transition ${
              isActive("/contact") ? "text-cyan-400 font-semibold" : "text-white"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Desktop */}
        <div className="hidden md:block">
          <Link href="/login">
            <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200 text-sm px-4 py-2">
              Se connecter
            </InteractiveHoverButton>
          </Link>
        </div>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center gap-4">
          <Link href="/login">
            <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200 text-sm px-3 py-1.5">
              Connexion
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
            <nav className="flex flex-col gap-4 p-6 text-center">
              <Link 
                href="/features" 
                onClick={closeMobileMenu}
                className={`py-3 hover:text-cyan-300 transition ${
                  isActive("/features") ? "text-cyan-400 font-semibold" : "text-white"
                }`}
              >
                Fonctionnalités
              </Link>
              <Link 
                href="/pricing" 
                onClick={closeMobileMenu}
                className={`py-3 hover:text-cyan-300 transition ${
                  isActive("/pricing") ? "text-cyan-400 font-semibold" : "text-white"
                }`}
              >
                Tarifs
              </Link>
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className={`py-3 hover:text-cyan-300 transition ${
                  isActive("/contact") ? "text-cyan-400 font-semibold" : "text-white"
                }`}
              >
                Contact
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
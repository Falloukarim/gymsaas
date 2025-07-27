"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PulsatingButton } from "@/components/buttons/PulsatingButton";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { usePathname } from "next/navigation";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fonction pour déterminer si le lien est actif
  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname?.startsWith(path);
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
          </motion.div>
        </Link>

        {/* Navigation */}
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

        {/* CTA */}
        <Link href="/login">
          <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200">
            Se connecter
          </InteractiveHoverButton>
        </Link>
      </div>
    </motion.header>
  );
}
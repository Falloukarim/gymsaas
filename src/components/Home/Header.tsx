"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PulsatingButton } from "@/components/buttons/PulsatingButton";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <PulsatingButton
              className="rounded-full bg-white/20 backdrop-blur-md border-2 border-white"
              pulseColor="#ffffff"
              duration="0.8s"
              pulseIntensity={0.4}
              style={{ width: "50px", height: "50px", padding: 0 }}
            >
              <span className="text-xl font-bold text-white">SG</span>
            </PulsatingButton>

            <span className="hidden md:block text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            </span>
          </motion.div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="#features" className="hover:text-cyan-300 transition">Fonctionnalités</Link>
          <Link href="#pricing" className="hover:text-cyan-300 transition">Tarifs</Link>
          <Link href="#contact" className="hover:text-cyan-300 transition">Contact</Link>
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

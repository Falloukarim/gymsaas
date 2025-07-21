"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="relative z-10 text-center py-24 bg-gradient-to-r from-white/5 to-transparent">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto px-6"
      >
        <motion.h4
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent"
        >
          Prêt à transformer la gestion de votre salle ?
        </motion.h4>
        <Link href="/register">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 transition-all shadow-lg">
              <span className="text-white font-semibold">Créer mon compte gratuitement</span>
              <span className="ml-3">→</span>
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}

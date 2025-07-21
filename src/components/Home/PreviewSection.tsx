"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function PreviewSection() {
  return (
    <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto text-center">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-16"
      >
        Un aperçu de l'application
      </motion.h3>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, staggerChildren: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl"
        >
          <Image
            src="/dashboard-stats.png"
            alt="Dashboard analytique affichant statistiques d'abonnement et revenus"
            width={800}
            height={500}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-white text-lg font-medium">Dashboard analytique</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl shadow-2xl"
        >
          <Image
            src="/mockup-dashboard.png"
            alt="Interface de gestion et badges d'accès"
            width={800}
            height={500}
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-white text-lg font-medium">Badges d'accès</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

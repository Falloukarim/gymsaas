"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const features = [
  {
    title: "Gestion des membres",
    description: "Ajoutez, modifiez et suivez les abonnements de vos membres.",
    icon: "👥",
  },
  {
    title: "Suivi des paiements",
    description: "Visualisez les paiements en attente et les renouvellements.",
    icon: "💳",
  },
  {
    title: "Planification de cours",
    description: "Organisez vos cours collectifs avec des horaires précis.",
    icon: "📅",
  },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#01012b] to-[#02125e] text-white flex flex-col overflow-hidden">
      {/* Effet Spotlight custom avec Framer Motion */}
      <motion.div
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-white opacity-10 blur-3xl"
        animate={{
          x: [0, 200, -100, 0],
          y: [0, 100, -150, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold"
        >
          SENGYM
        </motion.h1>
        <Link href="/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <InteractiveHoverButton className="bg-white text-[#01012b] hover:bg-gray-200">
  Se connecter
</InteractiveHoverButton>

          </motion.div>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-4"
        >
          Gérez votre salle de sport <br className="hidden md:block" /> comme un pro
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl"
        >
          Application de gestion complète pour abonnements, cours et paiements.
        </motion.p>
        <Link href="/register">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ShimmerButton>
              Commencer maintenant
            </ShimmerButton>
          </motion.div>
        </Link>
      </section>

      {/* Fonctionnalités */}
      <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white shadow-lg"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Capture d'écran (Mock) */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6"
        >
          Un aperçu de l'application
        </motion.h3>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/mockup-dashboard.png"
            alt="Aperçu du dashboard"
            width={1000}
            height={600}
            className="rounded-xl shadow-xl mx-auto"
          />
        </motion.div>
      </section>

      {/* Call to Action final */}
      <section className="relative z-10 text-center py-16">
        <motion.h4
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-semibold mb-6"
        >
          Prêt à transformer la gestion de votre salle ?
        </motion.h4>
        <Link href="/register">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="text-lg px-8 py-4 rounded-full bg-green-500 hover:bg-green-600 transition">
              Créer mon compte
            </Button>
          </motion.div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-sm text-gray-400">
        © 2025 SENGYM. Tous droits réservés.
      </footer>
    </main>
  );
}

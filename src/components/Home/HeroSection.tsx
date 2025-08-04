'use client';

import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import InfiniteScrollingTags from './InfiniteScrollingTags';
import { ArrowRight, Dumbbell, HeartPulse, Shield, Activity, BarChart2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

const textVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.2, 0.65, 0.3, 0.9]
    }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

export default function HeroSection() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const router = useRouter();

  const features = [
    {
      icon: <Dumbbell className="w-5 h-5" />,
      title: "Gestion des abonnements",
      description: "Suivi des membres actifs/inactifs en temps réel"
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: "Analytique avancée",
      description: "Tableaux de bord financiers personnalisables"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Sécurité renforcée",
      description: "Contrôle d'accès et historique complet"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Gestion des membres",
      description: "Fiches clients détaillées et suivis"
    }
  ];

  return (
    <motion.section
      style={{ y: yPos }}
      className="relative w-full px-6 py-28 md:py-36 overflow-hidden bg-gradient-to-b from-[#01012b] to-[#0a0a2a]"
    >
      {/* Effets de lumière dynamiques */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
      <motion.div 
  variants={textVariants}
  className="w-full max-w-5xl px-4"
>
  <motion.div
    className="relative bg-gradient-to-br from-[#0a0a2a] to-[#01012b] border border-white/10 rounded-2xl p-8 md:p-10 overflow-hidden"
    whileHover={{
      boxShadow: '0 20px 50px -10px rgba(34, 211, 238, 0.2)',
      borderColor: 'rgba(34, 211, 238, 0.3)'
    }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
  >
    {/* Effet de lumière au survol */}
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-1/2 left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1)_0%,transparent_70%)] transform -translate-x-1/2 -translate-y-1/2" />
    </motion.div>

    {/* Bordure animée */}
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        background: 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.3) 50%, rgba(34,211,238,0) 100%)',
        opacity: 0
      }}
      whileHover={{
        opacity: 1,
        transition: { duration: 0.8 }
      }}
    />

    {/* Contenu */}
    <div className="relative z-10">
      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Optimisez Votre Salle
        </span>
        <span className="block text-white mt-2">
          Avec une Solution Complète
        </span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
        variants={textVariants}
      >
        <span className="font-medium text-white">EasyFit Pro</span> transforme la gestion des salles de sport grâce à une plateforme <span className="text-cyan-400">intuitive et puissante</span>, spécialement conçue pour les professionnels.
      </motion.p>
    </div>

    {/* Points décoratifs */}
    <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-cyan-500/20 blur-md" />
    <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-blue-500/20 blur-md" />
  </motion.div>
</motion.div>
      </div>

      {/* Indicateur de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="animate-bounce flex flex-col items-center">
          <span className="text-xs text-gray-400 mb-2">Découvrir plus</span>
          <div className="w-6 h-10 rounded-full border-2 border-gray-400 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-gray-400 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
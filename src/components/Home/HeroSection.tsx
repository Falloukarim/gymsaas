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
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          {/* Titrage principal */}
          <motion.div 
            variants={textVariants}
            className="text-center mb-16 px-4"
          >
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
          </motion.div>

          {/* Grille de fonctionnalités */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 w-full max-w-6xl px-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={textVariants}
                whileHover={{ y: -8 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA principal */}
          <motion.div
            variants={textVariants}
            className="flex flex-col items-center gap-8 w-full px-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(34, 211, 238, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/register')}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-medium text-white transition-all duration-300"
            >
              <span>Démarrer gratuitement</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <div className="w-full max-w-4xl">
              <InfiniteScrollingTags />
            </div>
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
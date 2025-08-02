'use client';

import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import InfiniteScrollingTags from './InfiniteScrollingTags';
import { ArrowRight, Dumbbell, HeartPulse, Shield, Activity } from 'lucide-react';
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

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 1.2, ease: 'easeOut' }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.4
    }
  }
};

const featureItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'backOut' }
  }
};

export default function HeroSection() {
  const { scrollYProgress } = useScroll();
  const yPos = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4]);
  const router = useRouter();
  const features = [
    { icon: <Dumbbell className="w-6 h-6" />, text: "Gestion des abonnements" },
    { icon: <Activity className="w-6 h-6" />, text: "Analytique temps réel" },
    { icon: <Shield className="w-6 h-6" />, text: "Sécurité renforcée" },
    { icon: <HeartPulse className="w-6 h-6" />, text: "Suivi des membres" }
  ];

  return (
    <motion.section
      style={{ y: yPos, opacity }}
      className="relative z-20 w-full px-6 py-32 overflow-hidden"
    >
      {/* Background Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          {/* Main Headline */}
          <motion.div variants={textVariants} className="text-center mb-16">
            <motion.h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Excellence Sportive
              </span>
              <span className="block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Gestion Intelligente
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
              variants={textVariants}
            >
              <span className="font-semibold text-white">EasyFit Pro</span> révolutionne la gestion 
              des salles de sport avec une plateforme tout-en-un <span className="text-cyan-400">performante et sécurisée</span>.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 w-full max-w-4xl"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={featureItem}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:border-cyan-400/30 transition-all"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-sm font-medium">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA & Scrolling Tags */}
          <motion.div
            variants={textVariants}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="flex flex-col items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
               onClick={() => router.push('/register')}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-medium text-white shadow-lg hover:shadow-cyan-500/20 transition-all"
              >
                Démarrer l'expérience
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <div className="w-full">
                <InfiniteScrollingTags />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex justify-center"
      >
        <div className="animate-bounce w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full" />
        </div>
      </motion.div>
    </motion.section>
  );
}
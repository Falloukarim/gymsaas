'use client';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Header from '@/components/Home/Header';

export default function PricingPage() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardControls = useAnimation();
  const contentControls = useAnimation();

  const features = [
    "Essai gratuit de 1 mois",
    "Accès à toutes les fonctionnalités",
    "Support technique inclus",
    "Mises à jour gratuites"
  ];

  useEffect(() => {
    const animateAllContent = async () => {
      setIsAnimating(true);
      
      // Faire disparaître tout le contenu
      await contentControls.start({
        opacity: 0,
        y: -10,
        transition: { duration: 0.3 }
      });
      
      // Changer la feature
      setCurrentFeature((prev) => (prev + 1) % features.length);
      
      // Faire réapparaître tout le contenu
      await contentControls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
      });
      
      setIsAnimating(false);
    };

    const interval = setInterval(() => {
      if (!isAnimating) {
        animateAllContent();
      }
    }, 2000); // Changement toutes les 2 secondes

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/tech-background.jpeg"
          alt="Background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#01012b]/50 backdrop-blur-[2px]" />
      </div>
      
      <div className="relative z-10 text-white">
        <Header />
        
        <main className="max-w-7xl mx-auto px-6 py-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
              Tarifs Simples
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Un abonnement unique, sans engagement caché
            </p>
          </motion.div>

          {/* Card avec animations */}
          <div className="flex justify-center">
            <motion.div
              className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 rounded-2xl p-1 max-w-md w-full backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-900/20"
            >
              <motion.div 
                animate={contentControls}
                className="bg-[#01012b]/80 rounded-xl p-8 text-center backdrop-blur-sm border border-white/10"
              >
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Abonnement Mensuel</h3>
                <motion.p 
                  className="text-5xl font-bold my-6"
                  whileHover={{ scale: 1.05 }}
                >
                  20 000 FCFA
                </motion.p>
                <p className="text-gray-200 mb-8">par mois</p>
                
                <div className="h-20 mb-6 flex items-center justify-center">
                  <div className="flex items-center">
                    <span className="text-cyan-400 mr-2">✓</span> 
                    {features[currentFeature]}
                  </div>
                </div>

                <motion.button 
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Commencer l'essai gratuit
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          {/* Section FAQ */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-32 max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Questions Fréquentes
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "Comment fonctionne l'abonnement ?",
                  answer: "L'abonnement est mensuel et se renouvelle automatiquement. Vous pouvez annuler à tout moment sans frais."
                },
                {
                  question: "Quand serai-je facturé ?",
                  answer: "La facturation intervient chaque mois à la date de votre inscription. Vous bénéficiez d'un mois d'essai gratuit avant le premier prélèvement."
                },
                {
                  question: "Puis-je annuler à tout moment ?",
                  answer: "Oui, vous pouvez annuler votre abonnement en quelques clics depuis votre espace personnel, sans aucun frais."
                },
                {
                  question: "Quels moyens de paiement acceptez-vous ?",
                  answer: "Nous acceptons les cartes bancaires (Visa, Mastercard), les paiements mobiles (Orange Money, MTN Mobile Money) et les virements bancaires."
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-[#01012b]/70 rounded-xl p-6 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-colors duration-300"
                >
                  <h3 className="text-xl font-semibold text-cyan-400 mb-2">{item.question}</h3>
                  <p className="text-gray-200">{item.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
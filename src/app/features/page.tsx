'use client';
import { motion } from 'framer-motion';
import Header from '@/components/Home/Header';

const features = [
  {
    title: "Gestion des Membres",
    description: "Suivi complet des adhésions, paiements et accès en temps réel."
  },
  {
    title: "Badges Numériques",
    description: "Génération instantanée de badges avec QR code pour un accès sécurisé."
  },
  {
    title: "Suivi des Présences",
    description: "Enregistrement automatique des entrées/sorties via QR code."
  },
  {
    title: "Rapports Automatisés",
    description: "Statistiques et analyses pour une meilleure gestion de votre salle."
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#01012b] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Fonctionnalités Puissantes
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez comment notre solution révolutionne la gestion de votre salle de sport
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-all"
            >
              <h3 className="text-2xl font-bold text-cyan-400 mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
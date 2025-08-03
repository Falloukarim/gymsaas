'use client';

import { motion } from 'framer-motion';
import { Users, CreditCard, CalendarCheck, Activity, Shield, Settings } from 'lucide-react';

const features = [
  { 
    title: "Gestion des membres", 
    description: "Ajoutez, modifiez et suivez les abonnements de vos membres avec une interface intuitive conçue pour les professionnels.", 
    icon: <Users className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-500"
  },
  { 
    title: "Suivi financier", 
    description: "Visualisez les paiements, statistiques journalières et mensuelles avec des tableaux de bord personnalisables.", 
    icon: <CreditCard className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  },
  { 
    title: "Planification intelligente", 
    description: "Organisez votre salle de gym et attribuez des rôles à votre équipe en toute simplicité.", 
    icon: <CalendarCheck className="w-6 h-6" />,
    color: "from-amber-500 to-orange-500"
  },
  { 
    title: "Analytique en temps réel", 
    description: "Accédez à des métriques précises sur la fréquentation et les performances de votre salle.", 
    icon: <Activity className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500"
  },
  { 
    title: "Sécurité renforcée", 
    description: "Contrôle d'accès avancé et historique complet des entrées/sorties pour une traçabilité totale.", 
    icon: <Shield className="w-6 h-6" />,
    color: "from-violet-500 to-indigo-500"
  },
  { 
    title: "Paramètres avancés", 
    description: "Personnalisez l'interface et les fonctionnalités selon les besoins spécifiques de votre établissement.", 
    icon: <Settings className="w-6 h-6" />,
    color: "from-rose-500 to-red-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
      {/* Titre section */}
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent mb-4"
        >
          Fonctionnalités Premium
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-lg text-gray-300 max-w-3xl mx-auto"
        >
          Découvrez une suite complète d'outils conçus pour optimiser la gestion de votre salle de sport
        </motion.p>
      </div>

      {/* Grille de cartes */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.3
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.6, ease: "backOut" }
              }
            }}
            whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            className="group relative h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl overflow-hidden">
              <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
            </div>
            
            <div className="relative h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 overflow-hidden transition-all duration-300 group-hover:border-transparent">
              <div className={`absolute top-4 right-4 w-16 h-16 rounded-full ${feature.color.replace('to', 'opacity-20 to')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg mb-6 bg-gradient-to-r ${feature.color} shadow-lg`}>
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
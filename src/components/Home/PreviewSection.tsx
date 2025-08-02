"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BarChart2, Users, Clock, DollarSign, Shield, Activity, Calendar } from "lucide-react";

export default function PreviewSection() {
  const features = [
    {
      icon: <BarChart2 className="w-8 h-8 text-cyan-400" />,
      title: "Analytique en Temps Réel",
      description: "Visualisation claire des performances quotidiennes et mensuelles avec comparaisons"
    },
    {
      icon: <Users className="w-8 h-8 text-cyan-400" />,
      title: "Gestion des Abonnés",
      description: "Suivi des membres actifs/inactifs et création d'abonnements personnalisés"
    },
    {
      icon: <DollarSign className="w-8 h-8 text-cyan-400" />,
      title: "Suivi Financier",
      description: "Revenus journaliers/mensuels avec comparaison période à période"
    },
    {
      icon: <Clock className="w-8 h-8 text-cyan-400" />,
      title: "Historique Complet",
      description: "Journal détaillé de toutes les entrées/sorties avec timestamp précis"
    },
    {
      icon: <Shield className="w-8 h-8 text-cyan-400" />,
      title: "Sécurité Renforcée",
      description: "Contrôle d'accès et traçabilité de chaque entrée dans vos locaux"
    },
    {
      icon: <Activity className="w-8 h-8 text-cyan-400" />,
      title: "Alertes Intelligentes",
      description: "Notifications pour activités anormales ou pics de fréquentation"
    }
  ];

  return (
    <section className="relative z-10 px-6 py-16 max-w-7xl mx-auto">
      <div className="text-center mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6"
        >
          Gestion Intelligente de Votre Salle
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Un système complet pour optimiser et sécuriser vos opérations au quotidien
        </motion.p>
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Visual Previews */}
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  transition={{ duration: 0.8, staggerChildren: 0.2 }}
  className="grid grid-cols-1 gap-12"
>
  {/* Première image */}
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
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
      <h3 className="text-white text-2xl font-bold mb-2">Tableau de Bord Complet</h3>
      <p className="text-gray-300">
        Visualisation en temps réel des KPIs clés : abonnements, revenus, fréquentation
      </p>
    </div>
  </motion.div>

  {/* Deuxième image */}
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
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
      <h3 className="text-white text-2xl font-bold mb-2">Gestion des Accès</h3>
      <p className="text-gray-300">
        Système de badges et historique détaillé de toutes les entrées/sorties
      </p>
    </div>
  </motion.div>
</motion.div>

      {/* Stats Preview */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-400/20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
            <p className="text-gray-400">Surveillance</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
            <p className="text-gray-400">Disponibilité</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">+500</div>
            <p className="text-gray-400">Entrées journalières</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">30s</div>
            <p className="text-gray-400">Temps de réponse</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
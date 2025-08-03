'use client';

import { motion } from 'framer-motion';
import { Play, BarChart2, Users, CreditCard, Shield, CheckCircle } from 'lucide-react';

export default function PreviewSection() {
  const processSteps = [
    {
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      title: "1. Gestion des Membres",
      description: "Enregistrement simplifié des adhérents avec création de profils complets"
    },
    {
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      title: "2. Abonnements",
      description: "Configuration flexible des formules avec suivi des paiements et renouvellements"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-cyan-400" />,
      title: "3. Accès en Temps Réel",
      description: "Validation instantanée des badges avec notification des entrées/sorties"
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-cyan-400" />,
      title: "4. Analytique",
      description: "Tableaux de bord personnalisables pour suivre toutes vos métriques clés"
    },
    {
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      title: "5. Sécurité",
      description: "Historique complet des activités et contrôle d'accès granularisé"
    }
  ];

  return (
    <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6"
        >
          Découvrez Notre Interface
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-300 max-w-3xl mx-auto"
        >
          Une plateforme intuitive conçue pour simplifier la gestion quotidienne de votre salle
        </motion.p>
      </div>

      {/* Video + Process Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        {/* Video Demo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="aspect-video bg-black/20 flex items-center justify-center">
            {/* Remplacez par votre composant vidéo ou iframe */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500/90 hover:bg-cyan-400 transition-all flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="text-white text-lg absolute bottom-6 left-6">
              Démo : Dashboard & Badges
            </div>
          </div>
        </motion.div>

        {/* Process Description */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <h3 className="text-2xl font-bold text-white">
            Flux de travail optimisé
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Notre interface unifiée permet de gérer l'ensemble du cycle client en quelques clics, 
            depuis l'inscription jusqu'au suivi analytique, avec une prise en main immédiate.
          </p>

          <div className="space-y-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-2 bg-cyan-500/10 rounded-lg mt-1">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-400/20"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">24/7</div>
            <p className="text-gray-400">Disponibilité</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">95%</div>
            <p className="text-gray-400">Réduction tâches administratives</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">30s</div>
            <p className="text-gray-400">Création badge</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">100%</div>
            <p className="text-gray-400">Données sécurisées</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
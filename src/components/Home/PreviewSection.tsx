'use client';

import { motion } from 'framer-motion';
import { Play, BarChart2, Users, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { Activity, TrendingDown, BadgeCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function PreviewSection() {
  const processSteps = [
    {
      icon: <Users className="w-5 h-5 text-cyan-400" />,
      title: (
        <span className="font-semibold text-black bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-opacity-90">
          1. Gestion des Membres
        </span>
      ),
      description: (
        <p className="text-gray-100 bg-gray-800/80 backdrop-blur-md p-2 rounded-md shadow-sm">
          Enregistrement simplifié des adhérents avec création de profils complets
        </p>
      )
    },
    {
      icon: <CreditCard className="w-5 h-5 text-cyan-400" />,
      title: (
        <span className="font-semibold text-black bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-opacity-90">
          2. Abonnements
        </span>
      ),
      description: (
        <p className="text-gray-100 bg-gray-900/80 backdrop-blur-md p-2 rounded-md shadow-sm">
          Configuration flexible des formules avec suivi des paiements et renouvellements
        </p>
      )
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-cyan-400" />,
      title: (
        <span className="font-semibold text-black bg-gradient-to-r from-blue-800 to-green-400 bg-clip-text text-opacity-90">
          3. Accès en Temps Réel
        </span>
      ),
      description: (
        <p className="text-gray-100 bg-gray-900/80 backdrop-blur-md p-2 rounded-md shadow-sm">
          Validation instantanée des badges avec notification des entrées/sorties
        </p>
      )
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-cyan-400" />,
      title: (
        <span className="font-semibold text-black bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-opacity-90">
          4. Analytique
        </span>
      ),
      description: (
        <p className="text-gray-100 bg-gray-900/80 backdrop-blur-md p-2 rounded-md shadow-sm">
          Tableaux de bord personnalisables pour suivre toutes vos métriques clés
        </p>
      )
    },
    {
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
      title: (
        <span className="font-semibold text-black bg-gradient-to-r from-blue-700 to-green-400 bg-clip-text text-opacity-90">
          5. Sécurité
        </span>
      ),
      description: (
        <p className="text-gray-100 bg-gray-900/80 backdrop-blur-md p-2 rounded-md shadow-sm">
          Historique complet des activités et contrôle d'accès granularisé
        </p>
      )
    }
  ];

  return (
    <section className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
      {/* Image de fond sportive avec bords arrondis */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[#01012b]/40 rounded-2xl" />
        <Image
          src="/gym-background.jpeg"
          alt="Salle de sport moderne"
          fill
          className="object-cover rounded-2xl"
          quality={100}
          priority
          style={{
            objectPosition: "center center",
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
            borderRadius: '1rem'
          }}
        />
      </div>

      {/* Effets visuels plus discrets */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-cyan-500/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Contenu principal avec meilleur contraste */}
      <div className="text-center mb-16 relative">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent px-2">
            Découvrez Notre Interface
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed bg-gray-900/80 backdrop-blur-md rounded-lg p-4 border border-white/10 shadow-md"
        >
          Une plateforme intuitive conçue pour simplifier la gestion quotidienne de votre salle
        </motion.p>
      </div>

      {/* Video + Process Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-20 relative">
        {/* Video Demo */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 hover:border-cyan-400/40 transition-all duration-300"
        >
          <div className="aspect-video bg-black/30 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-500 hover:bg-cyan-400 transition-all flex items-center justify-center shadow-lg hover:scale-110">
                <Play className="w-8 h-8 text-white ml-1" />
              </button>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="text-white text-lg absolute bottom-6 left-6 font-medium drop-shadow-md">
              Démo : Dashboard & Badges
            </div>
          </div>
        </motion.div>

        {/* Process Description */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-bold text-black bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-opacity-90 p-4 rounded-md shadow-md">
            Flux de travail optimisé
          </h3>

          <p className="text-gray-100 bg-gray-900/80 backdrop-blur-md p-4 rounded-md border border-white/10 shadow-sm leading-relaxed">
            Notre interface unifiée permet de gérer l'ensemble du cycle client en quelques clics,
            depuis l'inscription jusqu'au suivi analytique, avec une prise en main immédiate.
          </p>

          <div className="space-y-4">
            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors duration-300 border border-white/20 hover:border-cyan-400/40 backdrop-blur-sm shadow-md"
              >
                <div className="p-2 bg-cyan-500/30 rounded-lg mt-1">
                  {step.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-1">{step.title}</h4>
                  <p className="text-gray-200">{step.description}</p>
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
        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl p-8 border border-cyan-400/30 backdrop-blur-sm relative overflow-hidden shadow-lg"
      >
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative"
        >
          {[
            { value: "24/7", label: "Disponibilité", icon: <Activity className="w-6 h-6" /> },
            { value: "95%", label: "Réduction tâches administratives", icon: <TrendingDown className="w-6 h-6" /> },
            { value: "10s", label: "Création badge", icon: <BadgeCheck className="w-6 h-6" /> },
            { value: "100%", label: "Données sécurisées", icon: <ShieldCheck className="w-6 h-6" /> }
          ].map((item, index) => (
            <motion.div
              key={index}
              variants={{
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                },
                hidden: { opacity: 0, y: 20 }
              }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-b from-[#0a0a2a]/70 to-[#01012b]/80 border border-white/20 rounded-xl p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 group shadow-md"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-cyan-500/30 rounded-full group-hover:bg-cyan-500/40 transition-colors duration-300">
                  {item.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                  {item.value}
                </div>
                <p className="text-sm md:text-base text-gray-200 drop-shadow-sm">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
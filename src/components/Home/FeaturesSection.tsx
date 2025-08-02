"use client";

import { motion } from "framer-motion";

const features = [
  { title: "Gestion des membres", description: "Ajoutez, modifiez et suivez les abonnements de vos membres.", icon: "👥" },
  { title: "Suivi des paiements", description: "Visualisez les paiements, statistisques journalier et mensuel.", icon: "💳" },
  { title: "Planification et attibution de roles", description: "Organisez votre salle de gym en toute quiétude.", icon: "📅" },
];

export default function FeaturesSection() {
  return (
    <section className="relative z-10 px-6 py-16 max-w-6xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white shadow-lg border border-transparent hover:border-cyan-400 transition"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

'use client';
import { motion } from 'framer-motion';
import Header from '@/components/Home/Header';

export default function PricingPage() {
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
            Tarifs Simples
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Un abonnement unique, sans engagement caché
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-1 max-w-md mx-auto"
        >
          <div className="bg-[#01012b] rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">Abonnement Mensuel</h3>
            <p className="text-5xl font-bold my-6">20 000 FCFA</p>
            <p className="text-gray-300 mb-8">par mois</p>
            
            <ul className="space-y-3 mb-10 text-left">
              <li className="flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> Essai gratuit de 1 mois
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> Accès à toutes les fonctionnalités
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> Support technique inclus
              </li>
              <li className="flex items-center">
                <span className="text-cyan-400 mr-2">✓</span> Mises à jour gratuites
              </li>
            </ul>

            <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition">
              Commencer l&apos;essai gratuit
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
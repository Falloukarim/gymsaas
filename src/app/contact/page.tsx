'use client';
import { motion } from 'framer-motion';
import Header from '@/components/Home/Header';

export default function ContactPage() {
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
            Contactez-Nous
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nous sommes là pour répondre à toutes vos questions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">Adresse</h3>
              <p className="text-gray-300">Dakar, Sénégal<br />Grand Mbao</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">Téléphone</h3>
              <p className="text-gray-300">+221 77 291 77 97</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">Horaires</h3>
              <p className="text-gray-300">Lundi - Vendredi: 8h - 18h<br />Samedi: 9h - 13h</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10"
          >
            <form className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Nom complet</label>
                <input 
                  type="text" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Envoyer le message
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
'use client';
import { motion } from 'framer-motion';
import Header from '@/components/Home/Header';
import { 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Facebook, 
  MessageSquare, 
  Send,
  MoveRight
} from 'lucide-react';

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
            Nous sommes à votre écoute pour toute question ou collaboration
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10">
              <h3 className="text-2xl font-bold text-cyan-400 mb-6">Informations Personnelles</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <MapPin className="text-cyan-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Adresse</h4>
                    <p className="text-gray-400">Dakar, Sénégal<br />Grand Mbao</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Phone className="text-cyan-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Téléphone</h4>
                    <p className="text-gray-400">+221 77 291 77 97</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Clock className="text-cyan-400 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-200">Horaires</h4>
                    <p className="text-gray-400">Lundi - Vendredi: 8h - 18h<br />Samedi: 9h - 13h</p>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h4 className="font-medium text-gray-200 mb-4">Réseaux Sociaux</h4>
                <div className="flex gap-4">
                  <a href="#" className="p-3 bg-white/5 hover:bg-cyan-500/10 rounded-full transition border border-white/10 hover:border-cyan-400/30">
                    <Facebook className="w-5 h-5 text-cyan-400" />
                  </a>
                  <a href="#" className="p-3 bg-white/5 hover:bg-cyan-500/10 rounded-full transition border border-white/10 hover:border-cyan-400/30">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                  </a>
                  <a href="#" className="p-3 bg-white/5 hover:bg-cyan-500/10 rounded-full transition border border-white/10 hover:border-cyan-400/30">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-xl p-8 backdrop-blur-sm border border-white/10"
          >
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Envoyez-nous un message</h3>
            
            <form className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">Nom complet</label>
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 text-sm font-medium">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm"
                  placeholder="Dites-nous comment nous pouvons vous aider..."
                ></textarea>
              </div>

              <button 
                type="submit"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition group"
              >
                Envoyer le message
                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
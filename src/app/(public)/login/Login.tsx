'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Attendre que la session soit bien établie
      await new Promise((r) => setTimeout(r, 1000))

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Utilisateur non trouvé')
      }

      // VÉRIFIER SI L'UTILISATEUR A DÉJÀ UN GYM
      const { data: gbus } = await supabase
        .from('gbus')
        .select('gym_id')
        .eq('user_id', user.id)

      if (gbus && gbus.length > 0) {
        // Rediriger vers le dashboard du premier gym
        router.push(`/gyms/${gbus[0].gym_id}/dashboard`)
        return
      }

      // Vérifier les invitations
      const { data: invitations } = await supabase
        .from('invitations')
        .select('id')
        .eq('email', user.email)
        .eq('accepted', false)

      if (invitations && invitations.length > 0) {
        router.push('/gyms/join')
        return
      }

      // Si pas de gym et pas d'invitations
      router.push('/gyms/select')

    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-[#00c9a7] rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Connexion</h1>
            <p className="mt-2 text-gray-400">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>

          {(message || error) && (
            <div
              className={`p-4 rounded-md text-sm ${
                message
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                  : 'bg-red-900/30 text-red-300 border border-red-800/50'
              }`}
            >
              {message || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00c9a7] focus:border-transparent"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Mot de passe
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#00c9a7] hover:text-[#00a58e] transition-colors"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#00c9a7] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00c9a7] hover:bg-[#00a58e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00c9a7] transition-colors shadow-lg shadow-[#00c9a7]/20 hover:shadow-[#00c9a7]/30"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion...
                  </>
                ) : 'Se connecter'}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Vous n'avez pas de compte?{' '}
              <Link href="/register" className="font-medium text-[#00c9a7] hover:text-[#00a58e] transition-colors">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex relative overflow-hidden">
        {/* Image d'arrière-plan avec superposition de dégradé */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80')"
          }}
        ></div>
        
        {/* Superposition de dégradé pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70 z-10"></div>
        
        {/* Contenu de bienvenue */}
        <div className="relative z-20 flex flex-col justify-center items-start px-16 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Bienvenue sur <span className="text-[#00c9a7]">EASYFIT</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              La solution complète pour gérer votre salle de sport, optimiser l'expérience de vos membres et développer votre business.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-[#00c9a7] text-white">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">Gestion des membres et abonnements</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-[#00c9a7] text-white">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">Suivi des performances et statistiques</p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-[#00c9a7] text-white">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="ml-3 text-gray-300">Réservations de cours et planning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Attendre 1s max pour la synchronisation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Vérifier les invitations
    const { data: { user } } = await supabase.auth.getUser();
    const { data: invitations } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', user?.email)
      .eq('accepted', false);

    if (invitations?.length) {
      window.location.href = '/gyms/join';
    } else {
      window.location.href = '/gyms/select';
    }
    
  } catch (err: any) {
    setError(err.message || "Erreur de connexion");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Connexion</h1>
            <p className="text-gray-400">
              Entrez votre email pour vous connecter à votre compte
            </p>
          </div>

          {(message || error) && (
            <div className={`p-3 rounded-md text-sm ${
              message ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {message || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-gray-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline text-[#00c9a7]"
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
                className="bg-white/5 border-gray-700 text-white"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#00c9a7] hover:bg-[#00a58e] text-white"
              disabled={loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-400">
            Vous n'avez pas de compte?{" "}
            <Link href="/register" className="text-[#00c9a7] underline">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-gradient-to-br from-[#0d1a23] to-[#1a2e3a] lg:flex items-center justify-center">
        <div className="p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Bienvenue sur SENGYM</h2>
          <p className="text-gray-300">
            La solution complète pour gérer votre salle de sport
          </p>
        </div>
      </div>
    </div>
  )
}
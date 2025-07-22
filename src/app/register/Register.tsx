// src/app/register/Register.tsx
'use client'

import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createPagesBrowserClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("📩 Vérifiez votre email pour confirmer votre compte.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-950 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-sm text-gray-400 mt-1">
            Rejoignez la plateforme et gérez votre salle de sport
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              placeholder="ex: utilisateur@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? 'Enregistrement...' : "S'inscrire"}
          </button>

          {message && (
            <p className="text-sm text-center text-gray-400">{message}</p>
          )}
        </form>

        <p className="text-sm text-center text-gray-500">
          Déjà inscrit ?{' '}
          <a href="/login" className="text-green-500 hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  )
}

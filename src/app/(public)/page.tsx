import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">MyGym SaaS</h1>
        <Link href="/login">
          <Button variant="secondary" className="bg-white text-[#01012b] hover:bg-gray-200">
            Se connecter
          </Button>
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Gérez votre salle de gym facilement
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Suivi des membres, abonnements et accès – tout en un seul endroit.
        </p>
        <Link href="/login">
          <Button className="text-lg px-6 py-3">
            Commencer maintenant
          </Button>
        </Link>
      </section>

      <footer className="text-center py-4 text-sm text-gray-400">
        © 2025 MyGym SaaS. Tous droits réservés.
      </footer>
    </main>
  )
}
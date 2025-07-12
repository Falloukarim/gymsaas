import '@/app/globals.css'

export const metadata = {
  title: 'MyGym SaaS',
  description: 'Gestion des salles de sport',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-gradient-to-br from-[#01012b] to-[#02125e] text-white min-h-screen">
      {children}
    </div>
  )
}

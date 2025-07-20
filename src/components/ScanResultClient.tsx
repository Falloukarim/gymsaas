'use client'

import { Check, X, ArrowLeft, QrCode } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { QRScanner } from '@/components/QRScanner'

export default function ScanResultClient({ name, status, gymId }: { 
  name: string, 
  status: string,
  gymId?: string 
}) {
  const isActive = status === 'active'
  const [scannerOpen, setScannerOpen] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center space-y-6"
      >

        <h1 className="text-2xl font-bold">Résultat du scan</h1>

        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg font-medium text-gray-700">{decodeURIComponent(name)}</p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.2 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className={`rounded-full p-4 ${
              isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isActive ? (
              <Check className="w-12 h-12" />
            ) : (
              <X className="w-12 h-12" />
            )}
          </motion.div>

          <div className={`text-xl font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
            {isActive ? 'Abonnement actif' : 'Abonnement expiré'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* ✅ Bouton Scanner un autre QR Code dans un Dialog */}
          <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
            <DialogTrigger asChild>
              <button
                className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition font-medium"
              >
                Scanner un autre QR Code
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogTitle>Scanner un QR Code</DialogTitle>
              <QRScanner />
            </DialogContent>
          </Dialog>

          {gymId && (
            <Link
              href={`/gyms/${gymId}/dashboard`}
              className="inline-block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition font-medium"
            >
              Retour au tableau de bord
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}

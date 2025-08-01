'use client'

import { Check, X, ArrowLeft, QrCode } from 'lucide-react'
import { motion, Variants } from 'framer-motion'
import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { QRScanner } from '@/components/QRScanner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ScanResultClient({ 
  name, 
  status,
  gymId 
}: { 
  name: string, 
  status: string,
  gymId?: string 
}) {
  const router = useRouter()
  const isActive = status === 'active'
  const [scannerOpen, setScannerOpen] = useState(false)

  // Animation variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300,
        damping: 10 // Added for better spring animation
      }
    }
  }

  const handleNewScan = () => {
    setScannerOpen(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-gray-200"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-center text-gray-800">Résultat du scan</h1>
        </motion.div>

        {/* Member Info */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <p className="text-lg font-medium text-gray-700">{decodeURIComponent(name)}</p>
          {gymId && <p className="text-sm text-gray-500">ID Salle: {gymId}</p>}
        </motion.div>

        {/* Status Indicator */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className={`rounded-full p-4 ${
              isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {isActive ? (
              <Check className="w-10 h-10" strokeWidth={2} />
            ) : (
              <X className="w-10 h-10" strokeWidth={2} />
            )}
          </motion.div>
          <motion.p 
            variants={itemVariants}
            className={`mt-3 text-lg font-semibold ${
              isActive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isActive ? 'Accès autorisé' : 'Accès refusé'}
          </motion.p>
          <motion.p variants={itemVariants} className="text-sm text-gray-500">
            {isActive ? 'Abonnement valide' : 'Abonnement expiré ou invalide'}
          </motion.p>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
            <DialogTrigger asChild>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <QRScanner />
            </DialogContent>
          </Dialog>

          {gymId && (
            <Button
              variant="outline"
              size="lg"
              className="w-full text-black gap-2"
              onClick={() => router.push(`/gyms/${gymId}/dashboard`)}
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au tableau de bord
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
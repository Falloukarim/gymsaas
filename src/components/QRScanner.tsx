'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, RotateCw, Camera } from 'lucide-react'
import { toast } from 'sonner'

type Html5QrcodeError = Error & {
  message: string;
  type?: string;
};

export function QRScanner() {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
  const isProcessing = useRef(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string, label: string }>>([])
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  // Initialisation du scanner
  const initScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const cameras = await Html5Qrcode.getCameras()
      if (cameras.length === 0) throw new Error('Aucune caméra disponible')
      
      setAvailableCameras(cameras)
      return cameras
    } catch (err) {
      const error = err as Html5QrcodeError
      setError(error.message || "Erreur d'accès à la caméra")
      throw error
    }
  }

  // Démarrer le scanner
  const startScanner = async (cameraId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Créer une nouvelle instance à chaque démarrage
      scannerRef.current = new Html5Qrcode('qr-scanner-container')
      
      await scannerRef.current.start(
        cameraId,
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: false
        },
        async (decodedText: string) => {
          if (!isProcessing.current) {
            isProcessing.current = true
            await handleScanSuccess(decodedText)
          }
        },
        () => {}
      )
      
      setIsScanning(true)
      setError(null)
    } catch (err) {
      const error = err as Html5QrcodeError
      setError(error.message || 'Échec du démarrage du scanner')
      setIsScanning(false)
    }
  }

  // Arrêter proprement le scanner
  const stopScanner = async () => {
    if (!scannerRef.current) return
    
    try {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
    } catch (err) {
      console.error("Erreur lors de l'arrêt:", err)
    } finally {
      scannerRef.current = null
      setIsScanning(false)
    }
  }

  // Réinitialiser complètement le scanner
  const resetScanner = async () => {
    await stopScanner()
    isProcessing.current = false
    setScanResult(null)
    setError(null)
    
    if (activeCameraId) {
      await startScanner(activeCameraId)
    }
  }

  // Changer de caméra
  const switchCamera = async () => {
    if (availableCameras.length < 2) return
    
    const currentIndex = availableCameras.findIndex(cam => cam.id === activeCameraId)
    const nextIndex = (currentIndex + 1) % availableCameras.length
    const nextCameraId = availableCameras[nextIndex].id
    
    setActiveCameraId(nextCameraId)
    await resetScanner()
  }

  // Gestion du scan réussi
  const handleScanSuccess = async (decodedText: string) => {
    try {
      setScanResult(decodedText)
      const gymId = window.location.pathname.split('/')[2]
      
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText, gymId })
      })

      const data = await response.json()

      if (data.accessGranted) {
        toast.success(`Accès autorisé pour ${data.member.name}`)
      } else {
        toast.error(`Accès refusé: ${data.reason || 'abonnement expiré'}`)
      }

      await stopScanner()
      router.push(`/scan/${gymId}/result?name=${encodeURIComponent(data.member.name)}&status=${data.subscriptionStatus}`)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Échec de la validation")
      await resetScanner()
    }
  }

  // Initialisation au montage
  useEffect(() => {
    let isMounted = true

    const setup = async () => {
      try {
        const cameras = await initScanner()
        if (isMounted && cameras.length > 0) {
          // Préférer la caméra arrière si disponible
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear')
          ) || cameras[0]
          
          setActiveCameraId(backCamera.id)
          await startScanner(backCamera.id)
        }
      } catch (err) {
        console.error('Erreur initialisation:', err)
      }
    }

    setup()

    return () => {
      isMounted = false
      stopScanner()
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Container du scanner */}
      <div id="qr-scanner-container" className="w-full aspect-video rounded-lg overflow-hidden border bg-black" />

      {/* Contrôles */}
      <div className="flex flex-col gap-2">
        <Button 
          onClick={resetScanner} 
          className="w-full gap-2"
          disabled={isProcessing.current}
        >
          <RotateCw className={`h-4 w-4 ${isProcessing.current ? 'animate-spin' : ''}`} />
          {isScanning ? 'Redémarrer' : 'Activer le scanner'}
        </Button>

        {availableCameras.length > 1 && (
          <Button 
            onClick={switchCamera} 
            className="w-full gap-2"
            disabled={isProcessing.current}
          >
            <Camera className="h-4 w-4" />
            Changer de caméra
          </Button>
        )}
      </div>

      {/* Affichage des états */}
      {error && (
        <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3">
          <X className="h-5 w-5 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {scanResult && (
        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="truncate">QR Code détecté: {scanResult}</p>
        </div>
      )}
    </div>
  )
}
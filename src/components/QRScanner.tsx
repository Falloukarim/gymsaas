'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, RotateCw, Camera } from 'lucide-react'
import { toast } from 'sonner'

type Html5QrcodeError = Error & {
  message: string;
  type?: number;
};

export function QRScanner() {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
  const isProcessing = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string, label: string }>>([])
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isCaptured, setIsCaptured] = useState(false)

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
      
      scannerRef.current = new Html5Qrcode('qr-scanner-container')
      
      await scannerRef.current.start(
        cameraId,
        { 
          fps: 15,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            return { 
              width: Math.min(viewfinderWidth, viewfinderHeight) * 0.7, 
              height: Math.min(viewfinderWidth, viewfinderHeight) * 0.7 
            }
          },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText: string) => {
          if (!isProcessing.current) {
            isProcessing.current = true
            setIsCaptured(true)
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

  // Arrêter proprement
  const stopScanner = async () => {
    if (!scannerRef.current) return
    
    try {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
    } catch (err) {
      console.error("Erreur arrêt:", err)
    } finally {
      scannerRef.current = null
      setIsScanning(false)
      setIsCaptured(false)
    }
  }

  const resetScanner = async () => {
    await stopScanner()
    isProcessing.current = false
    setError(null)
    
    if (activeCameraId) {
      await startScanner(activeCameraId)
    }
  }

  const switchCamera = async () => {
    if (availableCameras.length < 2) return
    
    const currentIndex = availableCameras.findIndex(cam => cam.id === activeCameraId)
    const nextIndex = (currentIndex + 1) % availableCameras.length
    const nextCameraId = availableCameras[nextIndex].id
    
    setActiveCameraId(nextCameraId)
    await resetScanner()
  }

  // Scan réussi
  const handleScanSuccess = async (decodedText: string) => {
    try {
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

  // Initialisation
  useEffect(() => {
    let isMounted = true

    const setup = async () => {
      try {
        const cameras = await initScanner()
        if (isMounted && cameras.length > 0) {
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear')
          ) || cameras[0]
          
          setActiveCameraId(backCamera.id)
          await startScanner(backCamera.id)
        }
      } catch (err) {
        console.error('Erreur init:', err)
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
      {/* Scanner container */}
      <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border bg-black">
        <div id="qr-scanner-container" className="w-full h-full" />

        {/* Cadre de guidage minimaliste */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`border-2 ${isCaptured ? 'border-green-500' : 'border-white/50'} rounded-lg w-64 h-64 relative transition-all duration-300`}>
            
            {/* Animation de capture */}
            {isCaptured && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 rounded-full p-2 animate-pulse">
                  <Check className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/70 p-2">
          Centrez le QR code dans le cadre
        </div>
      </div>

      {/* Boutons de contrôle */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button 
            onClick={resetScanner} 
            variant="default" 
            className="flex-1 gap-2 bg-black text-white hover:bg-gray-800" 
            disabled={isProcessing.current}
            size="sm"
          >
            <RotateCw className={`h-4 w-4 ${isProcessing.current ? 'animate-spin' : ''}`} />
            Redémarrer
          </Button>

          {availableCameras.length > 1 && (
            <Button 
              onClick={switchCamera} 
              variant="default" 
              className="flex-1 gap-2 bg-black text-white hover:bg-gray-800" 
              disabled={isProcessing.current}
              size="sm"
            >
              <Camera className="h-4 w-4" />
              Changer
            </Button>
          )}
        </div>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {isCaptured && !error && (
        <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          QR code détecté
        </div>
      )}
    </div>
  )
}
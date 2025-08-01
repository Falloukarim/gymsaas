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
  const [activeCameraIndex, setActiveCameraIndex] = useState(0)
  const [isScanning, setIsScanning] = useState(false)

  const initScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const cameras = await Html5Qrcode.getCameras()
      if (cameras.length === 0) throw new Error('Aucune caméra disponible')
      setAvailableCameras(cameras)
      return cameras
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      setError(error.message || "Erreur d'accès à la caméra")
      throw error
    }
  }

  const startScan = async (cameraId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-scanner-container')
      }

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
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      setError(error.message || 'Échec du démarrage du scanner')
    }
  }

  const stopScanner = async () => {
    if (!scannerRef.current || !isScanning) return
    
    try {
      await scannerRef.current.stop()
      scannerRef.current = null
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      if (!error.message.includes('not running')) {
        console.error("Erreur lors de l'arrêt du scanner:", error)
      }
    } finally {
      setIsScanning(false)
    }
  }

  const resetScanner = async () => {
    await stopScanner()
    setScanResult(null)
    setError(null)
    isProcessing.current = false
    
    if (availableCameras.length > 0) {
      await startScan(availableCameras[activeCameraIndex].id)
    }
  }

  const switchCamera = async () => {
    const nextIndex = (activeCameraIndex + 1) % availableCameras.length
    setActiveCameraIndex(nextIndex)
    await resetScanner()
  }

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
        toast.error(`Accès refusé: ${data.reason || 'Raison inconnue'}`)
      }

      router.push(`/scan/${gymId}/result?name=${encodeURIComponent(data.member.name)}&status=${data.subscriptionStatus}`)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Échec de la validation")
      await resetScanner()
    }
  }

  useEffect(() => {
    let isMounted = true

    const setupScanner = async () => {
      try {
        const cameras = await initScanner()
        if (isMounted && cameras.length > 0) {
          const backCamIndex = cameras.findIndex(cam =>
            cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('rear')
          )
          const indexToUse = backCamIndex !== -1 ? backCamIndex : 0
          setActiveCameraIndex(indexToUse)
          await startScan(cameras[indexToUse].id)
        }
      } catch (err) {
        console.error('Erreur initialisation:', err)
      }
    }

    setupScanner()

    return () => {
      isMounted = false
      stopScanner()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div id="qr-scanner-container" className="w-full aspect-video rounded-lg overflow-hidden border bg-black" />

      <div className="flex flex-col gap-2">
        <Button onClick={resetScanner} className="w-full gap-2">
          <RotateCw className="h-4 w-4" />
          {isScanning ? 'Redémarrer' : 'Activer le scanner'}
        </Button>

        {availableCameras.length > 1 && (
          <Button onClick={switchCamera} className="w-full gap-2">
            <Camera className="h-4 w-4" />
            Changer de caméra
          </Button>
        )}
      </div>

      {/* Affichage des erreurs et résultats */}
      {error && (
        <div className="p-4 bg-red-50 rounded-lg flex items-center gap-3">
          <X className="h-5 w-5 text-red-600" />
          <p>{error}</p>
        </div>
      )}

      {scanResult && (
        <div className="p-4 bg-green-50 rounded-lg flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="truncate">QR Code détecté : {scanResult}</p>
        </div>
      )}
    </div>
  )
}
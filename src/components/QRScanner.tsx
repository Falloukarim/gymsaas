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
  const lastScannedCode = useRef('')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string, label: string }>>([])
  const [activeCameraIndex, setActiveCameraIndex] = useState(0)
  const [isScanning, setIsScanning] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const initScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const cameras = await Html5Qrcode.getCameras()
      if (cameras.length === 0) throw new Error('Aucune caméra disponible')
      setAvailableCameras(cameras)
      return { Html5Qrcode, cameras }
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      console.error('Erreur initScanner:', error)
      setError(error.message || "Erreur d'accès à la caméra")
      throw error
    }
  }

  const startScan = async (cameraId: string) => {
    if (isTransitioning) return
    setIsTransitioning(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-scanner-container')
      }

      if (!isScanning) {
        await scannerRef.current.start(
          cameraId,
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: false
          },
          (decodedText: string) => {
            if (!isProcessing.current && lastScannedCode.current !== decodedText) {
              isProcessing.current = true
              lastScannedCode.current = decodedText
              handleScanSuccess(decodedText).finally(() => {
                isProcessing.current = false
              })
            }
          },
          (errorMessage: string) => console.log('Scan error:', errorMessage)
        )
        setIsScanning(true)
      }
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      console.error('Erreur startScan:', error)
      setError(error.message || 'Échec du démarrage du scanner')
    } finally {
      setIsTransitioning(false)
    }
  }

  const stopScanner = async () => {
    if (!scannerRef.current || !isScanning) return

    try {
      await scannerRef.current.stop()
      await scannerRef.current.clear()
      scannerRef.current = null
      setIsScanning(false)
    } catch (err: unknown) {
      const error = err as Html5QrcodeError;
      if (!error.message.includes('not running')) {
        console.error("Erreur lors de l'arrêt du scanner:", error)
      }
    }
  }

  const resetScanner = async () => {
    await stopScanner()
    setScanResult(null)
    setError(null)
    lastScannedCode.current = ''
    if (availableCameras.length > 0) {
      await startScan(availableCameras[activeCameraIndex].id)
    }
  }

  const switchCamera = async () => {
    const nextIndex = (activeCameraIndex + 1) % availableCameras.length
    setActiveCameraIndex(nextIndex)
    await resetScanner()
  }

  const testWithMockQR = async () => {
    const mockQR = "zEYxiVGZA_gGGKReu1907"
    console.log("🔍 Test avec QR code mock:", mockQR)
    await handleScanSuccess(mockQR)
  }

  const handleScanSuccess = async (decodedText: string) => {
    try {
      setScanResult(decodedText)
      await stopScanner()

      const gymId = window.location.pathname.split('/')[2]
      if (!gymId) throw new Error("Impossible de déterminer la salle de sport")

      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: decodedText, gymId })
      })

      const data = await response.json()

      if (data.accessGranted) {
        toast.success(`Accès autorisé pour ${data.member.name}`)
      } else {
        toast.error(`Accès refusé: ${data.subscription?.status === 'inactive' ? 'Abonnement inactif' : 'Abonnement expiré'}`)
      }

      router.push(`/scan/${gymId}/result?name=${encodeURIComponent(data.member.name)}&status=${data.subscriptionStatus}`)

    } catch (error) {
      console.error("Erreur complète:", error)
      setError("Échec de la validation du badge")
      if (availableCameras.length > 0) {
        await startScan(availableCameras[activeCameraIndex].id)
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    const setupScanner = async () => {
      try {
        const { Html5Qrcode, cameras } = await initScanner()
        if (isMounted && cameras.length > 0) {
          const backCamIndex = cameras.findIndex(cam =>
            cam.label.toLowerCase().includes('back') || cam.label.toLowerCase().includes('rear')
          )
          const indexToUse = backCamIndex !== -1 ? backCamIndex : 0
          setActiveCameraIndex(indexToUse)
          await startScan(cameras[indexToUse].id)
        }
      } catch (err) {
        console.error('Setup error:', err)
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
        <div className="flex gap-2">
          <Button onClick={resetScanner} className="flex-1 gap-2" disabled={!isScanning || isTransitioning}>
            <RotateCw className="h-4 w-4" />
            Redémarrer
          </Button>

          {availableCameras.length > 1 && (
            <Button onClick={switchCamera} className="flex-1 gap-2" disabled={!isScanning || isTransitioning}>
              <Camera className="h-4 w-4" />
              Changer caméra ({activeCameraIndex + 1}/{availableCameras.length})
            </Button>
          )}
        </div>

        <Button onClick={testWithMockQR} className="w-full gap-2" variant="secondary">
          <span>🔍</span> Tester avec QR code de test
        </Button>
      </div>

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
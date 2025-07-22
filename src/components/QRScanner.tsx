'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, RotateCw, Camera } from 'lucide-react'
import { toast } from 'sonner'

export function QRScanner() {
  const router = useRouter()
  const scannerRef = useRef<any>(null)
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
    } catch (err) {
      console.error('Erreur initScanner:', err)
      setError("Erreur d'accès à la caméra")
      throw err
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
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => handleScanSuccess(decodedText),
          (errorMessage: string) => console.log('Scan error:', errorMessage)
        )
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Erreur startScan:', err)
      setError('Échec du démarrage du scanner')
    } finally {
      setIsTransitioning(false)
    }
  }

  const handleScanSuccess = async (decodedText: string) => {
  try {
    // 1. Récupération du gymId
    const gymId = window.location.pathname.split('/')[2];
    if (!gymId) throw new Error("Impossible de déterminer la salle de sport");

    // 2. Appel API
    const response = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qrCode: decodedText,
        gymId: gymId
      })
    });

    const data = await response.json();
    
    // 3. Gestion des résultats
    if (data.accessGranted) {
      toast.success(`Accès autorisé pour ${data.member.name}`);
    } else {
      toast.error(`Accès refusé: ${data.subscription?.status === 'inactive' ? 'Abonnement inactif' : 'Abonnement expiré'}`);
    }

    // 4. Redirection si nécessaire
// Modifiez la redirection pour inclure le gymId
router.push(`/scan/${gymId}/result?name=${encodeURIComponent(data.member.name)}&status=${data.subscriptionStatus}`);
  } catch (error) {
    console.error("Erreur complète:", error);
    setError("Échec de la validation du badge");
  }
};

  const stopScanner = async () => {
    if (!scannerRef.current || !isScanning) return

    try {
      await scannerRef.current.stop()
      setIsScanning(false)
    } catch (err) {
      if (!err.message.includes('not running')) {
        console.error("Erreur lors de l'arrêt du scanner:", err)
      }
    }
  }

  const resetScanner = async () => {
    await stopScanner()
    setScanResult(null)
    setError(null)
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

  useEffect(() => {
    let isMounted = true

    const setupScanner = async () => {
      try {
        const { Html5Qrcode, cameras } = await initScanner()

        if (isMounted && cameras.length > 0) {
          // 🔍 Cherche caméra arrière
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
      <div
        id="qr-scanner-container"
        className="w-full aspect-video rounded-lg overflow-hidden border bg-black"
      />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetScanner}
            className="flex-1 gap-2"
            disabled={!isScanning || isTransitioning}
          >
            <RotateCw className="h-4 w-4" />
            Redémarrer
          </Button>

          {availableCameras.length > 1 && (
            <Button
              variant="outline"
              onClick={switchCamera}
              className="flex-1 gap-2"
              disabled={!isScanning || isTransitioning}
            >
              <Camera className="h-4 w-4" />
              Changer caméra ({activeCameraIndex + 1}/{availableCameras.length})
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={testWithMockQR}
          className="w-full gap-2"
        >
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

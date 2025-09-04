'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, RotateCw, Camera, ZoomIn, ZoomOut, Scan } from 'lucide-react'
import { toast } from 'sonner'

type Html5QrcodeError = Error & {
  message: string;
  type?: number;
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
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isCaptured, setIsCaptured] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [captureStage, setCaptureStage] = useState(0)

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

  // Démarrer le scanner avec une zone de scan plus grande
  const startScanner = async (cameraId: string) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Créer une nouvelle instance à chaque démarrage
      scannerRef.current = new Html5Qrcode('qr-scanner-container')
      
      await scannerRef.current.start(
        cameraId,
        { 
          fps: 15,
          // Zone de scan beaucoup plus grande - presque toute la vue
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            // Utiliser 95% de la largeur et 80% de la hauteur
            return { 
              width: viewfinderWidth * 0.95, 
              height: viewfinderHeight * 0.80 
            }
          },
          aspectRatio: 1.0,
          disableFlip: false,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        async (decodedText: string) => {
          if (!isProcessing.current) {
            isProcessing.current = true
            
            // Simulation de capture complète
            for (let stage = 1; stage <= 5; stage++) {
              setCaptureStage(stage)
              await new Promise(resolve => setTimeout(resolve, 150))
            }
            
            // Progression animée
            for (let i = 0; i <= 100; i += 20) {
              setScanProgress(i)
              await new Promise(resolve => setTimeout(resolve, 50))
            }
            
            setIsCaptured(true)
            await handleScanSuccess(decodedText)
          }
        },
        () => {
          setScanProgress(0)
          setCaptureStage(0)
        }
      )
      
      setIsScanning(true)
      setError(null)
    } catch (err) {
      const error = err as Html5QrcodeError
      setError(error.message || 'Échec du démarrage du scanner')
      setIsScanning(false)
    }
  }

  // Zoom in/out
  const zoomIn = () => {
    if (scannerRef.current && zoomLevel < 3) {
      const newZoom = Math.min(zoomLevel + 0.2, 3)
      setZoomLevel(newZoom)
      scannerRef.current.applyVideoConstraints({
        advanced: [{ zoom: newZoom }]
      }).catch(() => console.log("Zoom non supporté"))
    }
  }

  const zoomOut = () => {
    if (scannerRef.current && zoomLevel > 1) {
      const newZoom = Math.max(zoomLevel - 0.2, 1)
      setZoomLevel(newZoom)
      scannerRef.current.applyVideoConstraints({
        advanced: [{ zoom: newZoom }]
      }).catch(() => console.log("Zoom non supporté"))
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
      setScanProgress(0)
      setCaptureStage(0)
    }
  }

  const resetScanner = async () => {
    await stopScanner()
    isProcessing.current = false
    setScanResult(null)
    setError(null)
    setZoomLevel(1)
    
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
      setScanResult(decodedText)
      const gymId = window.location.pathname.split('/')[2]
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
      {/* Scanner container avec cadre plus grand */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-black">
        <div id="qr-scanner-container" className="w-full h-full" />

        {/* Cadre de guidage - beaucoup plus grand */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`border-2 ${isCaptured ? 'border-green-500' : 'border-blue-400'} rounded-lg w-11/12 h-5/6 relative transition-all duration-300`}>
            
            {/* Ligne de balayage horizontale */}
            <div 
              className="absolute left-0 right-0 h-1 bg-green-400 rounded-full"
              style={{ 
                top: `${scanProgress}%`,
                opacity: 0.8,
                boxShadow: '0 0 10px 2px rgba(72, 187, 120, 0.7)',
                transition: 'top 0.1s ease'
              }}
            ></div>
            
            {/* Ligne de balayage verticale */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-green-400 rounded-full"
              style={{ 
                left: `${scanProgress}%`,
                opacity: 0.8,
                boxShadow: '0 0 10px 2px rgba(72, 187, 120, 0.7)',
                transition: 'left 0.1s ease'
              }}
            ></div>
            
            {/* Points de repère aux coins */}
            <div className={`absolute -top-2 -left-2 h-5 w-5 border-t-2 border-l-2 ${isCaptured ? 'border-green-500' : 'border-white'} rounded-tl transition-colors duration-300`}></div>
            <div className={`absolute -top-2 -right-2 h-5 w-5 border-t-2 border-r-2 ${isCaptured ? 'border-green-500' : 'border-white'} rounded-tr transition-colors duration-300`}></div>
            <div className={`absolute -bottom-2 -left-2 h-5 w-5 border-b-2 border-l-2 ${isCaptured ? 'border-green-500' : 'border-white'} rounded-bl transition-colors duration-300`}></div>
            <div className={`absolute -bottom-2 -right-2 h-5 w-5 border-b-2 border-r-2 ${isCaptured ? 'border-green-500' : 'border-white'} rounded-br transition-colors duration-300`}></div>
            
            {/* Effet de capture complète */}
            {isCaptured && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center rounded-lg">
                <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-green-500 rounded-full p-3 mb-2">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                    QR Code capturé avec succès!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black bg-opacity-50 p-2">
          {isCaptured 
            ? 'Traitement en cours...' 
            : 'Placez le QR code n\'importe où dans le cadre'
          }
        </div>

        {/* Progression */}
        {scanProgress > 0 && scanProgress < 100 && (
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs flex items-center">
              <Scan className="h-3 w-3 mr-1 animate-pulse" />
              Analyse: {scanProgress}%
            </div>
          </div>
        )}
      </div>

      {/* Boutons */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={resetScanner} className="flex-1 gap-2" disabled={isProcessing.current}>
            <RotateCw className={`h-4 w-4 ${isProcessing.current ? 'animate-spin' : ''}`} />
            {isScanning ? 'Redémarrer' : 'Activer le scanner'}
          </Button>

          {availableCameras.length > 1 && (
            <Button onClick={switchCamera} className="flex-1 gap-2" disabled={isProcessing.current}>
              <Camera className="h-4 w-4" />
              Caméra
            </Button>
          )}
        </div>

        {/* Zoom */}
        <div className="flex gap-2">
          <Button onClick={zoomOut} className="flex-1 gap-2" disabled={!isScanning || zoomLevel <= 1}>
            <ZoomOut className="h-4 w-4" />
            Zoom -
          </Button>
          <Button onClick={zoomIn} className="flex-1 gap-2" disabled={!isScanning || zoomLevel >= 3}>
            <ZoomIn className="h-4 w-4" />
            Zoom +
          </Button>
        </div>
      </div>

      {/* États */}
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
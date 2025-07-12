'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeGenerator({ 
  value, 
  size = 160, 
  className = ''
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current, 
      value, 
      {
        width: size,
        margin: 2,
        color: { 
          dark: '#000000', // Noir pur
          light: '#ffffff' // Blanc pur
        },
      },
      (error) => {
        if (error) console.error('QR generation error:', error);
      }
    );
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={size} 
      height={size} 
      className={`border border-gray-200 rounded-lg bg-white ${className}`}
    />
  );
}
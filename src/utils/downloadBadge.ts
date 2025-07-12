'use client';

import QRCode from 'qrcode';

export async function downloadMemberBadge(member: any) {
  try {
    // 1. Création du canvas final
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Contexte canvas non disponible');
    
    // Dimensions du badge
    canvas.width = 320;
    canvas.height = 480;
    
    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Dessin de l'en-tête
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    
    ctx.fillStyle = gradient;
    ctx.roundRect(20, 20, 280, 100, 8);
    ctx.fill();

    // Texte du nom
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(member.full_name, canvas.width / 2, 60);

    // Texte du gym
    ctx.font = '14px sans-serif';
    ctx.fillText(member.gyms?.name || '', canvas.width / 2, 80);

    // 3. Génération du QR Code
    const qrSize = 160;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, member.qr_code, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    // Positionnement du QR Code
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = 140;
    ctx.drawImage(qrCanvas, qrX, qrY);

    // 4. Texte d'ID
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ID: ${member.id.slice(0, 8).toUpperCase()}`, canvas.width / 2, qrY + qrSize + 20);

    // 5. Téléchargement
    const link = document.createElement('a');
    link.download = `badge-${member.full_name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

  } catch (error) {
    console.error('Erreur génération badge:', error);
    throw new Error('Échec de la génération du badge');
  }
}
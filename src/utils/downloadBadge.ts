'use client';

import QRCode from 'qrcode';

interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  qr_code: string;
  gyms?: {
    name: string;
    logo_url?: string;
  };
  member_subscriptions?: Array<{
    end_date: string;
    subscriptions?: {
      type?: string;
    };
  }>;
}

interface BadgeConfig {
  dimensions: {
    width: number;
    height: number;
  };
  card: {
    padding: number;
    radius: number;
  };
  colors: {
    backgroundGradient: [string, string, string];
    sidePanel: [string, string];
    textDark: string;
    textMedium: string;
    textLight: string;
    accent: string;
    white: string;
    photoBorder: string;
  };
}

const BADGE_CONFIG: BadgeConfig = {
  dimensions: {
    width: 900,
    height: 540
  },
  card: {
    padding: 30,
    radius: 16
  },
  colors: {
    backgroundGradient: ['#e0f7fa', '#b2ebf2', '#80deea'],
    sidePanel: ['#006064', '#00acc1'],
    textDark: '#263238',
    textMedium: '#546e7a',
    textLight: '#90a4ae',
    accent: '#00bcd4',
    white: '#ffffff',
    photoBorder: '#b0bec5'
  }
};

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Échec du chargement de l'image: ${url}`));
    img.src = url;
  });
}

async function generateQRCode(text: string, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    color: {
      dark: '#000000', // Noir pour un meilleur contraste
      light: '#ffffff' // Fond blanc pour le QR code
    }
  });
  return canvas;
}

export async function downloadMemberBadge(member: Member, gymLogoUrl?: string): Promise<void> {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Contexte canvas non disponible');

    // Configuration dimensions
    canvas.width = BADGE_CONFIG.dimensions.width;
    canvas.height = BADGE_CONFIG.dimensions.height;

    // Dimensions de la carte
    const card = {
      width: canvas.width - (BADGE_CONFIG.card.padding * 2),
      height: canvas.height - (BADGE_CONFIG.card.padding * 2),
      x: BADGE_CONFIG.card.padding,
      y: BADGE_CONFIG.card.padding,
      radius: BADGE_CONFIG.card.radius
    };

    // 1. Fond blanc
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Carte principale avec ombre douce
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.roundRect(card.x, card.y, card.width, card.height, card.radius);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // 3. Bande bleue en haut
    const topPanelHeight = 80;
    const topPanelGradient = ctx.createLinearGradient(0, card.y, 0, card.y + topPanelHeight);
    topPanelGradient.addColorStop(0, BADGE_CONFIG.colors.sidePanel[0]);
    topPanelGradient.addColorStop(1, BADGE_CONFIG.colors.sidePanel[1]);

    ctx.fillStyle = topPanelGradient;
    ctx.roundRect(
      card.x,
      card.y,
      card.width,
      topPanelHeight,
      [card.radius, card.radius, 0, 0]
    );
    ctx.fill();

    // 4. Nom du gym (remplace VISA)
    if (member.gyms?.name) {
      ctx.fillStyle = BADGE_CONFIG.colors.white;
      ctx.font = 'bold 24px "Poppins", sans-serif';
      ctx.textAlign = 'right';
      // On tronque le nom si trop long pour éviter le débordement
      const gymName = member.gyms.name.length > 20 
        ? member.gyms.name.substring(0, 17) + '...' 
        : member.gyms.name;
      ctx.fillText(gymName.toUpperCase(), card.x + card.width - 40, card.y + topPanelHeight / 2 + 10);
    }

    // 5. Numéro de carte (ID du membre)
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(member.id.replace(/-/g, '').substring(0, 16).toUpperCase(), card.x + 40, card.y + topPanelHeight / 2 + 10);

    // 6. Photo du membre
    const photoSize = 140;
    const photoX = card.x + 40;
    const photoY = card.y + topPanelHeight + 40;

    // Cadre photo avec ombre
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoSize, photoSize, 12);
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.fill();
    ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowColor = 'transparent';

    if (!member.avatar_url) {
      // Initiales si pas de photo
      ctx.fillStyle = BADGE_CONFIG.colors.accent;
      ctx.font = 'bold 48px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = member.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      ctx.fillText(initials, photoX + photoSize / 2, photoY + photoSize / 2);
    } else {
      try {
        const avatar = await loadImage(member.avatar_url);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, photoY, photoSize, photoSize, 12);
        ctx.clip();
        ctx.drawImage(avatar, photoX, photoY, photoSize, photoSize);
        ctx.restore();
      } catch (err) {
        console.error('Erreur chargement photo:', err);
      }
    }

    // 7. Nom du membre (en majuscules)
    const textX = photoX + photoSize + 30;
    const textY = photoY + 40;

    ctx.fillStyle = BADGE_CONFIG.colors.textDark;
    ctx.font = '700 36px "Poppins", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(member.full_name.toUpperCase(), textX, textY);

    // 8. Date d'expiration
    const activeSub = member.member_subscriptions?.find(
      sub => new Date(sub.end_date) > new Date()
    );
    if (activeSub) {
      ctx.fillStyle = BADGE_CONFIG.colors.textMedium;
      ctx.font = '500 22px "Poppins", sans-serif';
      const expiryDate = new Date(activeSub.end_date);
      const formattedDate = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${String(expiryDate.getFullYear()).slice(-2)}`;
      ctx.fillText(`EXPIRY ${formattedDate}`, textX, textY + 50);
    }

    // 9. QR Code plus visible avec cadre blanc
    const qrSize = 150; // Taille augmentée
    const qrX = card.x + card.width - qrSize - 40;
    const qrY = card.y + card.height - qrSize - 40;

    // Fond blanc pour le QR code
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 8);
    ctx.fill();
    ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    const qrCanvas = await generateQRCode(member.qr_code, qrSize);
    ctx.drawImage(qrCanvas, qrX, qrY);

    // 10. Logo du gym en bas à gauche
    if (gymLogoUrl) {
      try {
        const logoSize = 60;
        const logoX = card.x + 40;
        const logoY = card.y + card.height - logoSize - 30;

        const logoImg = await loadImage(gymLogoUrl);
        // Cadre rond pour le logo
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
        ctx.fillStyle = BADGE_CONFIG.colors.white;
        ctx.fill();
        ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 - 1, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch (error) {
        console.error('Erreur chargement logo:', error);
      }
    }

    // Téléchargement
    const link = document.createElement('a');
    link.download = `badge-${member.full_name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

  } catch (error) {
    console.error('Erreur génération badge:', error);
    throw new Error('Échec de la génération du badge');
  }
}
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

// Nouvelle configuration design tendance
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
    backgroundGradient: ['#e0f7fa', '#b2ebf2', '#80deea'], // dégradé pastel
    sidePanel: ['#006064', '#00acc1'], // couleurs tendance
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
      dark: '#343a40',
      light: '#00000000'
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

    // 1. Fond avec dégradé pastel
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, BADGE_CONFIG.colors.backgroundGradient[0]);
    bgGradient.addColorStop(0.5, BADGE_CONFIG.colors.backgroundGradient[1]);
    bgGradient.addColorStop(1, BADGE_CONFIG.colors.backgroundGradient[2]);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Carte principale avec ombre douce
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.roundRect(card.x, card.y, card.width, card.height, card.radius);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // 3. Bande latérale dégradée
    const sidePanelWidth = 36;
    const sidePanelGradient = ctx.createLinearGradient(0, card.y, 0, card.y + card.height);
    sidePanelGradient.addColorStop(0, BADGE_CONFIG.colors.sidePanel[0]);
    sidePanelGradient.addColorStop(1, BADGE_CONFIG.colors.sidePanel[1]);

    ctx.fillStyle = sidePanelGradient;
    ctx.roundRect(
      card.x,
      card.y,
      sidePanelWidth,
      card.height,
      [card.radius, 0, 0, card.radius]
    );
    ctx.fill();

    // 4. Logo du gym
    if (gymLogoUrl) {
      try {
        const logoSize = 90;
        const logoX = card.x + card.width - logoSize - 40;
        const logoY = card.y + 40;

        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = BADGE_CONFIG.colors.white;
        ctx.fill();
        ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 - 3, 0, Math.PI * 2);
        ctx.clip();

        const logoImg = await loadImage(gymLogoUrl);
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      } catch (error) {
        console.error('Erreur chargement logo:', error);
      }
    }

    // 5. Photo du membre
    const photoSize = 140;
    const photoX = card.x + 60;
    const photoY = card.y + (card.height - photoSize) / 2;
    const photoBorderWidth = 2;

    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoSize, photoSize, 12);
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.fill();
    ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
    ctx.lineWidth = photoBorderWidth;
    ctx.stroke();

    if (!member.avatar_url) {
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
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, (photoSize - 4) / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, photoX, photoY, photoSize, photoSize);
        ctx.restore();
      } catch (err) {
        console.error('Erreur chargement photo:', err);
      }
    }

    // 6. Zone texte (nom, gym)
    const textX = photoX + photoSize + 50;
    const textY = photoY + 50;
    const lineHeight = 40;

    // Nom
    ctx.fillStyle = BADGE_CONFIG.colors.textDark;
    ctx.font = '700 36px "Poppins", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 2;
    ctx.fillText(member.full_name, textX, textY);
    ctx.shadowColor = 'transparent';

    // Gym
    ctx.fillStyle = BADGE_CONFIG.colors.textMedium;
    ctx.font = '500 22px "Poppins", sans-serif';
    ctx.fillText(member.gyms?.name || '', textX, textY + lineHeight);

    // 7. Badge d'abonnement
    const activeSub = member.member_subscriptions?.find(
      sub => new Date(sub.end_date) > new Date()
    );
    if (activeSub) {
      const badgeWidth = 200;
      const badgeHeight = 42;
      const badgeY = textY + lineHeight * 1.8;

      ctx.fillStyle = BADGE_CONFIG.colors.white;
      ctx.roundRect(textX, badgeY, badgeWidth, badgeHeight, 21);
      ctx.fill();

      ctx.strokeStyle = BADGE_CONFIG.colors.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = BADGE_CONFIG.colors.accent;
      ctx.font = 'bold 16px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        activeSub.subscriptions?.type?.toUpperCase() || 'MEMBRE',
        textX + badgeWidth / 2,
        badgeY + badgeHeight / 2
      );

      // Date expiration
      ctx.fillStyle = BADGE_CONFIG.colors.textLight;
      ctx.font = '500 16px "Poppins", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(
        `Valide jusqu'au ${new Date(activeSub.end_date).toLocaleDateString('fr-FR')}`,
        textX,
        badgeY + badgeHeight + 25
      );
    }

    // 8. QR Code
    const qrSize = 130;
    const qrX = card.x + card.width - qrSize - 50;
    const qrY = card.y + card.height - qrSize - 40;

    const qrCanvas = await generateQRCode(member.qr_code, qrSize);
    ctx.drawImage(qrCanvas, qrX, qrY);

    // ID membre
    ctx.fillStyle = BADGE_CONFIG.colors.textLight;
    ctx.font = '500 13px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ID: ${member.id.slice(0, 8).toUpperCase()}`, qrX + qrSize / 2, qrY + qrSize + 18);

    // 9. Texte vertical (drapeau)
    ctx.save();
    ctx.translate(card.x + 20, card.y + card.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.font = '700 20px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MEMBRE PRIVILÈGE', 0, 0);
    ctx.restore();

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

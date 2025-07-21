'use client';

import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

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
  dimensions: { width: 900, height: 540 },
  card: { padding: 30, radius: 16 },
  colors: {
    backgroundGradient: ['#e0f7fa', '#b2ebf2', '#80deea'],
    sidePanel: ['#006064', '#00acc1'],
    textDark: '#263238',
    textMedium: '#546e7a',
    textLight: '#90a4ae',
    accent: '#00bcd4',
    white: '#ffffff',
    photoBorder: '#b0bec5',
  },
};

async function loadImageSecure(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      reject(new Error(`Timeout après 5s pour: ${url}`));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      if (img.width > 0) resolve(img);
      else reject(new Error('Image vide'));
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Erreur chargement image: ${url}`));
    };

    img.src = url;
  });
}

function drawMemberInitials(
  ctx: CanvasRenderingContext2D,
  fullName: string,
  x: number,
  y: number,
  size: number
) {
  ctx.fillStyle = BADGE_CONFIG.colors.accent;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.35}px "Poppins", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  ctx.fillText(initials, x + size / 2, y + size / 2);
}

async function generateQRCode(text: string, size: number): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
  return canvas;
}

export async function downloadMemberBadge(member: Member): Promise<void> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas non disponible');

  canvas.width = BADGE_CONFIG.dimensions.width;
  canvas.height = BADGE_CONFIG.dimensions.height;

  const card = {
    x: BADGE_CONFIG.card.padding,
    y: BADGE_CONFIG.card.padding,
    width: canvas.width - BADGE_CONFIG.card.padding * 2,
    height: canvas.height - BADGE_CONFIG.card.padding * 2,
    radius: BADGE_CONFIG.card.radius,
  };

  // Fond
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carte
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.roundRect(card.x, card.y, card.width, card.height, card.radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Bande supérieure
  const topPanelHeight = 80;
  const topPanelGradient = ctx.createLinearGradient(0, card.y, 0, card.y + topPanelHeight);
  topPanelGradient.addColorStop(0, BADGE_CONFIG.colors.sidePanel[0]);
  topPanelGradient.addColorStop(1, BADGE_CONFIG.colors.sidePanel[1]);

  ctx.fillStyle = topPanelGradient;
  ctx.roundRect(card.x, card.y, card.width, topPanelHeight, [card.radius, card.radius, 0, 0]);
  ctx.fill();

  // Nom du gym
  if (member.gyms?.name) {
    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.font = 'bold 24px "Poppins", sans-serif';
    ctx.textAlign = 'right';
    const gymName = member.gyms.name.length > 20 ? member.gyms.name.slice(0, 17) + '...' : member.gyms.name;
    ctx.fillText(gymName.toUpperCase(), card.x + card.width - 40, card.y + topPanelHeight / 2 + 10);
  }

  // ID du membre
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.font = 'bold 24px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    member.id.replace(/-/g, '').substring(0, 16).toUpperCase(),
    card.x + 40,
    card.y + topPanelHeight / 2 + 10
  );

  // Avatar
  const photoSize = 140;
  const photoX = card.x + 40;
  const photoY = card.y + topPanelHeight + 40;
  let avatarDisplayed = false;

  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoSize, photoSize, 12);
  ctx.strokeStyle = BADGE_CONFIG.colors.photoBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (member.avatar_url) {
    try {
      const avatarPath = member.avatar_url.includes('public/avatars/')
        ? member.avatar_url.split('public/avatars/')[1]
        : member.avatar_url;

      const { data: { signedUrl }, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(avatarPath, 3600);

      if (error || !signedUrl) throw error || new Error('Échec URL signée');

      const img = await loadImageSecure(signedUrl);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = photoSize;
      tempCanvas.height = photoSize;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('tempCtx manquant');

      const ratio = Math.min(photoSize / img.width, photoSize / img.height);
      const dx = (photoSize - img.width * ratio) / 2;
      const dy = (photoSize - img.height * ratio) / 2;

      tempCtx.drawImage(img, 0, 0, img.width, img.height, dx, dy, img.width * ratio, img.height * ratio);
      tempCtx.globalCompositeOperation = 'destination-in';
      tempCtx.beginPath();
      tempCtx.roundRect(0, 0, photoSize, photoSize, 12);
      tempCtx.fill();

      ctx.drawImage(tempCanvas, photoX, photoY);
      avatarDisplayed = true;
    } catch (err) {
      console.warn('Erreur avatar:', err);
    }
  }

  if (!avatarDisplayed) {
    drawMemberInitials(ctx, member.full_name, photoX, photoY, photoSize);
  }

  // === NOM DU MEMBRE ===
  ctx.fillStyle = BADGE_CONFIG.colors.textDark;
  ctx.font = 'bold 28px "Poppins", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(member.full_name, photoX, photoY + photoSize + 40);

  // === QR CODE ===
  const qrCanvas = await generateQRCode(member.qr_code, 120);
  const qrX = card.x + card.width - 120 - 40;
  const qrY = card.y + card.height - 120 - 40;
  ctx.drawImage(qrCanvas, qrX, qrY);

  // === TÉLÉCHARGEMENT ===
  const link = document.createElement('a');
  link.download = `badge-${member.full_name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

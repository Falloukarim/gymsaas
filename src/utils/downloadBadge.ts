'use client';

import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Member {
  id: string;
  full_name: string;
  avatar_url?: string;
  qr_code: string;
  gyms?: {
    name: string;
    logo_url?: string;
  };
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
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    textDark: string;
    textMedium: string;
    textLight: string;
    white: string;
    black: string;
  };
  fonts: {
    title: string;
    subtitle: string;
    body: string;
    code: string;
  };
}

const BADGE_CONFIG: BadgeConfig = {
  dimensions: { width: 900, height: 540 },
  card: { padding: 30, radius: 24 },
colors: {
  primary: '#065f46',        // Vert foncé
  primaryDark: '#064e3b',    // Vert plus profond
  secondary: '#047857',      // Vert moyen
  accent: '#10b981',         // Vert clair
  background: '#ecfdf5',     // Très pâle, presque blanc-vert
  textDark: '#f0fdf4',       // Texte clair (presque blanc)
  textMedium: '#d1fae5',
  textLight: '#a7f3d0',
  white: '#ffffff',
  black: '#000000',
},
  fonts: {
    title: 'bold 28px "Poppins", sans-serif',
    subtitle: '600 20px "Poppins", sans-serif',
    body: '500 16px "Inter", sans-serif',
    code: 'bold 18px "Courier New", monospace',
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
  // Fond circulaire avec dégradé
  const gradient = ctx.createRadialGradient(
    x + size / 2,
    y + size / 2,
    size * 0.2,
    x + size / 2,
    y + size / 2,
    size / 2
  );
  gradient.addColorStop(0, BADGE_CONFIG.colors.primary);
  gradient.addColorStop(1, BADGE_CONFIG.colors.primaryDark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Initiales
  ctx.fillStyle = BADGE_CONFIG.colors.white;
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
      dark: BADGE_CONFIG.colors.primaryDark,
      light: BADGE_CONFIG.colors.white,
    },
  });
  return canvas;
}

function drawRoundedPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  gradient: CanvasGradient
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.fillStyle = gradient;
  ctx.fill();
}

export async function downloadMemberBadge(member: Member, logo_url: any): Promise<void> {
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

  // Fond avec texture subtile
  ctx.fillStyle = BADGE_CONFIG.colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carte principale avec ombre portée
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.roundRect(card.x, card.y, card.width, card.height, card.radius);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Bande supérieure avec dégradé
  const headerHeight = 100;
const headerGradient = ctx.createRadialGradient(
  card.x + card.width / 2, // centre X
  card.y + headerHeight / 2, // centre Y
  20,
  card.x + card.width / 2,
  card.y + headerHeight / 2,
  200
);
headerGradient.addColorStop(0, BADGE_CONFIG.colors.accent);       // centre clair
headerGradient.addColorStop(1, BADGE_CONFIG.colors.primaryDark);  // extérieur foncé


  ctx.fillStyle = headerGradient;
  ctx.roundRect(card.x, card.y, card.width, headerHeight, [
    card.radius,
    card.radius,
    0,
    0,
  ]);
  ctx.fill();

  // Logo du gym (si disponible)
  if (member.gyms?.logo_url) {
    try {
      const logoSize = 60;
      const logoX = card.x + 30;
      const logoY = card.y + headerHeight / 2 - logoSize / 2;

      const img = await loadImageSecure(member.gyms.logo_url);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = logoSize;
      tempCanvas.height = logoSize;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('tempCtx manquant');

      tempCtx.beginPath();
      tempCtx.arc(logoSize / 2, logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      tempCtx.closePath();
      tempCtx.clip();

      const ratio = Math.min(logoSize / img.width, logoSize / img.height);
      const dx = (logoSize - img.width * ratio) / 2;
      const dy = (logoSize - img.height * ratio) / 2;

      tempCtx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        dx,
        dy,
        img.width * ratio,
        img.height * ratio
      );

      ctx.drawImage(tempCanvas, logoX, logoY);
    } catch (err) {
      console.warn('Erreur logo gym:', err);
    }
  }

  // Nom du gym
  if (member.gyms?.name) {
    const gymName = member.gyms.name.length > 24 
      ? member.gyms.name.substring(0, 21) + '...' 
      : member.gyms.name;

    const gymNameWidth = ctx.measureText(gymName).width + 40;
    const gymNameX = card.x + card.width - gymNameWidth - 30;
    const gymNameY = card.y + headerHeight / 2 - 20;

    const gymNameGradient = ctx.createLinearGradient(
      gymNameX,
      gymNameY,
      gymNameX + gymNameWidth,
      gymNameY + 40
    );
    gymNameGradient.addColorStop(0, BADGE_CONFIG.colors.secondary);
    gymNameGradient.addColorStop(1, BADGE_CONFIG.colors.accent);

    ctx.beginPath();
    ctx.roundRect(gymNameX, gymNameY, gymNameWidth, 40, 20);
    ctx.fillStyle = gymNameGradient;
    ctx.fill();

    ctx.fillStyle = BADGE_CONFIG.colors.white;
    ctx.font = BADGE_CONFIG.fonts.subtitle;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      gymName.toUpperCase(),
      gymNameX + gymNameWidth / 2,
      gymNameY + 20
    );
  }

  // ID du membre
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.font = BADGE_CONFIG.fonts.code;
  ctx.textAlign = 'left';
  ctx.fillText(
    `ID: ${member.id.replace(/-/g, '').substring(0, 8).toUpperCase()}`,
    card.x + 30,
    card.y + headerHeight - 15
  );

  // Section principale du badge
  const mainContentY = card.y + headerHeight + 40;

  // Photo/avatar du membre
  const photoSize = 160;
  const photoX = card.x + 50;
  const photoY = mainContentY;
  let avatarDisplayed = false;

  // Cadre photo avec ombre
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoSize, photoSize, 16);
  ctx.fillStyle = BADGE_CONFIG.colors.white;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Bordure photo
  ctx.strokeStyle = BADGE_CONFIG.colors.accent;
  ctx.lineWidth = 3;
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

      tempCtx.beginPath();
      tempCtx.roundRect(0, 0, photoSize, photoSize, 16);
      tempCtx.closePath();
      tempCtx.clip();

      const ratio = Math.min(photoSize / img.width, photoSize / img.height);
      const dx = (photoSize - img.width * ratio) / 2;
      const dy = (photoSize - img.height * ratio) / 2;

      tempCtx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        dx,
        dy,
        img.width * ratio,
        img.height * ratio
      );

      ctx.drawImage(tempCanvas, photoX, photoY);
      avatarDisplayed = true;
    } catch (err) {
      console.warn('Erreur avatar:', err);
    }
  }

  if (!avatarDisplayed) {
    drawMemberInitials(ctx, member.full_name, photoX, photoY, photoSize);
  }

  // Informations du membre
  const infoX = photoX + photoSize + 40;
  const infoY = photoY;

  // Nom complet
  ctx.fillStyle = BADGE_CONFIG.colors.textDark;
  ctx.font = BADGE_CONFIG.fonts.title;
  ctx.textAlign = 'left';
  ctx.fillText(member.full_name, infoX, infoY + 30);

  // Type de membre
  ctx.fillStyle = BADGE_CONFIG.colors.textMedium;
  ctx.font = BADGE_CONFIG.fonts.body;
  ctx.fillText('Membre Abonné', infoX, infoY + 70);

  // QR Code
  const qrSize = 200;
  const qrX = card.x + card.width - qrSize - 30;
  const qrY = card.y + card.height - qrSize - 30;

  // Cadre QR Code avec ombre et fond clair
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.beginPath();
  ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Génération et dessin du QR
  const qrCanvas = await generateQRCode(member.qr_code, qrSize);
  ctx.drawImage(qrCanvas, qrX, qrY);

  // Texte en dessous
  ctx.fillStyle = BADGE_CONFIG.colors.textMedium;
  ctx.font = '600 16px "Poppins", sans-serif';
  ctx.textAlign = 'center';

  // Pied de page
  const footerY = card.y + card.height - 20;
  ctx.fillStyle = BADGE_CONFIG.colors.textLight;
  ctx.font = '400 12px "Poppins", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Badge généré le ${format(new Date(), 'dd/MM/yyyy')}`,
    card.x + card.width / 2,
    footerY
  );

  // Téléchargement
  const link = document.createElement('a');
  link.download = `badge-${member.full_name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}
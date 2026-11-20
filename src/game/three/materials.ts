import * as THREE from 'three';

let cachedAnisotropy = 4;

export function setTextureAnisotropy(maxAnisotropy: number) {
  cachedAnisotropy = Math.max(1, Math.min(8, maxAnisotropy));
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = cachedAnisotropy;
  texture.generateMipmaps = true;
  if (repeatX !== 1 || repeatY !== 1) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
  }
  return texture;
}

// Crisp Bengali signboard texture (supports bright neon border + dark contrast)
export function createBengaliSignTexture(
  text: string,
  subtext: string,
  bgColor: string,
  textColor: string,
  borderColor = '#facc15'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 160);
  grad.addColorStop(0, bgColor);
  grad.addColorStop(1, '#090d1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer neon trim
  ctx.lineWidth = 8;
  ctx.strokeStyle = borderColor;
  ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

  // Main Bengali Title
  ctx.fillStyle = textColor;
  ctx.font = 'bold 34px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillText(text, canvas.width / 2, 60);

  // Subtext
  ctx.shadowBlur = 0;
  ctx.font = 'bold 19px "Hind Siliguri", "Noto Sans Bengali", sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText(subtext, canvas.width / 2, 114);

  return finalizeTexture(canvas);
}

// Multi-story Dhaka urban facade texture (brick/stucco + lit/unlit windows + shop shutter)
export function createBuildingFacadeTexture(
  wallColor: string,
  trimColor: string,
  floors = 3,
  groundShutter = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base plaster / brick color
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, 256, 512);

  // Subtle horizontal concrete bands per floor
  const floorH = 512 / floors;
  for (let f = 0; f < floors; f++) {
    const yTop = f * floorH;
    // Floor cornice / weathering
    ctx.fillStyle = trimColor;
    ctx.fillRect(0, yTop, 256, 8);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, yTop + 8, 256, 6);

    const isGround = f === floors - 1;
    if (isGround && groundShutter) {
      // Ground floor rolling metal shutter
      ctx.fillStyle = '#334155';
      ctx.fillRect(18, yTop + 20, 220, floorH - 24);
      ctx.fillStyle = '#475569';
      for (let sy = yTop + 26; sy < yTop + floorH - 8; sy += 10) {
        ctx.fillRect(20, sy, 216, 4);
      }
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 4;
      ctx.strokeRect(18, yTop + 20, 220, floorH - 24);
    } else {
      // 3 Apartment / Office windows per floor
      const winW = 48;
      const winH = floorH * 0.52;
      const winY = yTop + floorH * 0.24;
      for (let w = 0; w < 3; w++) {
        const winX = 24 + w * 78;
        const isLit = (f + w) % 2 === 0;
        // Frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(winX - 4, winY - 4, winW + 8, winH + 8);
        // Glass
        ctx.fillStyle = isLit ? '#fef08a' : '#1e3a5f';
        ctx.fillRect(winX, winY, winW, winH);
        // Window grille bars (গ্রিল)
        ctx.fillStyle = 'rgba(15,23,42,0.55)';
        ctx.fillRect(winX + winW / 2 - 1, winY, 2, winH);
        ctx.fillRect(winX, winY + winH / 2 - 1, winW, 2);
      }
    }
  }

  return finalizeTexture(canvas);
}

// Footpath / sidewalk cream & terracotta interlocking tile texture (Dhaka footpath)
export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155'; // Dark mortar lines
  ctx.fillRect(0, 0, 256, 256);

  const brickW = 32;
  const brickH = 16;
  for (let row = 0; row < 16; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col < 9; col++) {
      const idx = (row * 3 + col + 16) % 4;
      const shade =
        idx === 0
          ? '#c2593f'
          : idx === 1
          ? '#e2cdb5'
          : idx === 2
          ? '#b44b32'
          : '#d6bea1';
      ctx.fillStyle = shade;
      ctx.fillRect(col * brickW + offset + 1, row * brickH + 1, brickW - 2, brickH - 2);
    }
  }

  return finalizeTexture(canvas, 6, 32);
}

// Urban block plaza / courtyard concrete texture (replaces bare gray terrain)
export function createUrbanGroundTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#475569';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle paving slabs
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(x, y, 3, 3);
  }

  return finalizeTexture(canvas, 32, 32);
}

// Rickshaw Art backboard ("বাপের রাস্তা • সুপারহিট!" vibrant folk art)
export function createRickshawArtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#db2777';
  ctx.fillRect(0, 0, 256, 256);

  // Scalloped yellow/cyan folk border
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#facc15';
  ctx.strokeRect(8, 8, 240, 240);

  // Top dark hood banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(18, 18, 220, 48);
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('বাপের রাস্তা!', 128, 50);

  // Center peacock / rose medallion
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(128, 130, 56, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(128, 130, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(128, 130, 20, 0, Math.PI * 2);
  ctx.fill();

  // Bottom superhit ribbon
  ctx.fillStyle = '#facc15';
  ctx.fillRect(18, 194, 220, 44);
  ctx.fillStyle = '#b91c1c';
  ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
  ctx.fillText('সুপারহিট!', 128, 225);

  return finalizeTexture(canvas);
}

// Alternating Yellow & Black Dhaka Curb Texture
export function createCurbTexture(repeatLength = 24): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 128, 128, 128);

  return finalizeTexture(canvas, 1, repeatLength);
}

// Dhaka Metro Pillar Poster Textures ("পরিচ্ছন্ন শহর", "পাত্রী চাই", "টু-লেট / TO-LET")
export function createMetroPosterTexture(variant: 0 | 1 | 2): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base concrete pillar tint
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 256, 512);

  if (variant === 0) {
    // Green civic poster + Patrichai + To-Let collage
    ctx.fillStyle = '#14532d';
    ctx.fillRect(14, 20, 228, 220);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 24, 220, 212);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 26px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('পরিচ্ছন্ন শহর', 128, 86);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('সবুজ শহর', 128, 126);
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#86efac';
    ctx.fillText('আমার শহর, আমার দায়িত্ব', 128, 175);

    // White Patri Chai flyer
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(28, 256, 118, 112);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.fillText('পাত্রী চাই', 87, 290);
    ctx.fillStyle = '#1e293b';
    ctx.font = '13px "Hind Siliguri", sans-serif';
    ctx.fillText('লম্বা ও শিক্ষিত', 87, 318);
    ctx.fillText('০১৭XX-XXXXXX', 87, 345);

    // Yellow To-Let flyer
    ctx.fillStyle = '#facc15';
    ctx.fillRect(148, 300, 96, 92);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('টু-লেট', 196, 336);
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('TO-LET', 196, 366);
  } else if (variant === 1) {
    // Green & red "সাবাস বাংলাদেশ — হোম অফ ক্রিকেট" banner matching Dhaka Metro pillars
    ctx.fillStyle = '#15803d';
    ctx.fillRect(14, 18, 228, 460);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.strokeRect(17, 21, 222, 454);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('সাবাস বাংলাদেশ', 128, 56);

    // Stylized cricket bat, stumps & red ball emblem
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(102, 185, 8, 130);
    ctx.fillRect(124, 185, 8, 130);
    ctx.fillRect(146, 185, 8, 130);
    ctx.fillRect(100, 181, 56, 6);

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(178, 145, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tiger stripe crest bar
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(36, 220, 44, 110);
    ctx.fillStyle = '#18181b';
    for (let ty = 232; ty < 320; ty += 20) {
      ctx.fillRect(40, ty, 36, 7);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px "Hind Siliguri", sans-serif';
    ctx.fillText('হোম অফ ক্রিকেট', 128, 412);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillText('মিরপুর • আমাদের গর্ব', 128, 446);
  } else {
    // Coaching & To-Let flyer column
    ctx.fillStyle = '#0369a1';
    ctx.fillRect(18, 36, 220, 180);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('সুপার কোচিং সেন্টার', 128, 105);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('১০০% জিপিএ-৫ গ্যারান্টি!', 128, 152);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(36, 260, 184, 118);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.fillText('বাসা ভাড়া হবে', 128, 310);
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('TO-LET (২ রুম)', 128, 348);
  }

  return finalizeTexture(canvas);
}

// Authentic Bangladeshi comedic street political / election posters
export function createPoliticalPosterTexture(variant: 0 | 1 | 2 | 3 | 4 | 5): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  const configs: {
    topBg: string;
    border: string;
    accent: string;
    paper: string;
    header: string;
    slogan: string;
    candidate: string;
    role: string;
    symbolLabel: string;
    symbolType: 'rooster' | 'teacup' | 'wheel' | 'shades' | 'lock' | 'singara';
    hasShades?: boolean;
    hasCap?: boolean;
  }[] = [
    {
      topBg: '#14532d',
      border: '#dc2626',
      accent: '#facc15',
      paper: '#f8fafc',
      header: 'বিসমিল্লাহির রাহমানির রাহিম',
      slogan: 'যোগ্য নেতা, মনের মানুষ!',
      candidate: 'হাজী মোকলেছ ভাই',
      role: 'চান্দা সিটি মেয়র পদপ্রার্থী',
      symbolLabel: 'মুরগি মার্কা',
      symbolType: 'rooster',
      hasCap: true,
    },
    {
      topBg: '#9a3412',
      border: '#16a34a',
      accent: '#fde047',
      paper: '#fefce8',
      header: 'জনতার ডাকে সাড়া দিন',
      slogan: 'গরম চায়ে শীতল শহর!',
      candidate: 'কালাম চা মামা',
      role: 'কাঁচাবাজার ওয়ার্ড কাউন্সিলর',
      symbolLabel: 'টং-চা মার্কা',
      symbolType: 'teacup',
    },
    {
      topBg: '#0f172a',
      border: '#f59e0b',
      accent: '#facc15',
      paper: '#f1f5f9',
      header: 'পাড়ার শান্তি ও উন্নয়নে',
      slogan: 'ভাই সবার আগে মাঠে!',
      candidate: 'চান্দা ভাই',
      role: 'কেন্দ্রীয় চান্দা পরিষদ',
      symbolLabel: 'সানগ্লাস মার্কা',
      symbolType: 'shades',
      hasShades: true,
    },
    {
      topBg: '#065f46',
      border: '#eab308',
      accent: '#fef08a',
      paper: '#f8fafc',
      header: 'এলাকাবাসীর পক্ষ থেকে',
      slogan: 'জ্যাম কমাও, রিকশা চালাও!',
      candidate: 'ওস্তাদ মজনু মিয়া',
      role: 'বৃহত্তর মোড় উন্নয়ন কমিটি',
      symbolLabel: 'রিকশা চাকা',
      symbolType: 'wheel',
    },
    {
      topBg: '#7f1d1d',
      border: '#0f172a',
      accent: '#fca5a5',
      paper: '#fffbeb',
      header: 'আসন্ন সিটি নির্বাচনে',
      slogan: 'দিনে আড্ডা, রাতে টহল!',
      candidate: 'কবরা খান ভাই',
      role: 'দক্ষিণ বাজার ঐক্য জোট',
      symbolLabel: 'তালা-চাবি মার্কা',
      symbolType: 'lock',
      hasShades: true,
    },
    {
      topBg: '#0369a1',
      border: '#ef4444',
      accent: '#fde047',
      paper: '#f8fafc',
      header: 'গরিব ও মেহনতি মানুষের',
      slogan: 'ন্যায্য দামে গরম সিঙ্গারা!',
      candidate: 'আলতাফ সর্দার',
      role: 'ভোজনরসিক নাগরিক মঞ্চ',
      symbolLabel: 'সিঙ্গারা মার্কা',
      symbolType: 'singara',
      hasCap: true,
    },
  ];

  const cfg = configs[variant];

  // Paper base + crisp border
  ctx.fillStyle = cfg.paper;
  ctx.fillRect(0, 0, 256, 360);

  ctx.lineWidth = 10;
  ctx.strokeStyle = cfg.border;
  ctx.strokeRect(5, 5, 246, 350);

  // Top Header Ribbon
  ctx.fillStyle = cfg.topBg;
  ctx.fillRect(10, 10, 236, 48);
  ctx.fillStyle = cfg.accent;
  ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cfg.header, 128, 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "Hind Siliguri", sans-serif';
  ctx.fillText(cfg.slogan, 128, 49);

  // Left: Classic B&W halftone-style politician portrait frame
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(18, 68, 108, 126);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 68, 108, 126);

  // Bust / Jacket silhouette
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(24, 194);
  ctx.quadraticCurveTo(32, 148, 72, 146);
  ctx.quadraticCurveTo(112, 148, 120, 194);
  ctx.closePath();
  ctx.fill();

  // White collar / kurta V
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(60, 148);
  ctx.lineTo(72, 174);
  ctx.lineTo(84, 148);
  ctx.closePath();
  ctx.fill();

  // Face oval
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(72, 114, 24, 29, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hair / Cap
  ctx.fillStyle = '#0f172a';
  if (cfg.hasCap) {
    ctx.beginPath();
    ctx.arc(72, 92, 23, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(52, 86, 40, 6);
  } else {
    ctx.beginPath();
    ctx.ellipse(72, 89, 25, 11, 0, Math.PI, 0);
    ctx.fill();
  }

  // Sunglasses or Eyes + Big Mustache
  if (cfg.hasShades) {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(52, 105, 17, 10);
    ctx.fillRect(75, 105, 17, 10);
    ctx.fillRect(68, 107, 8, 3);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(62, 110, 3, 0, Math.PI * 2);
    ctx.arc(82, 110, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(61, 122, 22, 5);
  ctx.fillStyle = '#475569';
  ctx.fillRect(64, 130, 16, 3);

  // Right: Election Symbol Box (প্রতীক)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(136, 68, 102, 126);
  ctx.strokeStyle = cfg.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(136, 68, 102, 126);

  ctx.fillStyle = '#0f172a';
  const sx = 187;
  const sy = 120;
  if (cfg.symbolType === 'rooster') {
    ctx.beginPath();
    ctx.ellipse(sx, sy + 6, 22, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + 16, sy - 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(sx + 12, sy - 27, 10, 7);
  } else if (cfg.symbolType === 'teacup') {
    ctx.fillRect(sx - 18, sy - 8, 36, 28);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(sx + 18, sy + 5, 9, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillRect(sx - 24, sy + 22, 48, 5);
  } else if (cfg.symbolType === 'shades') {
    ctx.fillRect(sx - 30, sy - 10, 26, 18);
    ctx.fillRect(sx + 4, sy - 10, 26, 18);
    ctx.fillRect(sx - 6, sy - 6, 12, 5);
  } else if (cfg.symbolType === 'wheel') {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(sx, sy, 24, 0, Math.PI * 2);
    ctx.stroke();
    for (let a = 0; a < 4; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(ang) * 24, sy + Math.sin(ang) * 24);
      ctx.lineTo(sx - Math.cos(ang) * 24, sy - Math.sin(ang) * 24);
      ctx.stroke();
    }
  } else if (cfg.symbolType === 'lock') {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(sx, sy - 10, 14, Math.PI, 0);
    ctx.stroke();
    ctx.fillRect(sx - 20, sy - 6, 40, 30);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy + 7, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Singara triangle
    ctx.beginPath();
    ctx.moveTo(sx, sy - 24);
    ctx.lineTo(sx - 26, sy + 20);
    ctx.lineTo(sx + 26, sy + 20);
    ctx.closePath();
    ctx.fill();
  }

  // Symbol Caption
  ctx.fillStyle = cfg.border;
  ctx.fillRect(140, 166, 94, 24);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Hind Siliguri", sans-serif';
  ctx.fillText(cfg.symbolLabel, 187, 183);

  // Candidate Name Banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(16, 204, 224, 48);
  ctx.fillStyle = cfg.accent;
  ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
  ctx.fillText(cfg.candidate, 128, 234);

  // Role & Vote Callout
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
  ctx.fillText(cfg.role, 128, 274);

  ctx.fillStyle = cfg.border;
  ctx.fillRect(22, 292, 212, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 21px "Hind Siliguri", sans-serif';
  ctx.fillText('আপনার মূল্যবান ভোট দিন!', 128, 321);

  return finalizeTexture(canvas);
}

// Overhead Dhaka Metro Station Green Signboard
export function createMetroStationSignTexture(label = 'চান্দা সেন্টার'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, 512, 128);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#f8fafc';
  ctx.strokeRect(8, 8, 496, 112);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 66);

  return finalizeTexture(canvas);
}

// Dhaka roadside compound wall & dark steel gate texture
export function createCompoundWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 180, 128);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 180, 14);

  // Dark corrugated gate section
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(180, 8, 76, 120);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(182, 10, 72, 116);

  return finalizeTexture(canvas, 8, 1);
}

// Weathered Dhaka asphalt road with tar patches, cracks, yellow edge & dashed white lanes
export function createRoadTexture(repeatLength = 12): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#52575e';
  ctx.fillRect(0, 0, 256, 512);

  for (let i = 0; i < 3200; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    const gray = Math.floor(68 + Math.random() * 28);
    ctx.fillStyle = `rgb(${gray},${gray + 2},${gray + 5})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Darker asphalt repair patches (ঢাকার রাস্তার পরিচিত পিচ-ঢালাই প্যাচ)
  ctx.fillStyle = 'rgba(30, 34, 41, 0.42)';
  ctx.fillRect(36, 70, 62, 42);
  ctx.fillRect(156, 230, 58, 54);
  ctx.fillRect(48, 370, 74, 36);

  // Subtle surface crack lines
  ctx.strokeStyle = 'rgba(24, 24, 27, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(62, 160);
  ctx.lineTo(78, 178);
  ctx.lineTo(70, 200);
  ctx.moveTo(182, 390);
  ctx.lineTo(196, 412);
  ctx.stroke();

  // Edge yellow lines
  ctx.fillStyle = '#eab308';
  ctx.fillRect(10, 0, 5, 512);
  ctx.fillRect(241, 0, 5, 512);

  // Dashed white lane dividers
  ctx.fillStyle = '#f8fafc';
  for (let y = 18; y < 512; y += 84) {
    ctx.fillRect(124, y, 8, 46);
  }

  return finalizeTexture(canvas, 1, repeatLength);
}

// Zebra Crosswalk texture
export function createCrosswalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e2229';
  ctx.fillRect(0, 0, 256, 128);

  ctx.fillStyle = '#f8fafc';
  for (let x = 16; x < 246; x += 36) {
    ctx.fillRect(x, 12, 20, 104);
  }

  return finalizeTexture(canvas);
}

// Corrugated Tin Roof (টিনের চাল)
export function createTinRoofTexture(tintColor = '#94a3b8'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = tintColor;
  ctx.fillRect(0, 0, 128, 128);

  for (let x = 0; x < 128; x += 16) {
    const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.4)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.32)');
    grad.addColorStop(1, 'rgba(255,255,255,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 16, 128);
  }

  return finalizeTexture(canvas, 4, 4);
}

// Striped Shop Awning
export function createAwningTexture(color1 = '#dc2626', color2 = '#f8fafc'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const stripeWidth = 16;
  for (let x = 0; x < 128; x += stripeWidth * 2) {
    ctx.fillStyle = color1;
    ctx.fillRect(x, 0, stripeWidth, 128);
    ctx.fillStyle = color2;
    ctx.fillRect(x + stripeWidth, 0, stripeWidth, 128);
  }

  return finalizeTexture(canvas, 2, 2);
}

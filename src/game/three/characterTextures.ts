import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();
let textureAnisotropy = 4;

export function setCharacterTextureAnisotropy(maxAnisotropy: number) {
  textureAnisotropy = Math.max(1, Math.min(8, maxAnisotropy));
}

function finalizeCharTexture(key: string, canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = textureAnisotropy;
  tex.generateMipmaps = true;
  textureCache.set(key, tex);
  return tex;
}

function makeCanvas(w = 256, h = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function drawFivePetalFlower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  petalR: number,
  petalColor: string,
  centerColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = petalColor;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(a) * petalR * 0.85,
      Math.sin(a) * petalR * 0.85,
      petalR * 0.65,
      petalR * 0.36,
      a,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, petalR * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function getShirtTexture(styleName: string, baseHex = '#111827'): THREE.CanvasTexture {
  const key = `shirt_${styleName}_${baseHex}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const [canvas, ctx] = makeCanvas(256, 256);

  if (styleName === 'black_floral' || styleName === 'floral') {
    const bg = styleName === 'black_floral' ? '#12151c' : '#0369a1';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle fabric grain
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let y = 0; y < 256; y += 6) {
      ctx.fillRect(0, y, 256, 1);
    }

    // Scattered 5-petal white & pale sky-blue flowers matching Hero reference
    const flowerPositions = [
      [26, 28, 12],
      [82, 24, 9],
      [174, 28, 11],
      [226, 36, 13],
      [48, 78, 11],
      [204, 86, 12],
      [24, 136, 13],
      [78, 132, 10],
      [182, 138, 12],
      [230, 148, 9],
      [46, 194, 12],
      [94, 218, 10],
      [168, 204, 13],
      [222, 224, 11],
    ];
    flowerPositions.forEach(([fx, fy, fr], idx) => {
      const petalCol = idx % 3 === 0 ? '#dbeafe' : '#f8fafc';
      const centerCol = styleName === 'black_floral' ? '#64748b' : '#facc15';
      drawFivePetalFlower(ctx, fx, fy, fr, petalCol, centerCol);

      // Tiny tropical leaf accent
      ctx.fillStyle = styleName === 'black_floral' ? '#334155' : '#22c55e';
      ctx.beginPath();
      ctx.ellipse(fx + fr * 0.95, fy + fr * 0.55, fr * 0.48, fr * 0.2, 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Open front showing crisp white T-shirt underneath on front face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(106, 0);
    ctx.lineTo(150, 0);
    ctx.lineTo(146, 256);
    ctx.lineTo(110, 256);
    ctx.closePath();
    ctx.fill();

    // T-shirt crew-neck shadow & collar seam
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(104, 0, 3, 256);
    ctx.fillRect(149, 0, 3, 256);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(128, 14, 20, 0.15, Math.PI - 0.15);
    ctx.stroke();

    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'blue_denim') {
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#1e40af';
    for (let x = 0; x < 256; x += 8) ctx.fillRect(x, 0, 2, 256);

    // Open white tee center
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(108, 0, 40, 256);

    // Denim stitching & twin chest pocket flaps
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 40, 44);
    ctx.strokeRect(160, 56, 40, 44);
    ctx.beginPath();
    ctx.moveTo(106, 0);
    ctx.lineTo(106, 256);
    ctx.moveTo(150, 0);
    ctx.lineTo(150, 256);
    ctx.stroke();
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'white_punjabi' || styleName === 'red_kurta' || styleName === 'gold_sherwani' || styleName === 'black_silk') {
    const mapBg: Record<string, string> = {
      white_punjabi: '#f8fafc',
      red_kurta: '#dc2626',
      gold_sherwani: '#d97706',
      black_silk: '#18181b',
    };
    const trimCol = styleName === 'black_silk' ? '#e2e8f0' : '#facc15';
    ctx.fillStyle = mapBg[styleName] || baseHex;
    ctx.fillRect(0, 0, 256, 256);

    // Traditional Bengali Punjabi embroidered chest placket
    ctx.fillStyle = styleName === 'white_punjabi' ? '#fef3c7' : 'rgba(0,0,0,0.22)';
    ctx.fillRect(114, 0, 28, 152);
    ctx.strokeStyle = trimCol;
    ctx.lineWidth = 4;
    ctx.strokeRect(114, 4, 28, 148);

    // Ornate buttons
    ctx.fillStyle = trimCol;
    for (let by = 24; by <= 130; by += 26) {
      ctx.beginPath();
      ctx.arc(128, by, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle festive brocade diamonds on sherwani
    if (styleName === 'gold_sherwani') {
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 2;
      for (let gx = 24; gx < 240; gx += 32) {
        for (let gy = 24; gy < 240; gy += 32) {
          ctx.strokeRect(gx - 5, gy - 5, 10, 10);
        }
      }
    }
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'yellow_blue_polo') {
    // Grocer NPC horizontal yellow-blue stripes
    for (let y = 0; y < 256; y += 36) {
      ctx.fillStyle = (y / 36) % 2 === 0 ? '#eab308' : '#2563eb';
      ctx.fillRect(0, y, 256, 36);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, y + 32, 256, 4);
    }
    // Polo collar placket
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(116, 0, 24, 66);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(128, 22, 3, 0, Math.PI * 2);
    ctx.arc(128, 44, 3, 0, Math.PI * 2);
    ctx.fill();
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'boss_white_suit') {
    // Crisp white VIP blazer with golden-yellow dress shirt center
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(98, 0);
    ctx.lineTo(158, 0);
    ctx.lineTo(140, 210);
    ctx.lineTo(116, 210);
    ctx.closePath();
    ctx.fill();

    // Blazer lapels
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(86, 0);
    ctx.lineTo(106, 0);
    ctx.lineTo(122, 185);
    ctx.lineTo(100, 175);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(170, 0);
    ctx.lineTo(150, 0);
    ctx.lineTo(134, 185);
    ctx.lineTo(156, 175);
    ctx.closePath();
    ctx.fill();

    // Pocket square + gold buttons
    ctx.fillStyle = '#facc15';
    ctx.fillRect(166, 78, 24, 9);
    ctx.beginPath();
    ctx.arc(128, 198, 5, 0, Math.PI * 2);
    ctx.fill();
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'police_uniform') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 256, 256);
    // Epaulette seam + center button placket
    ctx.fillStyle = '#172554';
    ctx.fillRect(119, 0, 18, 256);
    // Pockets
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 60, 50, 56);
    ctx.strokeRect(158, 60, 50, 56);
    // Gold badge + name tag
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(182, 46, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(54, 42, 38, 12);
    // Buttons
    ctx.fillStyle = '#facc15';
    for (let by = 28; by <= 210; by += 42) {
      ctx.beginPath();
      ctx.arc(128, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'bus_driver_uniform') {
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(120, 0, 16, 256);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 66, 48, 52);
    ctx.strokeRect(158, 66, 48, 52);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(162, 42, 34, 14);
    ctx.fillStyle = '#ffffff';
    for (let by = 32; by <= 200; by += 42) {
      ctx.beginPath();
      ctx.arc(128, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'female_kameez') {
    ctx.fillStyle = '#a855f7';
    ctx.fillRect(0, 0, 256, 256);
    // Floral motif & ornate collar
    ctx.fillStyle = '#7e22ce';
    ctx.beginPath();
    ctx.arc(128, 22, 32, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(128, 22, 34, 0, Math.PI);
    ctx.stroke();

    [
      [44, 72],
      [210, 72],
      [76, 134],
      [182, 134],
      [48, 198],
      [128, 178],
      [204, 206],
    ].forEach(([fx, fy]) => {
      drawFivePetalFlower(ctx, fx, fy, 10, '#f3e8ff', '#fde047');
    });

    // Bottom floral border
    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(0, 226, 256, 30);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, 224, 256, 3);
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'black_polo') {
    // Deep matte charcoal-black athletic polo pique fabric matching Hero reference
    ctx.fillStyle = '#15171c';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle faceted / pique knit micro-shading
    for (let y = 0; y < 256; y += 8) {
      for (let x = 0; x < 256; x += 8) {
        if (((x + y) / 8) % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.025)';
          ctx.fillRect(x, y, 4, 4);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(x + 2, y + 2, 4, 4);
        }
      }
    }

    // Subtle chest contour highlight & hem seam
    const chestGrad = ctx.createLinearGradient(0, 20, 0, 170);
    chestGrad.addColorStop(0, 'rgba(255,255,255,0.05)');
    chestGrad.addColorStop(0.5, 'rgba(255,255,255,0.015)');
    chestGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = chestGrad;
    ctx.fillRect(24, 24, 208, 180);

    // Polo V-placket with dark stitched edge & 2 matte buttons
    ctx.fillStyle = '#0d0f13';
    ctx.fillRect(117, 0, 22, 82);
    ctx.strokeStyle = '#2a2e38';
    ctx.lineWidth = 2;
    ctx.strokeRect(117, 0, 22, 82);

    ctx.fillStyle = '#383d47';
    [32, 58].forEach((by) => {
      ctx.beginPath();
      ctx.arc(128, by, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bottom polo hem double-stitch
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, 242, 256, 2);
    return finalizeCharTexture(key, canvas);
  }

  // Classic solid / T-shirt / tea vendor / beige rickshaw shirt
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(118, 0, 20, 256);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 10, 22, 0, Math.PI);
  ctx.stroke();

  if (styleName === 'tea_white_shirt' || styleName === 'rickshaw_beige_shirt') {
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(156, 60, 42, 46);
    ctx.fillStyle = '#94a3b8';
    for (let by = 28; by <= 200; by += 42) {
      ctx.beginPath();
      ctx.arc(128, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return finalizeCharTexture(key, canvas);
}

export function getBottomTexture(styleName: string, baseHex = '#1e293b'): THREE.CanvasTexture {
  const key = `bottom_${styleName}_${baseHex}`;
  const existing = textureCache.get(key);
  if (existing) return existing;

  const [canvas, ctx] = makeCanvas(256, 256);

  if (styleName === 'check_lungi' || styleName === 'lungi_blue_yellow' || styleName === 'lungi_green_gold') {
    const isBlue = styleName === 'lungi_blue_yellow';
    ctx.fillStyle = isBlue ? '#1d4ed8' : '#15803d';
    ctx.fillRect(0, 0, 256, 256);

    const checkAccent = isBlue ? '#facc15' : '#fde047';
    const checkDark = isBlue ? '#0f172a' : '#052e16';
    for (let i = 0; i < 256; i += 32) {
      ctx.fillStyle = checkAccent;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(i, 0, 8, 256);
      ctx.fillRect(0, i, 256, 8);
      ctx.fillStyle = checkDark;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(i + 16, 0, 6, 256);
      ctx.fillRect(0, i + 16, 256, 6);
    }
    ctx.globalAlpha = 1;
    // Lungi waist fold band
    ctx.fillStyle = checkDark;
    ctx.fillRect(0, 0, 256, 18);
    return finalizeCharTexture(key, canvas);
  }

  if (styleName === 'black_cargo') {
    // Charcoal tactical camo-faceted cargo fabric matching Hero reference
    ctx.fillStyle = '#25282e';
    ctx.fillRect(0, 0, 256, 256);

    const patches = [
      [12, 16, 56, 42, '#1d2025'],
      [88, 8, 72, 48, '#2f333b'],
      [182, 24, 62, 44, '#1b1d22'],
      [34, 82, 68, 52, '#2d3138'],
      [126, 74, 58, 46, '#1b1e23'],
      [194, 96, 54, 48, '#31353e'],
      [18, 154, 64, 54, '#1c1e23'],
      [104, 148, 74, 48, '#2c3037'],
      [190, 166, 58, 56, '#1a1c21'],
      [54, 212, 76, 38, '#30343c'],
      [148, 206, 68, 44, '#1e2026'],
    ] as const;

    patches.forEach(([px, py, pw, ph, pcol]) => {
      ctx.fillStyle = pcol;
      ctx.beginPath();
      ctx.moveTo(px, py + ph * 0.25);
      ctx.lineTo(px + pw * 0.45, py);
      ctx.lineTo(px + pw, py + ph * 0.35);
      ctx.lineTo(px + pw * 0.72, py + ph);
      ctx.lineTo(px + pw * 0.12, py + ph * 0.85);
      ctx.closePath();
      ctx.fill();
    });

    // Subtle tactical seam & knee fold lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 78, 62, 72);
    ctx.strokeRect(174, 78, 62, 72);
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    ctx.fillRect(0, 152, 256, 5);
    ctx.fillRect(0, 232, 256, 4);
    return finalizeCharTexture(key, canvas);
  }

  // Denim / Khaki / Navy / White trousers
  const col =
    styleName === 'blue_jeans'
      ? '#1d4ed8'
      : styleName === 'khaki_pants'
      ? '#a16207'
      : styleName === 'white_pajama'
      ? '#f1f5f9'
      : styleName === 'boss_white_pants'
      ? '#f8fafc'
      : baseHex;

  ctx.fillStyle = col;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle denim diagonal weave + cargo stitching
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let y = 0; y < 256; y += 6) ctx.fillRect(0, y, 256, 2);

  if (styleName === 'blue_jeans') {
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 80, 62, 68);
    ctx.strokeRect(174, 80, 62, 68);
  }

  return finalizeCharTexture(key, canvas);
}

export function getGamchaTexture(): THREE.CanvasTexture {
  const key = 'gamcha_red_blue';
  const existing = textureCache.get(key);
  if (existing) return existing;

  const [canvas, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, 0, 128, 128);

  for (let i = 0; i < 128; i += 24) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(i, 0, 5, 128);
    ctx.fillRect(0, i, 128, 5);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(i + 12, 0, 5, 128);
    ctx.fillRect(0, i + 12, 128, 5);
  }
  return finalizeCharTexture(key, canvas);
}

export function disposeCharacterTextures() {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}

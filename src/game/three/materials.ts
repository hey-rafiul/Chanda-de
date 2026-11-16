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

// Footpath / sidewalk herringbone tile texture
export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#b45309'; // Warm Dhaka terracotta brick tone
  ctx.fillRect(0, 0, 256, 256);

  const brickW = 32;
  const brickH = 16;
  for (let row = 0; row < 16; row++) {
    const offset = (row % 2) * (brickW / 2);
    for (let col = -1; col < 9; col++) {
      const shade = (row + col) % 3 === 0 ? '#c2410c' : (row + col) % 2 === 0 ? '#9a3412' : '#b45309';
      ctx.fillStyle = shade;
      ctx.fillRect(col * brickW + offset + 1, row * brickH + 1, brickW - 2, brickH - 2);
    }
  }

  return finalizeTexture(canvas, 6, 30);
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
    // Red festive political/civic banner poster
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(16, 28, 224, 340);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 5;
    ctx.strokeRect(20, 32, 216, 332);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ঢাকা আমার ঢাকা', 128, 108);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Hind Siliguri", sans-serif';
    ctx.fillText('চান্দা সিটি মেট্রো', 128, 165);
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('দ্রুত ও নিরাপদ যাত্রা', 128, 222);

    // Floral circles
    [70, 186].forEach((cx) => {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, 300, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(cx, 300, 12, 0, Math.PI * 2);
      ctx.fill();
    });
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

// Asphalt road with yellow curbs + center white dashed lines
export function createRoadTexture(repeatLength = 12): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e2229';
  ctx.fillRect(0, 0, 256, 512);

  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 512;
    const gray = Math.floor(24 + Math.random() * 22);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Side double-yellow line
  ctx.fillStyle = '#eab308';
  ctx.fillRect(10, 0, 6, 512);
  ctx.fillRect(240, 0, 6, 512);

  // Dashed white lane divider
  ctx.fillStyle = '#f8fafc';
  for (let y = 18; y < 512; y += 84) {
    ctx.fillRect(123, y, 10, 48);
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

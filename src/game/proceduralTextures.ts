/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Misi Taman Lestari: Pengembaraan Wira Alam
 * Penjana Tekstur Prosedural PBR (Procedural PBR Textures & Materials)
 */

import * as THREE from 'three';

// Cache untuk mengelakkan penciptaan tekstur berulang
const textureCache = new Map<string, THREE.CanvasTexture>();

function createNoiseCanvas(
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawFn(ctx, width, height);
  }
  return canvas;
}

/**
 * Tekstur Rumput Tropika Prosedural dengan variasi warna & bilah daun
 */
export function getGrassTexture(): THREE.CanvasTexture {
  const key = 'grass_diffuse';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
    // Warna asas rumput hijau segar
    ctx.fillStyle = '#3f7d20';
    ctx.fillRect(0, 0, w, h);

    // Bintik-bintik tanah & variasi hijau gelap/terang
    const colors = ['#2e5c18', '#4b9427', '#5ca82b', '#254a13', '#68b832'];
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2.2 + 0.5;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bilah rumput halus
    ctx.strokeStyle = 'rgba(120, 210, 60, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const len = Math.random() * 6 + 3;
      const angle = (Math.random() - 0.5) * 0.8 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Peta Lekukan (Bump Map) untuk Rumput
 */
export function getGrassBumpMap(): THREE.CanvasTexture {
  const key = 'grass_bump';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const gray = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Tekstur Denai Batu Baur (Cobblestone / Flagstone Pavers)
 */
export function getStonePathTexture(): THREE.CanvasTexture {
  const key = 'stone_diffuse';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(256, 256, (ctx, w, h) => {
    // Mortar latar gelap
    ctx.fillStyle = '#3a3d40';
    ctx.fillRect(0, 0, w, h);

    const cols = 6;
    const rows = 12;
    const cellW = w / cols;
    const cellH = h / rows;

    const stoneTones = [
      '#a0aab2', '#8d99ae', '#b5c0c9', '#7a858e', '#9fa8a3', '#6f777d'
    ];

    for (let r = 0; r < rows; r++) {
      const xOffset = (r % 2) * (cellW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const sx = c * cellW + xOffset + 2;
        const sy = r * cellH + 2;
        const sw = cellW - 4;
        const sh = cellH - 4;

        ctx.fillStyle = stoneTones[Math.floor(Math.random() * stoneTones.length)];
        ctx.beginPath();
        // Batu berbucu bulat (rounded stone)
        ctx.roundRect(sx, sy, sw, sh, [4, 4, 4, 4]);
        ctx.fill();

        // Tekstur bintik mikro pada batu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let p = 0; p < 30; p++) {
          ctx.fillRect(sx + Math.random() * sw, sy + Math.random() * sh, 1.5, 1.5);
        }
      }
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 28);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Peta Lekukan (Bump Map) untuk Denai Batu
 */
export function getStoneBumpMap(): THREE.CanvasTexture {
  const key = 'stone_bump';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#101010'; // Alur mortar berlekuk ke dalam
    ctx.fillRect(0, 0, w, h);

    const cols = 6;
    const rows = 12;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      const xOffset = (r % 2) * (cellW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const sx = c * cellW + xOffset + 2;
        const sy = r * cellH + 2;
        const sw = cellW - 4;
        const sh = cellH - 4;

        // Permukaan batu lebih tinggi (putih/kelabu cair)
        ctx.fillStyle = '#dcdcdc';
        ctx.beginPath();
        ctx.roundRect(sx, sy, sw, sh, [3, 3, 3, 3]);
        ctx.fill();
      }
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 28);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Tekstur Kulit Pokok Tropika (Tree Bark)
 */
export function getTreeBarkTexture(): THREE.CanvasTexture {
  const key = 'bark_diffuse';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#3e2716';
    ctx.fillRect(0, 0, w, h);

    // Gentian kayu menegak (Vertical grain & striations)
    const barkShades = ['#2c1b10', '#4a321e', '#5a3d24', '#201309'];
    for (let x = 0; x < w; x += 2) {
      const shade = barkShades[Math.floor(Math.random() * barkShades.length)];
      ctx.fillStyle = shade;
      ctx.fillRect(x, 0, 2 + Math.random() * 2, h);
    }

    // Rekahan kulit pokok (cracks)
    ctx.fillStyle = 'rgba(15, 8, 3, 0.45)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      ctx.fillRect(cx, cy, 3, Math.random() * 25 + 10);
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Tekstur Papan Kayu Asli (Wood Planks) untuk Jambatan, Gazebo & Menara Tinjau
 */
export function getWoodPlankTexture(): THREE.CanvasTexture {
  const key = 'wood_plank_diffuse';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = createNoiseCanvas(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(0, 0, w, h);

    const planks = 6;
    const plankH = h / planks;
    const tones = ['#6d4c41', '#5d4037', '#795548', '#4e342e'];

    for (let i = 0; i < planks; i++) {
      const y = i * plankH;
      ctx.fillStyle = tones[i % tones.length];
      ctx.fillRect(0, y + 1, w, plankH - 2);

      // Garis urat kayu
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, y, w, 1.5);

      // Bintik paku di hujung papan
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(12, y + plankH / 2, 2, 0, Math.PI * 2);
      ctx.arc(w - 12, y + plankH / 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Bahan PBR Tanah & Rumput Padang
 */
export function createGrassPBRMaterial(isSoftwareGl = false): THREE.MeshStandardMaterial {
  const diffuse = getGrassTexture();
  const bump = getGrassBumpMap();

  return new THREE.MeshStandardMaterial({
    map: diffuse,
    bumpMap: isSoftwareGl ? undefined : bump,
    bumpScale: 0.08,
    roughness: 0.88,
    metalness: 0.04,
    color: 0xffffff,
  });
}

/**
 * Bahan PBR Laluan Berturap Batu
 */
export function createStonePathPBRMaterial(isSoftwareGl = false): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getStonePathTexture(),
    bumpMap: isSoftwareGl ? undefined : getStoneBumpMap(),
    bumpScale: 0.12,
    roughness: 0.7,
    metalness: 0.08,
  });
}

/**
 * Bahan PBR Kayu Papan Tradisional
 */
export function createWoodPlankPBRMaterial(_isSoftwareGl = false): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getWoodPlankTexture(),
    roughness: 0.78,
    metalness: 0.05,
  });
}

/**
 * Bahan PBR Kulit Pokok Tropika
 */
export function createTreeBarkPBRMaterial(_isSoftwareGl = false): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    map: getTreeBarkTexture(),
    roughness: 0.88,
    metalness: 0.02,
  });
}

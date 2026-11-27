import * as THREE from "three";

// ==================================================
// 紙面デザイン — 方眼紙に手書きフォントで title / サムネイル / url を配置
// サムネイルは各サイトの OGP 画像 (public/ に配置)
// ==================================================
// 架空ブランド (記事公開用に著作権フリーの自作データ)。
// URL は RFC 2606 で予約された .example TLD なので実在しない。
// サムネイルは public/data/ の自作 SVG (1200×630 = OGP と同じ比率)。
export const PAPER_DESIGNS = Array.from({length:12},(_,i)=>({title:"FEEDBACK",url:"TEST CARD / "+String(i+1).padStart(2,"0")}));

const TEX_W = 1024;
const TEX_H = 1400;
// 英数字は Caveat、日本語は手書き風の Yomogi にフォールバックする
const HAND_FONT = '"Caveat", "Yomogi", "Comic Sans MS", cursive';
const INK_COLOR = "#1d1d1b";
// サムネイルは 16:9
const IMAGE_RECT = {
  x: Math.round(TEX_W * 0.11),
  y: Math.round(TEX_H * 0.33),
  w: Math.round(TEX_W * 0.78),
  h: Math.round((TEX_W * 0.78 * 9) / 16),
};

// デザインごとの共有ステート (canvas / texture / material / video)
const designStates = [];

function drawStaticLayer(ctx, design) {
  ctx.fillStyle="#f5f2e9";ctx.fillRect(0,0,TEX_W,TEX_H);
  ctx.fillStyle="#181818";ctx.font="bold 92px Arial";ctx.fillText("VEDRUSHAA",90,170);
  ctx.fillStyle="#d72e31";ctx.font="bold 115px Arial";ctx.fillText("FEEDBACK",90,390);
  ctx.fillStyle="#181818";ctx.font="48px Arial";ctx.fillText("Тестовая карточка",90,560);
  ctx.fillText("Здесь будет отзыв ученика.",90,640);
  ctx.font="40px Arial";ctx.fillText(design.url,90,1260);
}

function drawTitle(ctx, title) {
  const maxW = TEX_W * 0.78;
  const x = TEX_W * 0.11;

  // まず1行で収まるか (100px までは縮小を許容)
  let size = 170;
  ctx.font = `${size}px ${HAND_FONT}`;
  while (ctx.measureText(title).width > maxW && size > 100) {
    size -= 6;
    ctx.font = `${size}px ${HAND_FONT}`;
  }
  const words = title.split(" ");
  if (ctx.measureText(title).width <= maxW || words.length < 2) {
    // 1単語で収まらない場合はさらに縮小
    while (ctx.measureText(title).width > maxW && size > 60) {
      size -= 6;
      ctx.font = `${size}px ${HAND_FONT}`;
    }
    ctx.fillText(title, x, TEX_H * 0.245);
    return;
  }

  // 2行に折り返し (行幅が最も揃う分割位置を選ぶ)
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const width = Math.max(
      ctx.measureText(line1).width,
      ctx.measureText(line2).width,
    );
    if (!best || width < best.width) best = { line1, line2, width };
  }
  size = 120;
  ctx.font = `${size}px ${HAND_FONT}`;
  while (
    Math.max(
      ctx.measureText(best.line1).width,
      ctx.measureText(best.line2).width,
    ) > maxW &&
    size > 60
  ) {
    size -= 6;
    ctx.font = `${size}px ${HAND_FONT}`;
  }
  ctx.fillText(best.line1, x, TEX_H * 0.16);
  ctx.fillText(best.line2, x, TEX_H * 0.255);
}

// OGP 画像を cover フィットで枠内に描き込む
function drawDesignImage(state) {
  const { ctx, image } = state;
  if (!image.complete || !image.naturalWidth) return;

  const scale = Math.max(
    IMAGE_RECT.w / image.naturalWidth,
    IMAGE_RECT.h / image.naturalHeight,
  );
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(IMAGE_RECT.x, IMAGE_RECT.y, IMAGE_RECT.w, IMAGE_RECT.h);
  ctx.clip();
  ctx.drawImage(
    image,
    IMAGE_RECT.x + (IMAGE_RECT.w - dw) / 2,
    IMAGE_RECT.y + (IMAGE_RECT.h - dh) / 2,
    dw,
    dh,
  );
  ctx.restore();
  ctx.strokeStyle = "#3a3a38";
  ctx.lineWidth = 3;
  ctx.strokeRect(IMAGE_RECT.x, IMAGE_RECT.y, IMAGE_RECT.w, IMAGE_RECT.h);
  state.texture.needsUpdate = true;
}

// 手書きフォントのロード完了後に静的レイヤーを描き直す
if (document.fonts) {
  Promise.all([
    document.fonts.load('100px "Caveat"'),
    document.fonts.load('100px "Yomogi"', "一歩の冒険"),
  ]).then(() => {
    for (const state of designStates) {
      if (!state) continue;
      drawStaticLayer(state.ctx, state.design);
      drawDesignImage(state);
      state.texture.needsUpdate = true;
    }
  });
}

function getDesignMaterial(designIndex) {
  const idx = designIndex % PAPER_DESIGNS.length;
  if (designStates[idx]) return designStates[idx].material;

  const design = PAPER_DESIGNS[idx];
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  drawStaticLayer(ctx, design);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.rotation = Math.PI; // UVに合わせて回転
  texture.center.set(0.5, 0.5);
  texture.repeat.set(1, -1); // UVに合わせて反転

  // 両面表示（紙は薄いので裏も見えてほしい）
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const image = new Image();
  const state = { design, canvas, ctx, texture, material, image };
  image.onload = () => drawDesignImage(state);
  // このファイル (src/) の1つ上の階層にある data/ を参照する
  // No external thumbnail: real student designs will replace these test cards.

  designStates[idx] = state;
  return material;
}

/**
 * animation.json のデータから Three.js のメッシュを作る
 * designIndex で紙面デザイン (PAPER_DESIGNS) を選ぶ
 * 戻り値: { mesh, positionAttr, normalAttr }
 */
export function createPaper(animData, designIndex = 0) {
  const { vertexCount, indices, uvs, positions, normals } = animData;

  const geometry = new THREE.BufferGeometry();

  // ===== 頂点位置（最初のフレームで初期化）=====
  // 毎フレーム書き換える前提なので Float32Array を直接持つ
  const positionArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    positionArray[i] = positions[i]; // フレーム0
  }
  const positionAttr = new THREE.BufferAttribute(positionArray, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage); // 頻繁に更新される
  geometry.setAttribute("position", positionAttr);

  // ===== 法線 =====
  const normalArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    normalArray[i] = normals[i];
  }
  const normalAttr = new THREE.BufferAttribute(normalArray, 3);
  normalAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("normal", normalAttr);

  // ===== UV =====
  const uvArray = new Float32Array(uvs.length);
  for (let i = 0; i < uvs.length; i++) {
    uvArray[i] = uvs[i];
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));

  // ===== インデックス =====
  // 140頂点なので Uint16 で十分
  const indexArray = new Uint16Array(indices);
  geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

  const mesh = new THREE.Mesh(geometry, getDesignMaterial(designIndex));

  return {
    mesh,
    positionAttr,
    normalAttr,
  };
}

/**
 * 指定フレーム（小数可）の positions と normals でジオメトリを更新する。
 * 小数の場合は隣接フレーム間を線形補間する。
 */
export function updatePaperFrame(paper, animData, frameIdx) {
  const { vertexCount, frameCount, positions, normals } = animData;
  const { positionAttr, normalAttr } = paper;

  const len = vertexCount * 3;
  const f0 = Math.floor(frameIdx);
  const t = frameIdx - f0;

  const off0 = f0 * len;

  const posArray = positionAttr.array;
  const nrmArray = normalAttr.array;

  if (t < 1e-6) {
    // 整数フレーム — コピーだけ
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i];
      nrmArray[i] = normals[off0 + i];
    }
  } else {
    // 小数フレーム — lerp
    const f1 = (f0 + 1) % frameCount;
    const off1 = f1 * len;
    const s = 1 - t;
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i] * s + positions[off1 + i] * t;
      nrmArray[i] = normals[off0 + i] * s + normals[off1 + i] * t;
    }
  }

  positionAttr.needsUpdate = true;
  normalAttr.needsUpdate = true;

  paper.mesh.geometry.computeBoundingSphere();
  paper.mesh.geometry.computeBoundingBox();
}

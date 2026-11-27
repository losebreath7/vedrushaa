/* Adapted for Vedrushaa from Galaxy by David Haz, React Bits.
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(() => {
const MAX_LAYERS = 8;
const MAX_COLORS = 4;
const INTRO_SECONDS = 2.2;

const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${MAX_COLORS}];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${MAX_LAYERS}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const keyOf = (palette, repel, warp) => (palette ? 4 : 0) + (repel ? 2 : 0) + (warp ? 1 : 0);

const start = (gl, palette, repel, warp) => {
  const defines = `${palette ? '#define PALETTE\n' : ''}${repel ? '#define REPEL\n' : ''}${warp ? '#define WARP\n' : ''}`;
  const program = gl.createProgram();
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vertex || !fragment) return null;
  gl.shaderSource(vertex, VERTEX);
  gl.shaderSource(fragment, FRAGMENT.replace('\n', `\n${defines}`));
  gl.compileShader(vertex);
  gl.compileShader(fragment);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'aPosition');
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
};

const finish = (gl, program) => {
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  const uniforms = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (info) uniforms[info.name.replace('[0]', '')] = gl.getUniformLocation(program, info.name);
  }
  return { program, uniforms };
};

const settings = {
  focal:[.5,.5], rotation:[1,0], starSpeed:.05, density:.85, hueShift:69,
  disableAnimation:false, speed:.05, mouseInteraction:true, glowIntensity:.54,
  saturation:0, mouseRepulsion:true, repulsionStrength:.8, twinkleIntensity:.26,
  rotationSpeed:.03, autoCenterRepulsion:0, transparent:true, lightMode:false,
  palette:[], starSize:.3, flareIntensity:1.8, layers:4, reverse:false,
  clickWarp:true, intro:true, opacity:1
};
const canvas = document.getElementById('stars');
const container = canvas.parentElement;
    const gl = canvas?.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!gl) return fallbackStars(canvas);

    canvas.dataset.renderer='webgl2';
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const programs = new Map();
    const entry = (palette, repel, warp) => {
      const key = keyOf(palette, repel, warp);
      let found = programs.get(key);
      if (!found) {
        found = { program: start(gl, palette, repel, warp), linked: null, done: false };
        programs.set(key, found);
      }
      return found;
    };
    const variant = (palette, repel, warp, wait) => {
      const found = entry(palette, repel, warp);
      if (!found.done && found.program) {
        if (!wait && parallel && !gl.getProgramParameter(found.program, parallel.COMPLETION_STATUS_KHR)) return null;
        found.linked = finish(gl, found.program);
        found.done = true;
      }
      return found.linked;
    };
    const initial = settings;
    if (!variant(initial.palette.length > 0, false, false, true)) {
      programs.forEach(found => found.program && gl.deleteProgram(found.program));
      const replacement = canvas.cloneNode(false);
      canvas.replaceWith(replacement);
      return fallbackStars(replacement);
    }

    const buffer = gl.createBuffer();
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const cache = new Map();
    const parse = (value, fallback) => {
      if (!value) return fallback;
      const key = String(value);
      if (cache.has(key)) return cache.get(key);
      let rgb = fallback;
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#000000';
        probe.fillStyle = key;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      cache.set(key, rgb);
      return rgb;
    };
    const colors = new Float32Array(MAX_COLORS * 3);

    const pointer = { x: 0.5, y: 0.5, inside: false };
    const state = {
      time: 0,
      gloss: 0,
      depth: 0,
      angle: 0,
      mx: 0.5,
      my: 0.5,
      active: 0,
      boost: 0,
      reveal: settings.intro && !reduce ? 0 : 1
    };
    let raf = 0;
    let last = 0;
    let visible = true;

    const render = () => {
      const s = settings;
      s.palette.forEach((value, index) => colors.set(parse(value, [1, 1, 1]), index * 3));
      const mode = s.lightMode ? (s.transparent ? 3 : 2) : s.transparent ? 1 : 0;
      const background = parse(s.backgroundColor, s.lightMode ? [1, 1, 1] : [0, 0, 0]);
      const reveal = state.reveal;
      const palette = s.palette.length > 0;
      const repel = s.autoCenterRepulsion > 0 || (s.mouseRepulsion && s.repulsionStrength > 0 && state.active > 0);
      const warp = state.boost > 0;
      const base = variant(palette, false, false, true);
      if (!base) return;
      const program = (repel || warp ? variant(palette, repel, warp, false) : null) ?? base;
      const u = program.uniforms;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program.program);
      gl.bindVertexArray(vao);
      gl.uniform1f(u.uTime, state.time);
      gl.uniform2f(u.uResolution, canvas.width, canvas.height);
      gl.uniform2f(u.uFocal, s.focal[0], s.focal[1]);
      gl.uniform2f(u.uRotation, s.rotation[0], s.rotation[1]);
      gl.uniform1f(u.uGloss, state.gloss);
      gl.uniform1f(u.uDepth, state.depth);
      gl.uniform1f(u.uDensity, s.density);
      gl.uniform1f(u.uHueShift, s.hueShift);
      gl.uniform1f(u.uSpeed, s.speed);
      gl.uniform2f(u.uMouse, state.mx, state.my);
      const stretch = 1 + state.boost * 5;
      gl.uniform1f(u.uStarGlow, (0.05 * s.glowIntensity * s.starSize) / Math.pow(stretch, 0.6));
      gl.uniform1f(u.uFlareGain, s.glowIntensity * s.flareIntensity);
      gl.uniform1f(u.uSquash, 1 - 1 / (stretch * stretch));
      gl.uniform1f(u.uSaturation, s.saturation);
      gl.uniform1f(u.uMouseRepulsion, s.mouseRepulsion ? 1 : 0);
      gl.uniform1f(u.uTwinkleIntensity, s.twinkleIntensity);
      gl.uniform1f(u.uRotationAngle, state.angle);
      gl.uniform1f(u.uRepulsionStrength, s.repulsionStrength);
      gl.uniform1f(u.uMouseActiveFactor, state.active);
      gl.uniform1f(u.uAutoCenterRepulsion, s.autoCenterRepulsion);
      gl.uniform1i(u.uLayers, s.layers);
      gl.uniform3fv(u.uColors, colors);
      gl.uniform1i(u.uColorCount, s.palette.length);
      gl.uniform1f(u.uWarp, state.boost);
      const fade = Math.min(1, reveal / 0.35);
      gl.uniform1f(u.uReveal, fade * fade * (3 - 2 * fade));
      gl.uniform1f(u.uMode, mode);
      gl.uniform3fv(u.uBackground, background);
      gl.uniform1f(u.uOpacity, s.opacity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const frame = now => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settings;
      const dt = last ? clamp((now - last) / 1000, 0.0005, 0.05) : 1 / 60;
      last = now;
      const motion = s.disableAnimation || reduce ? 0 : 1;
      if (s.intro && !reduce && state.reveal < 1) {
        state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS);
        state.boost = Math.max(state.boost, Math.pow(1 - state.reveal, 2) * 1.4);
      } else if (!s.intro || reduce) {
        state.reveal = 1;
      }
      const flight = (s.starSpeed / 10) * (s.reverse ? -1 : 1);
      state.time += dt * motion;
      state.gloss += dt * flight * motion;
      state.depth += dt * flight * s.speed * motion * (1 + state.boost * 14);
      state.angle += dt * s.rotationSpeed * motion;
      state.boost *= Math.exp(-dt * 1.3);
      if (state.boost < 0.001) state.boost = 0;

      const follow = 1 - Math.exp(-dt / 0.325);
      const engaged = s.mouseInteraction && pointer.inside && !reduce;
      if (engaged) {
        state.mx += (pointer.x - state.mx) * follow;
        state.my += (pointer.y - state.my) * follow;
      }
      const target = engaged ? 1 : 0;
      state.active += (target - state.active) * follow;
      if (Math.abs(target - state.active) < 0.001) state.active = target;

      render();
      const busy = motion > 0 || state.boost > 0 || state.active !== target || state.reveal < 1;
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const s = settings;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      render();
      wake();
    };

    const locate = event => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      pointer.x = x / Math.max(1, rect.width);
      pointer.y = 1 - y / Math.max(1, rect.height);
    };

    const onPointerMove = event => {
      locate(event);
      wake();
    };

    const onPointerDown = event => {
      const s = settings;
      locate(event);
      if (!pointer.inside || !s.clickWarp || reduce) return;
      state.boost = Math.min(1.6, state.boost + 1);
      wake();
    };

    const onPointerUp = event => {
      if (event.pointerType !== 'mouse') pointer.inside = false;
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    container.addEventListener('pointerup', onPointerUp, { passive: true });
    container.addEventListener('pointercancel', onPointerUp, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();

    const repelling = initial.autoCenterRepulsion > 0 || (initial.mouseInteraction && initial.mouseRepulsion);
    const tinted = initial.palette.length > 0;
    if (initial.clickWarp || initial.intro) entry(tinted, false, true);
    if (repelling) entry(tinted, true, false);
    if (repelling && initial.clickWarp) entry(tinted, true, true);


function fallbackStars(canvas) {
  canvas.dataset.renderer='canvas2d';
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const section = canvas.parentElement;
  const stars = Array.from({length:260}, () => ({
    x:Math.random()-.5, y:Math.random()-.5, depth:Math.random(), light:.45+Math.random()*.55
  }));
  let width, height, frame, last, visible = false;
  let targetX=0, targetY=0, offsetX=0, offsetY=0, boost=0, pointer=null;
  section.addEventListener('pointerdown',()=>{if(!reduced.matches) boost=1;});
  function paint(time) {
    const dt = last ? Math.min((time-last)/1000,.05) : 0;
    last=time;
    boost*=Math.exp(-dt*1.3);
    ctx.clearRect(0,0,width,height);
    offsetX += (targetX-offsetX)*.07;
    offsetY += (targetY-offsetY)*.07;
    for(const star of stars){
      if(!reduced.matches) star.depth=(star.depth+dt*.024*(1+14*boost))%1;
      const scale=1/(1.45-star.depth);
      let x=width*(.5+star.x*scale)+offsetX*scale;
      let y=height*(.48+star.y*scale)+offsetY*scale;
      if(pointer){
        const dx=x-pointer.x, dy=y-pointer.y, r=Math.max(1,Math.hypot(dx,dy));
        const push=24*star.depth*Math.max(0,1-r/130)**2;
        x+=push*dx/r; y+=push*dy/r;
      }
      const radius=.45+star.depth**3*1.8;
      ctx.shadowColor='#ece9ff';ctx.shadowBlur=radius>1?4:0;
      ctx.fillStyle='rgba(238,240,255,'+(star.light*Math.min(1,star.depth*12,(1-star.depth)*16))+')';
      ctx.beginPath();ctx.ellipse(x,y,radius*(1+boost*5),radius,Math.atan2(y-height/2,x-width/2),0,2*Math.PI);ctx.fill();
    }
    if(visible && !document.hidden && !reduced.matches) frame=requestAnimationFrame(paint);
  }
  function refresh() {
    cancelAnimationFrame(frame);last=0;
    if(visible && !document.hidden) paint(performance.now());
  }
  new ResizeObserver(() => {
    width=canvas.clientWidth;height=canvas.clientHeight;
    const ratio=Math.min(devicePixelRatio,2);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);refresh();
  }).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(width)refresh();}).observe(section);
  section.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||reduced.matches)return;
    const rect=canvas.getBoundingClientRect();
    pointer={x:e.clientX-rect.left,y:e.clientY-rect.top};
    targetX=((e.clientX-rect.left)/width-.5)*8;targetY=((e.clientY-rect.top)/height-.5)*8;
  });
  section.addEventListener('pointerleave',()=>{targetX=targetY=0;pointer=null;});
  reduced.addEventListener('change',refresh);
  document.addEventListener('visibilitychange',refresh);
}
})();

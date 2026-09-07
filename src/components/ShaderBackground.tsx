/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

// Fullscreen triangle — avoids a vertex buffer entirely.
const VERTEX_SRC = `#version 300 es
void main() {
  vec2 pos = vec2(
    (gl_VertexID == 2) ? 3.0 : -1.0,
    (gl_VertexID == 1) ? 3.0 : -1.0
  );
  gl_Position = vec4(pos, 0.0, 1.0);
}`;

// Soft, slow-drifting aurora of blurred color fields over a near-black base —
// evokes the macOS/visionOS "liquid glass" wallpaper that glass panels sit on.
const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

out vec4 fragColor;

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;

  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));

  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.55;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = rot * p * 1.95;
    amp *= 0.55;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float t = uTime * 0.035;

  // Base near-black canvas, matching the app shell.
  vec3 base = vec3(0.020, 0.027, 0.047);

  // Three slow-drifting fbm fields, each tinted, blended additively then tonemapped.
  float f1 = fbm(p * 1.1 + vec2(t * 1.3, -t * 0.8));
  float f2 = fbm(p * 1.4 + vec2(-t * 0.9, t * 1.1) + 4.2);
  float f3 = fbm(p * 0.9 + vec2(t * 0.6, t * 1.4) + 9.1);

  vec3 indigo = vec3(0.35, 0.33, 0.98);
  vec3 violet = vec3(0.55, 0.28, 0.92);
  vec3 cyan   = vec3(0.16, 0.72, 0.86);

  float g1 = smoothstep(0.05, 0.85, f1);
  float g2 = smoothstep(0.10, 0.90, f2);
  float g3 = smoothstep(0.05, 0.80, f3);

  vec3 color = base;
  color += indigo * g1 * 0.22;
  color += violet * g2 * 0.16;
  color += cyan   * g3 * 0.14;

  // Gentle vignette so panel edges/corners stay darkest.
  float vig = smoothstep(1.05, 0.25, length(p));
  color *= mix(0.65, 1.05, vig);

  // Fine dither to avoid banding across the smooth gradients.
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  color += dither;

  fragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return; // CSS gradient fallback (see index.css) stays visible.

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uTime = gl.getUniformLocation(program, 'uTime');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let running = true;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const render = (now: number) => {
      if (!running) return;
      resize();
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!prefersReducedMotion) raf = requestAnimationFrame(render);
    };

    resize();
    raf = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-shader-fallback" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

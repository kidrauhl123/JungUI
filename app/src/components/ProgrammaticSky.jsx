import { useEffect, useRef, useState } from 'react'

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_warmth;
uniform float u_clouds;
uniform float u_softness;
uniform float u_drift;
uniform float u_grain;
uniform vec2 u_wind;

out vec4 out_color;

mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1271, 0.3117, 0.7473));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(262144.0, 32768.0) * n);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float total = 0.0;
  float amp = 0.52;
  float norm = 0.0;
  mat2 r = rotate2d(0.54);

  for (int i = 0; i < 5; i++) {
    total += valueNoise(p) * amp;
    norm += amp;
    p = r * p * 2.04 + vec2(5.37, 9.19);
    amp *= 0.54;
  }

  return total / norm;
}

float puffField(vec2 q, float t) {
  vec2 g = floor(q);
  float field = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 cell = g + vec2(float(x), float(y));
      vec2 h = hash22(cell + u_seed);
      vec2 center = cell + vec2(h.x, h.y);
      center.x += sin(t * 0.08 + h.y * 6.283) * 0.16;
      center.y += sin(t * 0.045 + h.x * 6.283) * 0.035;

      vec2 d = q - center;
      d.x /= mix(0.58, 1.08, h.x);
      d.y /= mix(0.2, 0.38, h.y);
      field += exp(-dot(d, d) * 1.92) * mix(0.46, 0.92, hash12(cell + 17.31));
    }
  }

  return clamp(field * 0.42, 0.0, 1.35);
}

float cloudLayer(vec2 q, float t) {
  vec2 wind = vec2(t * 0.055, t * 0.006);
  vec2 warp = vec2(
    fbm(q * 0.56 + vec2(u_seed, t * 0.014)),
    fbm(q * 0.54 + vec2(7.13 - t * 0.01, u_seed * 0.31))
  );
  q += (warp - 0.5) * vec2(0.58, 0.22) + wind;

  float puffs = puffField(q, t);
  float broad = fbm(q * vec2(0.82, 0.58) + wind * 0.34);
  float edge = fbm(q * vec2(3.2, 2.4) - wind * 1.1);

  return clamp(puffs * 0.82 + broad * 0.38 - edge * 0.16, 0.0, 1.0);
}

float cirrusLayer(vec2 q, float t) {
  q = rotate2d(0.08) * q;
  float streaks = fbm(q * vec2(1.65, 0.72) + vec2(t * 0.045, u_seed * 0.19));
  float broken = fbm(q * vec2(4.4, 1.2) + vec2(-t * 0.02, 5.2));
  return streaks * 0.78 + broken * 0.22;
}

float cloudCluster(vec2 p, vec2 center, vec2 size, float seed, float t) {
  center += vec2(sin(t * 0.026 + seed) * 0.035, sin(t * 0.018 + seed * 1.7) * 0.018);

  vec2 d0 = (p - center) / size;
  vec2 d1 = (p - (center + size * vec2(-0.72, -0.04))) / (size * vec2(0.78, 0.7));
  vec2 d2 = (p - (center + size * vec2(0.66, 0.02))) / (size * vec2(0.82, 0.74));
  vec2 d3 = (p - (center + size * vec2(-0.18, 0.35))) / (size * vec2(0.68, 0.58));
  vec2 d4 = (p - (center + size * vec2(0.22, -0.33))) / (size * vec2(1.08, 0.48));

  float lobes = exp(-dot(d0, d0) * 1.72);
  lobes += exp(-dot(d1, d1) * 1.9) * 0.74;
  lobes += exp(-dot(d2, d2) * 1.85) * 0.78;
  lobes += exp(-dot(d3, d3) * 2.25) * 0.52;
  lobes += exp(-dot(d4, d4) * 1.55) * 0.46;

  float grain = fbm((p - center) * vec2(4.2, 6.4) + vec2(seed, t * 0.018));
  float erosion = fbm((p - center) * vec2(12.0, 8.0) + vec2(-t * 0.032, seed * 2.3));
  return max(lobes * (0.82 + grain * 0.28) - erosion * 0.24, 0.0);
}

float smokeBlob(vec2 p, vec2 center, vec2 size, float seed, float t, float span) {
  center += vec2(sin(t * 0.018 + seed) * 0.035, sin(t * 0.014 + seed * 1.9) * 0.02);
  center.x += round((p.x - center.x) / span) * span;
  vec2 q = (p - center) / size;
  vec2 warp = vec2(
    fbm(q * 1.15 + vec2(seed, t * 0.018)),
    fbm(q * 1.1 + vec2(7.0 - t * 0.014, seed * 0.47))
  );
  q += (warp - 0.5) * 0.62;

  vec2 q0 = q * vec2(0.9, 1.08);
  vec2 q1 = (q + vec2(0.78, -0.12)) * vec2(1.18, 1.0);
  vec2 q2 = (q + vec2(-0.64, 0.14)) * vec2(1.05, 1.16);
  vec2 q3 = (q + vec2(0.06, 0.48)) * vec2(0.92, 1.42);

  float shape = exp(-dot(q0, q0) * 1.05);
  shape += exp(-dot(q1, q1) * 1.34) * 0.58;
  shape += exp(-dot(q2, q2) * 1.28) * 0.62;
  shape += exp(-dot(q3, q3) * 1.55) * 0.36;

  float broad = fbm(q * vec2(2.6, 2.0) + vec2(seed * 0.3, t * 0.018));
  float medium = fbm(q * vec2(6.0, 4.7) + vec2(-t * 0.028, seed));
  float fine = fbm(q * vec2(15.0, 11.0) + vec2(seed * 2.1, t * 0.045));
  float erosion = medium * 0.2 + fine * 0.08;

  return max(shape * (0.54 + broad * 0.68) - erosion, 0.0);
}

float smokyCloudscape(vec2 p, float aspect, float t) {
  vec2 crossWind = vec2(-u_wind.y, u_wind.x);
  vec2 wind = u_wind * t * 0.11 + crossWind * sin(t * 0.08) * 0.035;
  vec2 nearWind = u_wind * t * 0.17 + crossWind * sin(t * 0.1 + 1.4) * 0.045;
  vec2 far = p - wind;
  vec2 near = p - nearWind;
  float span = aspect + 1.35;
  float volume = 0.0;
  volume += smokeBlob(near, vec2(aspect * 0.36, -0.05), vec2(0.82, 0.34), 1.7, t, span) * 1.2;
  volume += smokeBlob(far, vec2(aspect * 0.88, 0.18), vec2(0.56, 0.27), 5.1, t, span) * 0.92;
  volume += smokeBlob(near, vec2(aspect * -0.08, 0.48), vec2(0.46, 0.3), 9.4, t, span) * 0.9;
  volume += smokeBlob(far, vec2(aspect * 0.68, 1.04), vec2(0.48, 0.22), 13.6, t, span) * 0.76;
  volume += smokeBlob(near, vec2(aspect * 1.08, 0.64), vec2(0.44, 0.26), 17.2, t, span) * 0.78;
  volume += smokeBlob(far, vec2(aspect * 0.18, 0.9), vec2(0.38, 0.18), 22.8, t, span) * 0.5;
  volume += smokeBlob(near, vec2(aspect * 0.58, 0.52), vec2(0.62, 0.26), 28.4, t, span) * 0.72;
  volume += smokeBlob(far, vec2(aspect * 0.08, 0.2), vec2(0.5, 0.24), 33.1, t, span) * 0.58;
  return clamp(volume, 0.0, 2.35);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float time = u_time;
  float lowerSky = pow(1.0 - uv.y, 1.42);
  vec3 highBlue = mix(vec3(0.25, 0.54, 0.82), vec3(0.6, 0.43, 0.72), u_warmth);
  vec3 lowBlue = mix(vec3(0.68, 0.85, 0.98), vec3(1.0, 0.75, 0.52), u_warmth);
  vec3 sky = mix(highBlue, lowBlue, lowerSky);

  vec2 sun = vec2(aspect * 0.88, 0.84);
  float sunDistance = distance(p, sun);
  vec3 sunColor = mix(vec3(1.0, 0.97, 0.88), vec3(1.0, 0.72, 0.43), u_warmth);
  sky += sunColor * exp(-sunDistance * sunDistance * 9.0) * 0.22;
  sky += sunColor * exp(-sunDistance * 3.2) * 0.04;
  vec3 toneWash = mix(vec3(0.36, 0.68, 1.0), vec3(1.0, 0.55, 0.28), u_warmth);
  float toneStrength = mix(0.22, 0.42, u_warmth) * (0.56 + lowerSky * 0.44);
  sky = mix(sky, toneWash, toneStrength);

  float cloudSlider = smoothstep(0.12, 1.0, u_clouds);
  vec2 cloudCoord = vec2(p.x, uv.y);
  vec2 crossWind = vec2(-u_wind.y, u_wind.x);
  float volume = smokyCloudscape(p, aspect, time);
  vec2 macroP = cloudCoord - u_wind * time * 0.1 + crossWind * sin(time * 0.06) * 0.05;
  vec2 detailP = cloudCoord - u_wind * time * 0.28 + crossWind * sin(time * 0.12) * 0.12;
  vec2 microP = cloudCoord - u_wind * time * 0.52 + crossWind * sin(time * 0.16) * 0.24;
  float macro = fbm(macroP * vec2(1.12, 0.9) + vec2(time * 0.025, u_seed * 0.2));
  float detail = fbm(detailP * vec2(5.4, 4.2) + vec2(-time * 0.055, u_seed * 0.61));
  float micro = fbm(microP * vec2(14.0, 10.0) + vec2(time * 0.08, u_seed * 1.4));
  float storm = smoothstep(0.68, 1.0, cloudSlider);
  float density = volume * (0.82 + macro * 0.56) + detail * 0.2 - micro * 0.08;
  density *= mix(0.98, 1.42, cloudSlider);
  density += storm * volume * 0.28;
  float threshold = mix(0.78, 0.22, cloudSlider);
  float mist = smoothstep(threshold - 0.22, threshold + 0.34, density);
  float cloudGate = smoothstep(threshold, threshold + 0.34, density);
  float core = smoothstep(threshold + 0.22, threshold + 0.78, density + detail * 0.16);
  float edgeMask = max(max(smoothstep(0.98, 0.55, uv.y), smoothstep(0.74, 1.0, uv.y)), max(smoothstep(0.12, 0.0, uv.x), smoothstep(0.88, 1.0, uv.x)));
  float edgeMist = edgeMask * (0.05 + cloudSlider * 0.13) * smoothstep(0.26, 0.78, macro + detail * 0.35);
  float cloudAlpha = clamp(mist * mix(0.16, 0.3, cloudSlider) + cloudGate * mix(0.32, 0.62, cloudSlider) + core * mix(0.12, 0.24, cloudSlider) + edgeMist, 0.0, 0.82);

  float cloudWarmth = u_warmth * 0.16;
  vec3 cloudShade = mix(vec3(0.56, 0.64, 0.7), vec3(0.72, 0.68, 0.72), cloudWarmth);
  vec3 cloudLit = mix(vec3(0.98, 0.99, 1.0), sunColor * 1.05, 0.08 + 0.08 * cloudWarmth);
  vec3 cloudColor = mix(cloudShade, cloudLit, clamp(core * 0.92 + macro * 0.38, 0.0, 1.0));
  cloudColor += vec3(1.0, 0.98, 0.93) * core * 0.12;
  cloudColor = mix(cloudColor, cloudShade * 0.92, detail * mist * 0.2);

  sky = mix(sky, cloudColor, cloudAlpha);
  sky = mix(sky, vec3(0.95, 0.97, 0.98), edgeMist * 0.28);

  vec2 center = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float vignette = pow(max(cos(length(center) * 0.86), 0.0), 2.6);
  sky *= mix(0.94, 1.0, vignette);

  float sparkle = hash12(gl_FragCoord.xy + floor(u_time * 18.0) * 37.0) - 0.5;
  sky += sparkle * u_grain;

  sky = pow(max(sky, vec3(0.0)), vec3(1.0 / 2.2));
  out_color = vec4(sky, 1.0);
}
`

const DEFAULTS = {
  warmth: 0.12,
  clouds: 0.84,
  softness: 0.8,
  drift: 0.6,
  grain: 0.012,
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(error)
  }

  return shader
}

function createProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = gl.createProgram()

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(error)
  }

  return program
}

function flowToSpeed(flow) {
  const normalized = Math.max(0, Math.min(1, (flow - 0.12) / 2.88))
  return 0.08 + normalized * normalized * 18
}

const WIND_DIRECTIONS = [
  { label: '向右', angle: 0, vector: [1, 0] },
  { label: '右下', angle: 45, vector: [0.707, 0.707] },
  { label: '向下', angle: 90, vector: [0, 1] },
  { label: '左下', angle: 135, vector: [-0.707, 0.707] },
  { label: '向左', angle: 180, vector: [-1, 0] },
  { label: '左上', angle: 225, vector: [-0.707, -0.707] },
  { label: '向上', angle: 270, vector: [0, -1] },
  { label: '右上', angle: 315, vector: [0.707, -0.707] },
]

export function ProgrammaticSky({
  className = '',
  variant = 'default',
  warmth = DEFAULTS.warmth,
  clouds = DEFAULTS.clouds,
  softness = DEFAULTS.softness,
  drift = DEFAULTS.drift,
  grain = DEFAULTS.grain,
  wind = [1, 0],
}) {
  const canvasRef = useRef(null)
  const drawRef = useRef(null)
  const settingsRef = useRef({ warmth, clouds, softness, drift, grain, wind })

  useEffect(() => {
    settingsRef.current = { warmth, clouds, softness, drift, grain, wind }
    drawRef.current?.(performance.now())
  }, [clouds, drift, grain, softness, warmth, wind])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })

    if (!gl) {
      canvas.style.opacity = '0'
      return undefined
    }

    let program
    let raf = 0
    let visible = true
    let disposed = false
    let lastFrame = 0
    let previousTime = 0
    let cloudTime = 0
    let width = 0
    let height = 0
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    try {
      program = createProgram(gl)
    } catch (error) {
      console.warn('ProgrammaticSky shader failed', error)
      canvas.style.opacity = '0'
      return undefined
    }

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      seed: gl.getUniformLocation(program, 'u_seed'),
      warmth: gl.getUniformLocation(program, 'u_warmth'),
      clouds: gl.getUniformLocation(program, 'u_clouds'),
      softness: gl.getUniformLocation(program, 'u_softness'),
      drift: gl.getUniformLocation(program, 'u_drift'),
      grain: gl.getUniformLocation(program, 'u_grain'),
      wind: gl.getUniformLocation(program, 'u_wind'),
    }

    const vao = gl.createVertexArray()
    const buffer = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = Math.max(1, Math.round(rect.width * dpr))
      height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
    }

    const draw = (now = 0) => {
      if (disposed) return
      if (!visible && !reduceMotion) return
      if (!reduceMotion && now - lastFrame < 33) {
        raf = requestAnimationFrame(draw)
        return
      }

      lastFrame = now
      const seconds = now * 0.001
      if (!previousTime) previousTime = seconds
      const delta = Math.min(0.08, Math.max(0, seconds - previousTime))
      previousTime = seconds
      if (!reduceMotion) cloudTime += delta * flowToSpeed(settingsRef.current.drift)

      resize()
      gl.viewport(0, 0, width, height)
      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.uniform2f(uniforms.resolution, width, height)
      gl.uniform1f(uniforms.time, reduceMotion ? 0 : cloudTime)
      gl.uniform1f(uniforms.seed, 12.47)
      gl.uniform1f(uniforms.warmth, settingsRef.current.warmth)
      gl.uniform1f(uniforms.clouds, settingsRef.current.clouds)
      gl.uniform1f(uniforms.softness, settingsRef.current.softness)
      gl.uniform1f(uniforms.drift, settingsRef.current.drift)
      gl.uniform1f(uniforms.grain, settingsRef.current.grain)
      gl.uniform2f(uniforms.wind, settingsRef.current.wind[0], settingsRef.current.wind[1])
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reduceMotion) raf = requestAnimationFrame(draw)
    }

    drawRef.current = draw

    const observer = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        visible = entries[entries.length - 1]?.isIntersecting ?? true
        if (visible && !raf && !reduceMotion) raf = requestAnimationFrame(draw)
      })
      : null

    observer?.observe(canvas)

    const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(() => draw(performance.now())) : null
    resizeObserver?.observe(canvas)
    window.addEventListener('resize', resize)
    draw(performance.now())

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      observer?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      drawRef.current = null
    }
  }, [])

  return (
    <div className={`programmatic-sky programmatic-sky--${variant} ${className}`}>
      <canvas ref={canvasRef} className="programmatic-sky__canvas" aria-hidden="true" />
      <div className="programmatic-sky__fallback" aria-hidden="true" />
      <div className="programmatic-sky__haze" aria-hidden="true" />
      <div className="programmatic-sky__grain" aria-hidden="true" />
    </div>
  )
}

export function ProgrammaticSkyPreview() {
  return (
    <div className="item programmatic-sky-item">
      <a className="sky-preview-card" href="/patterns/programmatic-sky/" target="_top" aria-label="打开程序化天空背景预览">
        <ProgrammaticSky className="sky-preview-card__sky" variant="preview" clouds={0.9} drift={0.56} />
        <div className="sky-preview-card__chrome" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="sky-preview-card__panel">
          <span className="sky-preview-card__title">Atmosphere</span>
          <span className="sky-preview-card__line sky-preview-card__line--long" />
          <span className="sky-preview-card__line" />
        </div>
      </a>
      <div className="caption">
        <div className="name">程序化天空</div>
        <div className="note">WebGL noise 云层 · 日光银边 · 缓慢漂移 · 无视频素材</div>
      </div>
    </div>
  )
}

export function ProgrammaticSkyPage() {
  const [skySettings, setSkySettings] = useState({ warmth: 0.1, clouds: 0.88, drift: 0.58 })
  const [windIndex, setWindIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const windDirection = WIND_DIRECTIONS[windIndex]
  const updateSkySetting = (key) => (event) => {
    setSkySettings((current) => ({ ...current, [key]: Number(event.target.value) }))
  }
  const cycleWindDirection = () => {
    setWindIndex((current) => (current + 1) % WIND_DIRECTIONS.length)
  }
  const copySkyParams = async () => {
    const params = {
      warmth: Number(skySettings.warmth.toFixed(2)),
      clouds: Number(skySettings.clouds.toFixed(2)),
      drift: Number(skySettings.drift.toFixed(2)),
      softness: 0.82,
      grain: 0.01,
      wind: {
        label: windDirection.label,
        angle: windDirection.angle,
        vector: windDirection.vector,
      },
    }
    const text = JSON.stringify(params, null, 2)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <main className="sky-page">
      <nav className="pattern-topbar sky-page__topbar" aria-label="页面导航">
        <a href="/">JungUI</a>
        <span>Programmatic Sky</span>
      </nav>
      <section className="sky-page__stage" aria-label="Programmatic sky background study">
        <ProgrammaticSky
          className="sky-page__atmosphere"
          variant="full"
          warmth={skySettings.warmth}
          clouds={skySettings.clouds}
          softness={0.82}
          drift={skySettings.drift}
          grain={0.01}
          wind={windDirection.vector}
        />
        <div className="sky-page__glass">
          <p>JungUI</p>
          <h1>Programmatic sky</h1>
          <span>WebGL atmosphere study</span>
        </div>
        <div className="sky-page__controls" aria-label="天空参数">
          <label className="sky-page__control sky-page__control--tone">
            <span>Sky</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={skySettings.warmth}
              onChange={updateSkySetting('warmth')}
              aria-label="Sky color tone"
            />
          </label>
          <label className="sky-page__control">
            <span>Cloud</span>
            <input
              type="range"
              min="0.12"
              max="1"
              step="0.01"
              value={skySettings.clouds}
              onChange={updateSkySetting('clouds')}
              aria-label="Cloud density"
            />
          </label>
          <label className="sky-page__control">
            <span>Flow</span>
            <input
              type="range"
              min="0.12"
              max="3"
              step="0.01"
              value={skySettings.drift}
              onChange={updateSkySetting('drift')}
              aria-label="Cloud flow speed"
            />
          </label>
          <button
            className="sky-page__direction"
            type="button"
            style={{ '--wind-angle': `${windDirection.angle}deg` }}
            onClick={cycleWindDirection}
            aria-label={`切换风向：${windDirection.label}`}
            title={`风向：${windDirection.label}`}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h10.2M10.8 5.8 15 10l-4.2 4.2" />
            </svg>
          </button>
          <button
            className="sky-page__export"
            type="button"
            onClick={copySkyParams}
            aria-live="polite"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>
    </main>
  )
}

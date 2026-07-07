const SKY_SEED = 1247

const DEFAULT_PARAMS = {
  sunX: 1,
  sunY: 1,
  glow: 1,
  warm: 0.12,
  coverage: 0.45,
  soft: 0.65,
  scale: 2.2,
  billow: 0,
  cirrus: 0.92,
  drift: 0.79,
  haze: 0,
  ev: -0.18,
  bloom: 1,
  grain: 0.01,
  vig: 0,
}

const DEFAULT_WIND = [1, 0]

const CAMERA_PARAMS = {
  type: 0,
  defocus: 0.31,
  edge: 0,
  highlights: 1,
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main(){ gl_Position = vec4(a_position, 0.0, 1.0); }
`

const FRAGMENT_HEADER = `#version 300 es
precision highp float;
out vec4 fragColor;
`

const NOISE_SOURCE = `
#define TAU 6.28318530718
float hash21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i),              hash21(i + vec2(1, 0)), u.x),
             mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
}
float fbm2(vec2 p){ return vnoise(p) * 0.62 + vnoise(p * 2.13 + 7.7) * 0.38; }
mat2 rot2(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
`

const SORA_SHADER = `${FRAGMENT_HEADER}${NOISE_SOURCE}
uniform vec2  u_res;
uniform float u_time;
uniform float u_seed;
uniform vec2  u_sunPos;
uniform float u_glow;
uniform float u_warm;
uniform float u_coverage;
uniform float u_soft;
uniform float u_scale;
uniform float u_billow;
uniform float u_cirrus;
uniform float u_haze;
uniform vec2  u_wind;

float fbmN(vec2 p, int oct){
  float a = 0.5, s = 0.0, n = 0.0;
  for(int i = 0; i < 5; i++){
    if(i >= oct) break;
    s += a * vnoise(p);
    n += a; a *= 0.52; p = p * 2.07 + 13.7;
  }
  return s / n;
}

float cloudField(vec2 q, int oct){
  vec2 flow = vec2(u_wind.x, -u_wind.y);
  vec2 cross = vec2(-flow.y, flow.x);
  vec2 p = q - u_time * (flow * 0.045 + cross * 0.006);
  if(u_billow > 0.001){
    vec2 drift = flow * u_time;
    vec2 w = vec2(fbm2(q * 0.55 - drift * 0.020 + u_seed),
                  fbm2(q * 0.55 + 9.1 + drift * 0.016));
    p += (w - 0.5) * (2.6 * u_billow);
  }
  return fbmN(p, oct);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 pa = vec2(uv.x * aspect, uv.y);
  vec2 sa = vec2(u_sunPos.x * aspect, u_sunPos.y);

  float skyTone = u_warm;
  float cloudTone = 0.12;
  vec3 zen  = mix(vec3(0.150, 0.355, 0.795), vec3(0.34, 0.36, 0.62), skyTone * 0.8);
  vec3 hor  = mix(vec3(0.60, 0.74, 0.94),    vec3(0.95, 0.74, 0.58), skyTone);
  vec3 skySunC = mix(vec3(1.00, 0.97, 0.90), vec3(1.00, 0.66, 0.34), skyTone);
  vec3 cloudSunC = mix(vec3(1.00, 0.97, 0.90), vec3(1.00, 0.66, 0.34), cloudTone);

  float hz = pow(1.0 - uv.y, 1.6);
  vec3 sky = mix(zen, hor, clamp(hz + u_haze * (1.0 - uv.y) * 0.7, 0.0, 1.0)) * 1.12;

  float sd = distance(pa, sa);
  float halo = exp(-sd * sd * 11.0) * 0.55 + exp(-sd * 2.6) * 0.16;
  sky += skySunC * halo * (u_glow * 1.15);

  vec2 q = pa * (2.1 * u_scale) + vec2(u_seed * 0.37, u_seed * 0.61);
  float d = mix(0.5, cloudField(q, 5), 1.22);
  float thr  = mix(0.66, 0.38, u_coverage);
  float band = 0.07 + 0.20 * u_soft;
  float c = smoothstep(thr, thr + band, d);

  vec2 toSun = normalize(sa - pa + 1e-4);
  float dLit = cloudField(q + toSun * 0.11, 3);
  float rim  = clamp((d - dLit) * 9.0, -1.0, 1.0);

  float dense = smoothstep(thr + band * 0.6, thr + band * 1.9, d);
  vec3 litC    = cloudSunC * (1.18 + 0.55 * u_glow * exp(-sd * 1.4));
  vec3 shadeC  = mix(vec3(0.66, 0.72, 0.85), vec3(0.72, 0.64, 0.68), cloudTone) * 0.96;
  vec3 cloudC  = mix(litC, shadeC, clamp(dense * 0.85 - rim * 0.45, 0.0, 1.0));
  cloudC = mix(cloudC, litC * 1.06, clamp(rim, 0.0, 1.0) * (1.0 - dense * 0.55));

  float veil = smoothstep(thr - 0.13, thr, d) * (1.0 - c);
  sky = mix(sky, mix(sky, litC, 0.45), veil * 0.28);

  vec3 col = mix(sky, cloudC, c * 0.96);

  if(u_cirrus > 0.005){
    vec2 flow = vec2(u_wind.x, -u_wind.y);
    vec2 cq = rot2(-0.18) * ((pa - flow * u_time * 0.10) * vec2(1.3, 4.2) * u_scale) + vec2(0.0, u_seed);
    float ci = fbmN(cq, 5);
    float wisp = smoothstep(0.56, 0.78, ci) * u_cirrus;
    col = mix(col, mix(cloudSunC, vec3(1.0), 0.5) * 1.05, wisp * 0.42 * (1.0 - c));
  }

  col *= 1.0 - 0.10 * pow(uv.y, 2.0) * (1.0 - skyTone * 0.5);

  fragColor = vec4(col, 1.0);
}
`

const DEFOCUS_SHADER = `${FRAGMENT_HEADER}${NOISE_SOURCE}
uniform sampler2D u_tex;
uniform vec2  u_res;
uniform float u_amount;
uniform float u_edge;
uniform float u_hi;
uniform float u_type;
uniform int   u_taps;

float iris(float a){
  return cos(0.5235988) / cos(mod(a, 1.0471976) - 0.5235988);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  if(u_amount < 1e-5){ fragColor = texture(u_tex, uv); return; }

  float aspect = u_res.x / u_res.y;
  vec2  c   = (uv - 0.5) * vec2(aspect, 1.0);
  float rad = length(c) / (0.5 * sqrt(aspect * aspect + 1.0));
  float R   = u_amount * mix(1.0, smoothstep(0.12, 0.95, rad), u_edge);
  if(R < 1e-5){ fragColor = texture(u_tex, uv); return; }

  float phi0 = hash21(gl_FragCoord.xy) * TAU;
  int  type = int(u_type);
  vec3 acc = vec3(0.0); float wsum = 0.0;
  float fN = float(u_taps);
  for(int i = 0; i < 16; i++){
    if(i >= u_taps) break;
    float fi = float(i);
    float r  = sqrt((fi + 0.5) / fN);
    float a  = fi * 2.39996323 + phi0;
    if(type == 1) r *= iris(a);
    vec2 off = r * vec2(cos(a), sin(a));
    if(type == 2) off.x *= 0.52;
    vec3 s = texture(u_tex, uv + off * R * vec2(1.0 / aspect, 1.0)).rgb;
    float w = 1.0 + u_hi * 5.0 * max(dot(s, vec3(0.2126, 0.7152, 0.0722)) - 0.85, 0.0);
    acc += s * w; wsum += w;
  }
  fragColor = vec4(acc / wsum, 1.0);
}
`

const BRIGHT_SHADER = `${FRAGMENT_HEADER}
uniform sampler2D u_tex; uniform vec2 u_px;
void main(){
  vec2 uv = gl_FragCoord.xy * u_px;
  vec3 c = texture(u_tex, uv).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float w = max(l - 1.02, 0.0) / max(l, 1e-4);
  fragColor = vec4(c * w, 1.0);
}
`

const DOWN_SHADER = `${FRAGMENT_HEADER}
uniform sampler2D u_tex; uniform vec2 u_px;
void main(){
  vec2 uv = gl_FragCoord.xy * u_px * 2.0;
  vec3 c = texture(u_tex, uv).rgb * 4.0;
  c += texture(u_tex, uv + vec2( u_px.x,  u_px.y)).rgb;
  c += texture(u_tex, uv + vec2(-u_px.x,  u_px.y)).rgb;
  c += texture(u_tex, uv + vec2( u_px.x, -u_px.y)).rgb;
  c += texture(u_tex, uv + vec2(-u_px.x, -u_px.y)).rgb;
  fragColor = vec4(c / 8.0, 1.0);
}
`

const UP_SHADER = `${FRAGMENT_HEADER}
uniform sampler2D u_low;
uniform sampler2D u_same;
uniform vec2 u_px;
void main(){
  vec2 uv = gl_FragCoord.xy * u_px;
  vec2 o = u_px * 1.6;
  vec3 c  = texture(u_low, uv + vec2(-o.x * 2.0, 0.0)).rgb;
  c += texture(u_low, uv + vec2( o.x * 2.0, 0.0)).rgb;
  c += texture(u_low, uv + vec2(0.0, -o.y * 2.0)).rgb;
  c += texture(u_low, uv + vec2(0.0,  o.y * 2.0)).rgb;
  c += texture(u_low, uv + vec2(-o.x,  o.y)).rgb * 2.0;
  c += texture(u_low, uv + vec2( o.x,  o.y)).rgb * 2.0;
  c += texture(u_low, uv + vec2(-o.x, -o.y)).rgb * 2.0;
  c += texture(u_low, uv + vec2( o.x, -o.y)).rgb * 2.0;
  fragColor = vec4(c / 12.0 + texture(u_same, uv).rgb, 1.0);
}
`

const FINAL_SHADER = `${FRAGMENT_HEADER}${NOISE_SOURCE}
uniform sampler2D u_scene;
uniform sampler2D u_bloom;
uniform vec2  u_res;
uniform float u_bloomAmt;
uniform float u_ev;
uniform float u_vig;
uniform float u_grain;
uniform float u_gtime;

vec3 aces(vec3 x){
  x *= 0.72;
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec3 hdr = texture(u_scene, uv).rgb;
  hdr += texture(u_bloom, uv).rgb * (u_bloomAmt * 0.55);
  hdr *= exp2(u_ev);

  vec3 col = aces(hdr);

  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col += smoothstep(0.55, 1.0, lum) * vec3(0.014, 0.005, -0.009);
  col += (1.0 - smoothstep(0.0, 0.42, lum)) * vec3(-0.006, 0.002, 0.013);
  col = mix(vec3(lum), col, 1.045);

  vec2 c = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float vig = pow(max(cos(length(c) * 0.86), 0.0), 3.0);
  col *= mix(1.0, vig, u_vig);

  float g = hash21(gl_FragCoord.xy + fract(floor(u_gtime * 24.0) * 0.6180339) * 311.7) - 0.5;
  col += g * u_grain * (0.35 + 0.65 * (1.0 - lum));
  col += (hash21(gl_FragCoord.xy * 1.37 + 91.3) - 0.5) / 255.0;

  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  fragColor = vec4(col, 1.0);
}
`

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function compileShader(gl, type, source, label) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader)
    const head = source.split('\n').slice(0, 4).join(' / ')
    gl.deleteShader(shader)
    throw new Error(`atmospheres: ${label} shader compile failed - ${error || 'no log'} - ${head}`)
  }
  return shader
}

function createProgram(gl, fragmentSource, uniforms) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER, 'vertex')
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource, 'fragment')
  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'a_position')
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`atmospheres: program link failed - ${error}`)
  }
  return {
    id: program,
    u: Object.fromEntries(uniforms.map((name) => [name, gl.getUniformLocation(program, name)])),
  }
}

export const ANDO_SORA_DEFAULTS = {
  warmth: DEFAULT_PARAMS.warm,
  clouds: DEFAULT_PARAMS.coverage,
  softness: DEFAULT_PARAMS.soft,
  drift: DEFAULT_PARAMS.drift,
  grain: DEFAULT_PARAMS.grain,
}

function resolveParams(settings = {}) {
  const wind = resolveWind(settings.wind)
  return {
    ...DEFAULT_PARAMS,
    warm: clamp(Number.isFinite(settings.warmth) ? settings.warmth : DEFAULT_PARAMS.warm, 0, 1),
    coverage: clamp(Number.isFinite(settings.clouds) ? settings.clouds : DEFAULT_PARAMS.coverage, 0, 1),
    soft: clamp(Number.isFinite(settings.softness) ? settings.softness : DEFAULT_PARAMS.soft, 0, 1),
    drift: clamp(Number.isFinite(settings.drift) ? settings.drift : DEFAULT_PARAMS.drift, 0, 3),
    grain: clamp(Number.isFinite(settings.grain) ? settings.grain : DEFAULT_PARAMS.grain, 0, 0.08),
    windX: wind[0],
    windY: wind[1],
  }
}

function resolveWind(wind) {
  if (!Array.isArray(wind) || wind.length < 2) return DEFAULT_WIND
  const x = Number(wind[0])
  const y = Number(wind[1])
  const length = Math.hypot(x, y)
  if (!Number.isFinite(length) || length < 0.001) return DEFAULT_WIND
  return [x / length, y / length]
}

export function createAndoSoraSkyRenderer(canvas, initialSettings = {}, onReady) {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  })

  if (!gl) return null

  gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')

  let params = resolveParams(initialSettings)
  let programs = null
  let vao = null
  let buffer = null
  let targets = null
  let width = 0
  let height = 0
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  let downgraded = false
  let skyTime = 40
  let grainTime = 0
  let running = false
  let enabled = true
  let visible = !document.hidden
  let intersecting = !('IntersectionObserver' in window)
  let raf = 0
  let lastTick = 0
  let slowFrames = 0
  let ready = false

  function initPrograms() {
    vao = gl.createVertexArray()
    gl.bindVertexArray(vao)
    buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
    programs = {
      sora: createProgram(gl, SORA_SHADER, ['u_res', 'u_time', 'u_seed', 'u_sunPos', 'u_glow', 'u_warm', 'u_coverage', 'u_soft', 'u_scale', 'u_billow', 'u_cirrus', 'u_haze', 'u_wind']),
      defocus: createProgram(gl, DEFOCUS_SHADER, ['u_tex', 'u_res', 'u_amount', 'u_edge', 'u_hi', 'u_type', 'u_taps']),
      bright: createProgram(gl, BRIGHT_SHADER, ['u_tex', 'u_px']),
      down: createProgram(gl, DOWN_SHADER, ['u_tex', 'u_px']),
      up: createProgram(gl, UP_SHADER, ['u_low', 'u_same', 'u_px']),
      final: createProgram(gl, FINAL_SHADER, ['u_scene', 'u_bloom', 'u_res', 'u_bloomAmt', 'u_ev', 'u_vig', 'u_grain', 'u_gtime']),
    }
  }

  function createTarget(targetWidth, targetHeight) {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, targetWidth, targetHeight, 0, gl.RGBA, gl.HALF_FLOAT, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    return { tex, fbo, w: targetWidth, h: targetHeight }
  }

  function disposeTargets() {
    if (!targets) return
    const allTargets = [targets.scene, targets.lens, ...targets.bloomA, ...targets.bloomB]
    allTargets.forEach((target) => {
      gl.deleteTexture(target.tex)
      gl.deleteFramebuffer(target.fbo)
    })
    targets = null
  }

  function allocateTargets(targetWidth, targetHeight) {
    disposeTargets()
    const halfWidth = Math.max(1, targetWidth >> 1)
    const halfHeight = Math.max(1, targetHeight >> 1)
    const bloomA = []
    const bloomB = []
    for (let i = 0; i < 3; i += 1) {
      const bloomWidth = Math.max(1, targetWidth >> (i + 1))
      const bloomHeight = Math.max(1, targetHeight >> (i + 1))
      bloomA.push(createTarget(bloomWidth, bloomHeight))
      if (i < 2) bloomB.push(createTarget(bloomWidth, bloomHeight))
    }
    targets = {
      scene: createTarget(halfWidth, halfHeight),
      lens: createTarget(halfWidth, halfHeight),
      bloomA,
      bloomB,
    }
  }

  function setStaticUniforms() {
    if (!programs || !targets) return
    let program = programs.sora
    gl.useProgram(program.id)
    gl.uniform2f(program.u.u_res, targets.scene.w, targets.scene.h)
    gl.uniform1f(program.u.u_seed, SKY_SEED)
    gl.uniform2f(program.u.u_sunPos, params.sunX, params.sunY)
    gl.uniform1f(program.u.u_glow, params.glow)
    gl.uniform1f(program.u.u_warm, params.warm)
    gl.uniform1f(program.u.u_coverage, params.coverage)
    gl.uniform1f(program.u.u_soft, params.soft)
    gl.uniform1f(program.u.u_scale, params.scale)
    gl.uniform1f(program.u.u_billow, params.billow)
    gl.uniform1f(program.u.u_cirrus, params.cirrus)
    gl.uniform1f(program.u.u_haze, params.haze)
    gl.uniform2f(program.u.u_wind, params.windX, params.windY)

    program = programs.defocus
    gl.useProgram(program.id)
    gl.uniform2f(program.u.u_res, targets.lens.w, targets.lens.h)
    gl.uniform1f(program.u.u_amount, 0.028 * CAMERA_PARAMS.defocus)
    gl.uniform1f(program.u.u_edge, CAMERA_PARAMS.edge)
    gl.uniform1f(program.u.u_hi, CAMERA_PARAMS.highlights)
    gl.uniform1f(program.u.u_type, CAMERA_PARAMS.type)
    gl.uniform1i(program.u.u_taps, 8)

    program = programs.final
    gl.useProgram(program.id)
    gl.uniform2f(program.u.u_res, width, height)
    gl.uniform1f(program.u.u_bloomAmt, params.bloom)
    gl.uniform1f(program.u.u_ev, params.ev)
    gl.uniform1f(program.u.u_vig, params.vig)
    gl.uniform1f(program.u.u_grain, params.grain)
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    const nextWidth = Math.max(1, Math.round(rect.width * dpr))
    const nextHeight = Math.max(1, Math.round(rect.height * dpr))
    if (nextWidth === width && nextHeight === height && targets) return false
    width = nextWidth
    height = nextHeight
    canvas.width = width
    canvas.height = height
    allocateTargets(width, height)
    setStaticUniforms()
    return true
  }

  function bindRenderTarget(program, target) {
    gl.useProgram(program.id)
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null)
    gl.viewport(0, 0, target ? target.w : width, target ? target.h : height)
  }

  function bindTexture(unit, tex, uniform) {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(uniform, unit)
  }

  function draw() {
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function render() {
    if (!targets || !programs) return
    gl.bindVertexArray(vao)

    let program = programs.sora
    bindRenderTarget(program, targets.scene)
    gl.uniform1f(program.u.u_time, skyTime)
    draw()

    let scene = targets.scene
    if (CAMERA_PARAMS.defocus > 0.001) {
      program = programs.defocus
      bindRenderTarget(program, targets.lens)
      bindTexture(0, scene.tex, program.u.u_tex)
      draw()
      scene = targets.lens
    }

    program = programs.bright
    bindRenderTarget(program, targets.bloomA[0])
    bindTexture(0, scene.tex, program.u.u_tex)
    gl.uniform2f(program.u.u_px, 1 / targets.bloomA[0].w, 1 / targets.bloomA[0].h)
    draw()

    for (let i = 1; i < 3; i += 1) {
      program = programs.down
      bindRenderTarget(program, targets.bloomA[i])
      bindTexture(0, targets.bloomA[i - 1].tex, program.u.u_tex)
      gl.uniform2f(program.u.u_px, 1 / targets.bloomA[i - 1].w, 1 / targets.bloomA[i - 1].h)
      draw()
    }

    let low = targets.bloomA[2]
    for (let i = 1; i >= 0; i -= 1) {
      program = programs.up
      bindRenderTarget(program, targets.bloomB[i])
      bindTexture(0, low.tex, program.u.u_low)
      bindTexture(1, targets.bloomA[i].tex, program.u.u_same)
      gl.uniform2f(program.u.u_px, 1 / targets.bloomB[i].w, 1 / targets.bloomB[i].h)
      draw()
      low = targets.bloomB[i]
    }

    program = programs.final
    bindRenderTarget(program, null)
    bindTexture(0, scene.tex, program.u.u_scene)
    bindTexture(1, targets.bloomB[0].tex, program.u.u_bloom)
    gl.uniform1f(program.u.u_gtime, grainTime)
    draw()

    if (!ready) {
      ready = true
      onReady?.()
    }
  }

  function tick(now) {
    if (!running) return
    raf = window.requestAnimationFrame(tick)
    const elapsed = now - lastTick
    if (elapsed < 49) return
    lastTick = now
    const delta = Math.min(elapsed / 1000, 0.05)
    skyTime += delta * params.drift
    grainTime += delta
    render()
    if (!downgraded && dpr > 1) {
      if (elapsed > 75) {
        slowFrames += 1
        if (slowFrames >= 30) {
          downgraded = true
          dpr = 1
          if (resize()) render()
        }
      } else {
        slowFrames = 0
      }
    }
  }

  function start() {
    if (running || !enabled || !visible || !intersecting || !targets) return
    running = true
    lastTick = performance.now() - 50
    raf = window.requestAnimationFrame(tick)
  }

  function stop() {
    running = false
    if (raf) {
      window.cancelAnimationFrame(raf)
      raf = 0
    }
  }

  function syncRunning() {
    if (enabled && visible && intersecting) start()
    else stop()
  }

  const intersectionObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      intersecting = entries[entries.length - 1]?.isIntersecting ?? true
      syncRunning()
    }, { threshold: 0 })
    : null

  function handleVisibilityChange() {
    visible = !document.hidden
    syncRunning()
  }

  function handleResize() {
    if (resize()) render()
  }

  function handleContextLost(event) {
    event.preventDefault()
    stop()
  }

  function handleContextRestored() {
    programs = null
    targets = null
    width = 0
    height = 0
    downgraded = false
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    initPrograms()
    resize()
    render()
    syncRunning()
  }

  function disposePrograms() {
    if (!programs) return
    Object.values(programs).forEach((program) => gl.deleteProgram(program.id))
    programs = null
  }

  function dispose() {
    stop()
    intersectionObserver?.disconnect()
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('resize', handleResize)
    canvas.removeEventListener('webglcontextlost', handleContextLost)
    canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    disposeTargets()
    disposePrograms()
    if (buffer) gl.deleteBuffer(buffer)
    if (vao) gl.deleteVertexArray(vao)
  }

  try {
    initPrograms()
    resize()
    render()
  } catch (error) {
    console.warn('Ando Sora sky failed', error)
    dispose()
    return null
  }

  intersectionObserver?.observe(canvas)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', handleResize)
  canvas.addEventListener('webglcontextlost', handleContextLost, false)
  canvas.addEventListener('webglcontextrestored', handleContextRestored, false)
  start()

  return {
    update(nextSettings = {}) {
      params = resolveParams(nextSettings)
      setStaticUniforms()
      render()
    },
    renderOnce() {
      render()
    },
    dispose,
  }
}

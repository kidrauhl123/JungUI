import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

const largeButtonEases = {
  airtime: CustomEase.create('junguiButtonAirtime', 'M0,0 C0.05,0.356 0.377,0.435 0.5,0.5 0.61,0.558 0.948,0.652 1,1 '),
  rotaaaaate: CustomEase.create('junguiButtonRotate', 'M0,0 C0.148,0.346 0.254,0.444 0.5,0.5 0.751,0.557 0.852,0.646 1,1 '),
}

function useStrokeButton(ref) {
  useEffect(() => {
    const button = ref.current
    if (!button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const flair = button.querySelector('.gsap-stroke-flair')
    const setX = gsap.quickSetter(flair, 'xPercent')
    const setY = gsap.quickSetter(flair, 'yPercent')

    const getXY = (event) => {
      const { left, top, width, height } = button.getBoundingClientRect()
      return {
        x: gsap.utils.clamp(0, 100, gsap.utils.mapRange(0, width, 0, 100, event.clientX - left)),
        y: gsap.utils.clamp(0, 100, gsap.utils.mapRange(0, height, 0, 100, event.clientY - top)),
      }
    }

    const onEnter = (event) => {
      const { x, y } = getXY(event)
      setX(x)
      setY(y)
      gsap.to(flair, { scale: 1, duration: 0.4, ease: 'power2.out' })
    }

    const onMove = (event) => {
      const { x, y } = getXY(event)
      gsap.to(flair, { xPercent: x, yPercent: y, duration: 0.4, ease: 'power2.out' })
    }

    const onLeave = (event) => {
      const { x, y } = getXY(event)
      gsap.killTweensOf(flair)
      gsap.to(flair, {
        xPercent: x > 90 ? x + 20 : x < 10 ? x - 20 : x,
        yPercent: y > 90 ? y + 20 : y < 10 ? y - 20 : y,
        scale: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    button.addEventListener('mouseenter', onEnter)
    button.addEventListener('mousemove', onMove)
    button.addEventListener('mouseleave', onLeave)
    return () => {
      button.removeEventListener('mouseenter', onEnter)
      button.removeEventListener('mousemove', onMove)
      button.removeEventListener('mouseleave', onLeave)
    }
  }, [ref])
}

function useLargeButton(ref) {
  useEffect(() => {
    const root = ref.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const getWord = root.querySelector('[data-word="get"]')
    const gsapWord = root.querySelector('[data-word="gsap"]')
    const flairs = root.querySelectorAll('.gsap-large-flair')

    let playing = false
    const tl = gsap.timeline({
      defaults: { duration: 1 },
      paused: true,
      onStart: () => {
        playing = true
      },
      onComplete: () => {
        playing = false
      },
    })

    gsap.set(flairs, { scale: 0, transformOrigin: '0 0' })

    tl.set(flairs, { scale: 0, x: 0, y: 10, rotateZ: 0, zIndex: 2 })
      .to(getWord, {
        keyframes: [
          { x: -30, ease: 'power4.out' },
          { x: 0, ease: 'power4.in' },
        ],
      })
      .to(
        gsapWord,
        {
          keyframes: [
            { x: 30, ease: 'power4.out' },
            { x: 0, ease: 'power4.in' },
          ],
        },
        '<',
      )
      .to(
        flairs,
        {
          keyframes: [
            { scale: 0, zIndex: 2, duration: 0 },
            { y: () => gsap.utils.random(-80, -120), scale: 1 },
            { zIndex: -1, duration: 0.05 },
            { y: 0, scale: 0.3 },
          ],
          ease: largeButtonEases.airtime,
          stagger: 0.15,
        },
        '<',
      )
      .to(
        flairs,
        {
          x: (index) => index === 1 ? gsap.utils.random(-42, -8) : gsap.utils.random(-50, 100),
          rotateZ: -360,
          ease: largeButtonEases.rotaaaaate,
          stagger: 0.15,
        },
        '<',
      )

    const onEnter = () => {
      if (playing) return
      tl.invalidate().play(0)
    }

    root.addEventListener('mouseenter', onEnter)
    return () => {
      root.removeEventListener('mouseenter', onEnter)
      tl.kill()
    }
  }, [ref])
}

function StrokeButton() {
  const ref = useRef(null)
  useStrokeButton(ref)

  return (
    <div className="gsap-mini-stage">
      <button ref={ref} className="gsap-stroke-button" type="button">
        <span className="gsap-stroke-flair" />
        <span className="gsap-stroke-label">Get GSAP</span>
      </button>
    </div>
  )
}

function SvgNoise() {
  return (
    <svg className="gsap-svg-noise" aria-hidden="true">
      <defs>
        <image id="jungui-gsap-svg-noise" width="500" height="500" href="/gsap-noise.png" />
      </defs>
    </svg>
  )
}

function CirclesFlair() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="url(#jungui-gsap-circles-gradient)" fillRule="evenodd" d="M7.959 10.053a4.368 4.368 0 0 1-.889-.17c-2.327-.7-3.64-3.174-2.933-5.527C4.845 2.002 7.305.662 9.632 1.36c2.327.7 3.64 3.174 2.933 5.528-.06.197-.131.387-.214.57l.46.138c.032-.198.078-.396.137-.593.707-2.353 3.167-3.694 5.494-2.995 2.328.7 3.64 3.175 2.933 5.528-.707 2.353-3.167 3.694-5.494 2.995a4.377 4.377 0 0 1-.745-.3l-.1.333c.261.029.525.082.786.16 2.328.7 3.64 3.175 2.933 5.528-.707 2.353-3.167 3.694-5.494 2.995-2.327-.7-3.64-3.175-2.933-5.528a4.51 4.51 0 0 1 .35-.845l-.54-.163c-.03.265-.085.531-.164.796-.708 2.353-3.168 3.694-5.495 2.994-2.327-.7-3.64-3.174-2.933-5.527.708-2.354 3.168-3.694 5.495-2.995.295.089.574.206.835.349l.083-.276Z" clipRule="evenodd" />
      <path fill="url(#jungui-gsap-circles-noise)" fillOpacity=".6" fillRule="evenodd" d="M7.959 10.053a4.368 4.368 0 0 1-.889-.17c-2.327-.7-3.64-3.174-2.933-5.527C4.845 2.002 7.305.662 9.632 1.36c2.327.7 3.64 3.174 2.933 5.528-.06.197-.131.387-.214.57l.46.138c.032-.198.078-.396.137-.593.707-2.353 3.167-3.694 5.494-2.995 2.328.7 3.64 3.175 2.933 5.528-.707 2.353-3.167 3.694-5.494 2.995a4.377 4.377 0 0 1-.745-.3l-.1.333c.261.029.525.082.786.16 2.328.7 3.64 3.175 2.933 5.528-.707 2.353-3.167 3.694-5.494 2.995-2.327-.7-3.64-3.175-2.933-5.528a4.51 4.51 0 0 1 .35-.845l-.54-.163c-.03.265-.085.531-.164.796-.708 2.353-3.168 3.694-5.495 2.994-2.327-.7-3.64-3.174-2.933-5.527.708-2.354 3.168-3.694 5.495-2.995.295.089.574.206.835.349l.083-.276Z" clipRule="evenodd" />
      <defs>
        <radialGradient id="jungui-gsap-circles-gradient" cx="0" cy="0" r="1" gradientTransform="rotate(-31.559 22.628 3.049) scale(17.064 11.3981)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD9B0" />
          <stop offset=".807" stopColor="#FD9F3B" />
          <stop offset="1" stopColor="#FF8709" />
        </radialGradient>
        <pattern id="jungui-gsap-circles-noise" width="5.556" height="5.556" patternContentUnits="objectBoundingBox">
          <use href="#jungui-gsap-svg-noise" transform="scale(.01111)" />
        </pattern>
      </defs>
    </svg>
  )
}

function WindmillFlair() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="62" height="63" viewBox="0 0 62 63" aria-hidden="true">
      <path fill="url(#jungui-gsap-windmill-gradient)" d="m34.246 27.525 10.197-13.201a.26.26 0 0 1 .362-.047L61.76 27.372a.26.26 0 0 1 .046.366c-7.386 9.336-20.882 11.074-30.391 3.919l16.975 13.112c.112.087.133.25.046.362L35.34 62.085a.26.26 0 0 1-.365.046c-9.41-7.444-11.1-21.093-3.746-30.616l-13.255 17.16a.259.259 0 0 1-.362.046L.658 35.626a.26.26 0 0 1-.046-.365c7.386-9.337 20.881-11.074 30.391-3.92l-16.935-13.08a.259.259 0 0 1-.047-.363L27.117.944a.26.26 0 0 1 .365-.046c8.08 6.393 10.469 17.361 6.326 26.362-.129.278.25.508.439.264l-.001.001Z" />
      <path fill="url(#jungui-gsap-windmill-noise)" fillOpacity=".6" d="m34.246 27.525 10.197-13.201a.26.26 0 0 1 .362-.047L61.76 27.372a.26.26 0 0 1 .046.366c-7.386 9.336-20.882 11.074-30.391 3.919l16.975 13.112c.112.087.133.25.046.362L35.34 62.085a.26.26 0 0 1-.365.046c-9.41-7.444-11.1-21.093-3.746-30.616l-13.255 17.16a.259.259 0 0 1-.362.046L.658 35.626a.26.26 0 0 1-.046-.365c7.386-9.337 20.881-11.074 30.391-3.92l-16.935-13.08a.259.259 0 0 1-.047-.363L27.117.944a.26.26 0 0 1 .365-.046c8.08 6.393 10.469 17.361 6.326 26.362-.129.278.25.508.439.264l-.001.001Z" />
      <defs>
        <radialGradient id="jungui-gsap-windmill-gradient" cx="0" cy="0" r="1" gradientTransform="rotate(-142.317 24.316 16.274) scale(34.5669)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F0FCFF" />
          <stop offset=".672" stopColor="#9BEDFF" />
          <stop offset=".76" stopColor="#98ECFF" />
          <stop offset=".849" stopColor="#5BE1FF" />
          <stop offset=".948" stopColor="#00BAE2" />
        </radialGradient>
        <pattern id="jungui-gsap-windmill-noise" width="2.279" height="2.279" patternContentUnits="objectBoundingBox">
          <use href="#jungui-gsap-svg-noise" transform="scale(.00456)" />
        </pattern>
      </defs>
    </svg>
  )
}

function SquareFlair() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="19" height="19" viewBox="0 0 19 19" aria-hidden="true">
      <path fill="url(#jungui-gsap-square-gradient)" d="M.27 7.683a1 1 0 0 1 .372-1.364L10.995.409a1 1 0 0 1 1.364.373l5.91 10.352a1 1 0 0 1-.373 1.365l-10.353 5.91a1 1 0 0 1-1.364-.373L.27 7.683Z" />
      <path fill="url(#jungui-gsap-square-noise)" fillOpacity=".6" d="M.27 7.683a1 1 0 0 1 .372-1.364L10.995.409a1 1 0 0 1 1.364.373l5.91 10.352a1 1 0 0 1-.373 1.365l-10.353 5.91a1 1 0 0 1-1.364-.373L.27 7.683Z" />
      <defs>
        <linearGradient id="jungui-gsap-square-gradient" x1="24.297" x2="3.329" y1="7.113" y2="17.933" gradientUnits="userSpaceOnUse">
          <stop offset=".144" stopColor="#FFE9FE" />
          <stop offset="1" stopColor="#FF96F9" />
        </linearGradient>
        <pattern id="jungui-gsap-square-noise" width="5.08" height="5.08" patternContentUnits="objectBoundingBox">
          <use href="#jungui-gsap-svg-noise" transform="scale(.01016)" />
        </pattern>
      </defs>
    </svg>
  )
}

function StarFlair() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="url(#jungui-gsap-star-gradient)" fillRule="evenodd" d="m6.324 7.326-4.936-.849a1.078 1.078 0 0 0-.374 2.124l4.93.887-4.091 2.89a1.078 1.078 0 0 0 1.238 1.766l4.112-2.858-.849 4.936a1.078 1.078 0 0 0 2.124.374l.887-4.93 2.89 4.09a1.078 1.078 0 0 0 1.766-1.238l-2.858-4.111 4.936.848a1.078 1.078 0 0 0 .374-2.124l-4.93-.887 4.09-2.89a1.078 1.078 0 0 0-1.238-1.766l-4.111 2.858.848-4.935a1.078 1.078 0 0 0-2.124-.374l-.886 4.93-2.89-4.091a1.078 1.078 0 0 0-1.766 1.238l2.858 4.112Z" clipRule="evenodd" />
      <path fill="url(#jungui-gsap-star-noise)" fillOpacity=".6" fillRule="evenodd" d="m6.324 7.326-4.936-.849a1.078 1.078 0 0 0-.374 2.124l4.93.887-4.091 2.89a1.078 1.078 0 0 0 1.238 1.766l4.112-2.858-.849 4.936a1.078 1.078 0 0 0 2.124.374l.887-4.93 2.89 4.09a1.078 1.078 0 0 0 1.766-1.238l-2.858-4.111 4.936.848a1.078 1.078 0 0 0 .374-2.124l-4.93-.887 4.09-2.89a1.078 1.078 0 0 0-1.238-1.766l-4.111 2.858.848-4.935a1.078 1.078 0 0 0-2.124-.374l-.886 4.93-2.89-4.091a1.078 1.078 0 0 0-1.766 1.238l2.858 4.112Z" clipRule="evenodd" style={{ mixBlendMode: 'multiply' }} />
      <defs>
        <linearGradient id="jungui-gsap-star-gradient" x1="24.729" x2="25.351" y1="8.665" y2="20.075" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0AE448" />
          <stop offset="1" stopColor="#0085D0" />
        </linearGradient>
        <pattern id="jungui-gsap-star-noise" width="11.452" height="11.452" patternContentUnits="objectBoundingBox">
          <use href="#jungui-gsap-svg-noise" transform="scale(.0229)" />
        </pattern>
      </defs>
    </svg>
  )
}

function LargeButton() {
  const ref = useRef(null)
  useLargeButton(ref)

  return (
    <div className="gsap-large-stage">
      <SvgNoise />
      <div ref={ref} className="gsap-large-wrap">
        <span className="gsap-large-flair gsap-large-flair--circles"><CirclesFlair /></span>
        <span className="gsap-large-flair gsap-large-flair--windmill"><WindmillFlair /></span>
        <span className="gsap-large-flair gsap-large-flair--square"><SquareFlair /></span>
        <span className="gsap-large-flair gsap-large-flair--star"><StarFlair /></span>
        <button className="gsap-large-button" type="button">
          <span className="gsap-large-word" data-word="get">Get</span>
          <span className="gsap-large-word" data-word="gsap">GSAP</span>
        </button>
      </div>
    </div>
  )
}

export default function GsapButtons() {
  return (
    <div className="item gsap-buttons-item">
      <div className="gsap-buttons-demo">
        <StrokeButton />
        <LargeButton />
      </div>
      <div className="caption">
        <div className="name">GSAP 按钮 / Stroke + CTA</div>
        <div className="note">小按钮：鼠标点位液态填充 · 大按钮：文字回弹、小装饰弹出后落回</div>
      </div>
    </div>
  )
}

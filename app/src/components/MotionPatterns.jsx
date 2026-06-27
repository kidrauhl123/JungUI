import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MAXIMA_CARDS = [
  {
    title: 'Adaptive Skills',
    desc: '把复杂流程拆成可以重复练习的小步骤。',
    asset: '/ui-assets/maxima/inline-svg/badge-sunburst.svg',
    bg: '#00b351',
    titleColor: '#fdcb40',
    textColor: '#ffffff',
  },
  {
    title: 'Evidence Based',
    desc: '用清楚的规则、反馈和节奏建立可信的行为模式。',
    asset: '/ui-assets/maxima/inline-svg/pattern-balloon-red.svg',
    bg: '#2668fd',
    titleColor: '#fdcb40',
    textColor: '#ffffff',
  },
  {
    title: 'Gentle Systems',
    desc: '让图形语言参与叙事，而不是只做装饰。',
    asset: '/ui-assets/maxima/inline-svg/butterfly-teal.svg',
    bg: '#ffffff',
    titleColor: '#00b351',
    textColor: '#1a1a1a',
  },
  {
    title: 'Caregiver Flow',
    desc: '一张张抽走卡片，留下明确的阶段感和前进感。',
    asset: '/ui-assets/maxima/inline-svg/cloud-bubbles.svg',
    bg: '#fd4401',
    titleColor: '#fff2b7',
    textColor: '#ffffff',
  },
]

const ROTATIONS = [0.01, -11, 7, -3.82]
const BELIEF_LINES = [
  'We believe independence grows when',
  'children are supported with care,',
  'respect, and the freedom to learn at their',
  'own pace.',
]

export function MotionPatterns() {
  return (
    <div className="item motion-pattern-item">
      <a className="motion-pattern-preview" href="/patterns/maxima-card-stack/" target="_top" aria-label="打开 Maxima 风格滚动卡片堆">
        <div className="motion-preview-stage" aria-hidden="true">
          {MAXIMA_CARDS.map((card, index) => (
            <span
              className="motion-preview-card"
              key={card.title}
              style={{
                '--preview-bg': card.bg,
                '--preview-ink': card.titleColor,
                '--preview-x': `${(index - 1.5) * 38}px`,
                '--preview-y': `${Math.abs(index - 1.5) * 9}px`,
                '--preview-rotate': `${ROTATIONS[index]}deg`,
                zIndex: MAXIMA_CARDS.length - index,
              }}
            >
              <img src={card.asset} alt="" />
            </span>
          ))}
        </div>
        <div className="motion-preview-copy">
          <strong>Maxima Therapy</strong>
        </div>
      </a>
      <div className="caption">
        <div className="name">翻转卡片堆</div>
      </div>
    </div>
  )
}

export function MaximaCardStackPage() {
  const rootRef = useRef(null)
  const beliefRef = useRef(null)
  const layerRefs = useRef([])
  const cardRefs = useRef([])
  const nudgeRefs = useRef([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const contexts = []
    const ctx = gsap.context(() => {
      const sticky = root.querySelector('.maxima-scroll-sticky')
      const flipStage = root.querySelector('.maxima-flip-stage')
      const coverCard = root.querySelector('.maxima-cover-card')
      const scrollTrack = root.querySelector('.maxima-scroll-track')
      const layers = layerRefs.current.filter(Boolean)
      const cards = cardRefs.current.filter(Boolean)
      if (!sticky || !flipStage || !coverCard || !scrollTrack || !layers.length || !cards.length) return

      gsap.set(cards, { rotate: 0 })
      gsap.set(flipStage, { rotateY: 0 })
      gsap.set(coverCard, { y: 0 })
      gsap.to(coverCard, {
        y: () => {
          const startTop = Number.parseFloat(window.getComputedStyle(coverCard).top) || 0
          const centeredTop = (window.innerHeight - coverCard.offsetHeight) / 2
          return centeredTop - startTop
        },
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight}`,
          invalidateOnRefresh: true,
          scrub: true,
        },
      })

      ScrollTrigger.create({
        trigger: root,
        start: () => `top top-=${window.innerHeight}`,
        onEnter: () => {
          gsap.killTweensOf(flipStage)
          gsap.to(flipStage, {
            rotateY: 180,
            duration: reduceMotion ? 0 : 1,
            ease: 'power3.out',
          })
          gsap.to(cards, {
            rotate: (index) => ROTATIONS[index] || 0,
            delay: reduceMotion ? 0 : 0.5,
            duration: reduceMotion ? 0 : 1.2,
            ease: 'elastic.out(2, 0.8)',
            overwrite: true,
          })
        },
        onLeaveBack: () => {
          gsap.killTweensOf(flipStage)
          gsap.to(flipStage, {
            rotateY: 0,
            duration: reduceMotion ? 0 : 1,
            ease: 'power3.out',
          })
          gsap.to(cards, {
            rotate: 0,
            duration: reduceMotion ? 0 : 0.6,
            overwrite: true,
          })
        },
      })

      ScrollTrigger.create({
        trigger: scrollTrack,
        start: 'top top',
        end: 'bottom center',
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress
          layers.forEach((layer, index) => {
            const phase = gsap.utils.clamp(
              0,
              1,
              gsap.utils.mapRange(index / layers.length, (index + 1.5) / layers.length, 0, 1, progress),
            )
            const direction = Math.sign(ROTATIONS[index] || 1)
            gsap.to(layer, {
              yPercent: -100 * phase,
              duration: reduceMotion ? 0 : 0.8,
              ease: 'elastic.out(1, 0.5)',
              overwrite: true,
            })
            gsap.to(cards[index], {
              rotate: (ROTATIONS[index] || 0) + phase * 40 * direction,
              duration: reduceMotion ? 0 : 0.8,
              ease: 'elastic.out(1, 0.5)',
              overwrite: true,
            })
          })
        },
      })

      ScrollTrigger.refresh()
    }, root)
    contexts.push(ctx)

    const belief = beliefRef.current
    if (belief) {
      const beliefCtx = gsap.context(() => {
        const lines = gsap.utils.toArray('.maxima-belief-line')
        const cta = belief.querySelector('.maxima-belief-cta')
        const clouds = gsap.utils.toArray('.maxima-belief-cloud')

        if (reduceMotion) {
          gsap.set([...lines, cta, ...clouds].filter(Boolean), { clearProps: 'all', scale: 1, yPercent: 0 })
          return
        }

        gsap.set(lines, {
          scaleY: 0,
          transformOrigin: 'bottom center',
          yPercent: 200,
        })
        gsap.set(cta, { scale: 0, transformOrigin: 'center center' })
        gsap.fromTo(
          clouds,
          { scale: 0, transformOrigin: 'center center' },
          {
            scale: 1,
            duration: 1.2,
            ease: 'elastic.out(1, 1)',
            stagger: 0.05,
            scrollTrigger: {
              trigger: belief,
              start: 'top bottom',
              toggleActions: 'play none none reverse',
            },
          },
        )

        ScrollTrigger.create({
          trigger: belief,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => {
            gsap.fromTo(lines, {
              yPercent: 200,
              scaleY: 0,
            }, {
              yPercent: 0,
              scaleY: 1,
              duration: 0.9,
              ease: 'elastic.out(1.2, 0.8)',
              stagger: 0.1,
            })
          },
          onLeaveBack: () => {
            gsap.to(lines, {
              scaleY: 0,
              duration: 0.8,
              ease: 'expo.out',
              stagger: 0.1,
              overwrite: true,
            })
          },
        })

        gsap.fromTo(cta, {
          scale: 0,
        }, {
          scale: 1,
          duration: 1,
          ease: 'elastic.out(1.2, 1)',
          scrollTrigger: {
            trigger: cta,
            start: 'top 75%',
            end: 'bottom top',
            toggleActions: 'play reverse play reverse',
          },
        })
      }, belief)
      contexts.push(beliefCtx)
    }

    return () => contexts.forEach((context) => context.revert())
  }, [])

  function handlePointerEnter(index, event) {
    const node = nudgeRefs.current[index]
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = node.getBoundingClientRect()
    const dx = ((event.clientX - rect.left) / rect.width - 0.5) * -34
    const dy = ((event.clientY - rect.top) / rect.height - 0.5) * -26
    gsap.killTweensOf(node)
    gsap.fromTo(node, { x: dx, y: dy }, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1.2, 0.8)' })
  }

  function handleBeliefCtaEnter(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.killTweensOf(event.currentTarget)
    gsap.to(event.currentTarget, {
      scale: 1.08,
      duration: 0.8,
      ease: 'elastic.out(1.7, 0.7)',
      overwrite: true,
    })
  }

  function handleBeliefCtaLeave(event) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.killTweensOf(event.currentTarget)
    gsap.to(event.currentTarget, {
      scale: 1,
      duration: 0.9,
      ease: 'elastic.out(1.6, 0.8)',
      overwrite: true,
    })
  }

  return (
    <main className="pattern-page">
      <nav className="pattern-topbar" aria-label="页面导航">
        <a href="/">JungUI</a>
        <span>Motion Pattern</span>
      </nav>

      <section
        className="maxima-scroll-root"
        ref={rootRef}
        style={{ '--stack-count': MAXIMA_CARDS.length }}
      >
        <div className="maxima-scroll-bg" />
        <DecorativeClouds />
        <div className="maxima-scroll-track" />
        <div className="maxima-scroll-sticky">
          <div className="maxima-flip-stage">
            <div className="maxima-flip-face maxima-flip-face--front">
              <article className="maxima-cover-card">
                <span className="maxima-cover-title">Adaptive Skills Training</span>
                <span className="maxima-cover-age">Ages 3-18</span>
                <span className="maxima-cover-art">
                  <img src="/ui-assets/maxima/inline-svg/pattern-balloon-red.svg" alt="" />
                </span>
                <span className="maxima-cover-copy">Helping kids help themselves through essential life skills.</span>
              </article>
            </div>

            <div className="maxima-flip-face maxima-flip-face--back">
              <div className="maxima-card-scene">
                {MAXIMA_CARDS.map((card, index) => (
                  <div
                    className="maxima-service-layer"
                    key={card.title}
                    ref={(node) => {
                      layerRefs.current[index] = node
                    }}
                    style={{ zIndex: MAXIMA_CARDS.length + 1 - index }}
                  >
                    <button
                      className="maxima-stack-hit"
                      type="button"
                      onPointerEnter={(event) => handlePointerEnter(index, event)}
                    >
                      <span
                        className="maxima-stack-nudge"
                        ref={(node) => {
                          nudgeRefs.current[index] = node
                        }}
                      >
                        <span
                          className="maxima-stack-card"
                          ref={(node) => {
                            cardRefs.current[index] = node
                          }}
                          style={{
                            '--card-bg': card.bg,
                            '--card-title': card.titleColor,
                            '--card-text': card.textColor,
                          }}
                        >
                          <span className="maxima-stack-title">{card.title}</span>
                          <span className="maxima-stack-art">
                            <img src={card.asset} alt="" />
                          </span>
                          <span className="maxima-stack-desc">{card.desc}</span>
                        </span>
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <MaximaBeliefSection
        refNode={beliefRef}
        onCtaEnter={handleBeliefCtaEnter}
        onCtaLeave={handleBeliefCtaLeave}
      />
    </main>
  )
}

function MaximaBeliefSection({ refNode, onCtaEnter, onCtaLeave }) {
  return (
    <section className="maxima-belief-section" ref={refNode} aria-label="Maxima Therapy statement motion">
      <img
        className="maxima-belief-cloud maxima-belief-cloud--upper"
        src="/ui-assets/maxima/inline-svg/cloud-arch.svg"
        alt=""
      />
      <img
        className="maxima-belief-cloud maxima-belief-cloud--lower"
        src="/ui-assets/maxima/inline-svg/cloud-arch.svg"
        alt=""
      />
      <span className="maxima-belief-blue maxima-belief-blue--left-a" />
      <span className="maxima-belief-blue maxima-belief-blue--left-b" />
      <span className="maxima-belief-blue maxima-belief-blue--center" />
      <span className="maxima-belief-blue maxima-belief-blue--right-a" />
      <span className="maxima-belief-blue maxima-belief-blue--right-b" />

      <div className="maxima-belief-content">
        <h2 className="maxima-belief-title">
          {BELIEF_LINES.map((line) => (
            <span className="maxima-belief-line" key={line}>
              {line}
            </span>
          ))}
        </h2>
        <button
          className="maxima-belief-cta"
          type="button"
          onPointerEnter={onCtaEnter}
          onPointerLeave={onCtaLeave}
        >
          <svg
            className="maxima-belief-cta-shape"
            width="140"
            height="140"
            viewBox="0 0 140 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              className="maxima-belief-cta-circle"
              d="M70,5 L70,5 C105.88,5 135,34.12 135,70 L135,70 C135,105.88 105.88,135 70,135 L70,135 C34.12,135 5,105.88 5,70 L5,70 C5,34.12 34.12,5 70,5 Z"
            />
            <path
              className="maxima-belief-cta-rect"
              d="M24.30024916943522,50.69975083056478 L115.69975083056478,50.69975083056478 C126.35348837209303,50.69975083056478 135,59.346262458471756 135,70 L135,70 C135,80.65373754152824 126.35348837209303,89.30024916943522 115.69975083056478,89.30024916943522 L24.30024916943522,89.30024916943522 C13.646511627906976,89.30024916943522 5,80.65373754152824 5,70 L5,70 C5,59.346262458471756 13.646511627906976,50.69975083056478 24.30024916943522,50.69975083056478 Z"
            />
          </svg>
          <span>About Maxima</span>
        </button>
      </div>
    </section>
  )
}

function DecorativeClouds() {
  return (
    <div className="maxima-scroll-decor" aria-hidden="true">
      <img className="decor decor--sun" src="/ui-assets/maxima/inline-svg/badge-sunburst.svg" alt="" />
      <img className="decor decor--cloud-a" src="/ui-assets/maxima/inline-svg/cloud-arch.svg" alt="" />
      <img className="decor decor--cloud-b" src="/ui-assets/maxima/inline-svg/cloud-pill.svg" alt="" />
      <img className="decor decor--butterfly" src="/ui-assets/maxima/inline-svg/butterfly-teal.svg" alt="" />
    </div>
  )
}

// Gallery manifest. Each specimen lives in its own iframe sandbox at
// /specimens/<id>/ (its own HTML entry + build), so any tech stack can be
// collected side by side without style/JS collisions. The `tech` label is just
// an honest badge of what that specimen is actually built with.
export const GALLERY = [
  { cat: '卡片 · Cards', items: [{ id: 'reveal-card', tech: 'React' }] },
  { cat: '卡片堆叠 · Card Stack', items: [{ id: 'card-stack', tech: 'React' }] },
  { cat: '图形语言 · Graphic Systems', items: [{ id: 'graphic-language', tech: 'React' }] },
  { cat: '动效模式 · Motion Patterns', items: [{ id: 'motion-patterns', tech: 'React · Framer Motion' }] },
  {
    cat: '文字动效 · Text Motion',
    items: [
      { id: 'telegraph-text', tech: 'React' },
      { id: 'rainbow-telegraph-text', tech: 'React' },
    ],
  },
  { cat: '背景 · Atmospheric Backgrounds', items: [{ id: 'programmatic-sky', tech: 'React · Canvas' }] },
  { cat: '反馈 · Feedback', items: [{ id: 'terms-nudge', tech: 'React' }] },
  {
    cat: '按钮 · Buttons',
    items: [
      { id: 'gsap-buttons', tech: 'React · GSAP' },
      { id: 'base-cta-button', tech: 'Vanilla HTML/CSS · 源自 Base' },
    ],
  },
  { cat: '切换 · Toggles', items: [{ id: 'theme-toggle', tech: 'React · 源自 EVAA' }] },
]

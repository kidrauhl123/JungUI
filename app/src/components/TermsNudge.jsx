import { useState } from 'react'
import { getTermsAttemptFeedback, getTermsNudgeContent } from '../lib/termsNudge.js'

export default function TermsNudge() {
  const [mode, setMode] = useState('bad')
  const [accepted, setAccepted] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [nudgeTick, setNudgeTick] = useState(0)

  const isGood = mode === 'good'
  const content = getTermsNudgeContent()

  function attemptNext() {
    const feedback = getTermsAttemptFeedback({ mode, accepted })
    setShowMessage(feedback.showMessage)
    if (feedback.nudge) {
      setNudgeTick((tick) => tick + 1)
    }
  }

  function selectMode(nextMode) {
    setMode(nextMode)
    setShowMessage(false)
    setNudgeTick(0)
  }

  return (
    <div className="item terms-nudge-item">
      <div className={`terms-nudge ${isGood ? 'is-good' : 'is-bad'}`}>
        <div className="terms-nudge__panel">
          <h3>{content.title}</h3>
          <p>{content.subtitle}</p>

          <button type="button" className="terms-nudge__next" onClick={attemptNext}>
            {content.primaryAction}
          </button>

          <label
            className={`terms-nudge__terms${nudgeTick ? ' is-nudging' : ''}`}
            key={`terms-${nudgeTick}`}
          >
            <span className="terms-nudge__box" aria-hidden>
              {accepted && (
                <svg viewBox="0 0 18 18" aria-hidden>
                  <path d="m4.2 9.2 3.1 3.1 6.5-7" />
                </svg>
              )}
            </span>
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked)
                setShowMessage(false)
                setNudgeTick(0)
              }}
            />
            <span>I accept the <b>Terms &amp; Conditions</b></span>
          </label>

          <div className="terms-nudge__feedback" aria-live="polite">
            {showMessage && (
              <span>You must accept the Terms &amp; Conditions to continue.</span>
            )}
          </div>
        </div>

        <div className="terms-nudge__switch" role="tablist" aria-label="反馈模式">
          <button
            type="button"
            className={!isGood ? 'is-active' : ''}
            aria-selected={!isGood}
            role="tab"
            onClick={() => selectMode('bad')}
          >
            Bad
          </button>
          <button
            type="button"
            className={isGood ? 'is-active' : ''}
            aria-selected={isGood}
            role="tab"
            onClick={() => selectMode('good')}
          >
            Good
          </button>
        </div>
      </div>

      <div className="caption">
        <div className="name">条款错误提示 · Nudge Instead</div>
        <div className="note">Bad：红字打断。Good：只让未勾选项轻轻动一下。</div>
      </div>
    </div>
  )
}

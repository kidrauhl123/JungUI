export function getTermsAttemptFeedback({ mode, accepted }) {
  if (accepted) {
    return { showMessage: false, nudge: false }
  }

  if (mode === 'good') {
    return { showMessage: false, nudge: true }
  }

  return { showMessage: true, nudge: false }
}

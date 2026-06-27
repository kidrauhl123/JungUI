// Each specimen runs inside its own iframe sandbox. It reports its content
// height up to the gallery shell so the shell can size the iframe to fit.
// The shell matches messages by event.source === iframe.contentWindow.
export function reportHeight() {
  const send = () => {
    const h = Math.ceil(document.documentElement.getBoundingClientRect().height)
    parent.postMessage({ source: 'jungui-specimen', height: h }, '*')
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(send).observe(document.documentElement)
  }
  window.addEventListener('load', send)
  requestAnimationFrame(send)
  // a couple of late sends to catch font swaps / async layout
  setTimeout(send, 300)
  setTimeout(send, 1200)
}

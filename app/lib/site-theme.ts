export const THEME_KEY = "jungui-theme";
export const THEME_EVENT = "jungui-theme-change";

// Runs before first paint; also keeps same-origin previews and tabs in sync.
export const themeInitScript = `(() => {
  const read = () => { try { return localStorage.getItem('${THEME_KEY}'); } catch { return null; } };
  const apply = () => {
    const saved = read();
    document.documentElement.dataset.theme = saved === 'light' ? 'light' : 'dark';
    window.dispatchEvent(new Event('${THEME_EVENT}'));
  };
  apply();
  window.addEventListener('storage', event => { if (event.key === '${THEME_KEY}' || event.key === null) apply(); });
})();`;

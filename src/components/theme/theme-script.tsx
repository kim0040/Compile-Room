const THEME_SCRIPT = `
(function() {
  var storageKey = "compileroom-theme";
  var mediaQuery = "(prefers-color-scheme: dark)";
  var root = document.documentElement;
  function isTheme(value) {
    return value === "light" || value === "dark" || value === "system";
  }
  function getStoredTheme() {
    try {
      var stored = localStorage.getItem(storageKey);
      return isTheme(stored) ? stored : "system";
    } catch (_) {
      return "system";
    }
  }
  function getSystemPreference() {
    return window.matchMedia(mediaQuery).matches ? "dark" : "light";
  }
  function applyTheme(mode, skipStore) {
    var resolved = mode === "system" ? getSystemPreference() : mode;
    root.dataset.theme = resolved;
    root.dataset.themeMode = mode;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    if (!skipStore) {
      try {
        localStorage.setItem(storageKey, mode);
      } catch (_) {}
    }
  }
  var initial = getStoredTheme();
  applyTheme(initial, true);
})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}

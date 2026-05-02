/**
 * Script injected into <head> to prevent theme FOUC (Flash of Unstyled Content).
 * Needs to be as fast and small as possible since it blocks rendering.
 */
export const themeInitScript = `
  (function() {
    try {
      var isPublicPage = window.location.pathname === '/' || window.location.pathname.startsWith('/auth');
      if (isPublicPage) {
        document.documentElement.classList.remove('dark');
        return;
      }
      
      var stored = window.localStorage.getItem('theme-preference');
      var isDark = false;
      
      if (stored === 'dark') {
        isDark = true;
      } else if (stored === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

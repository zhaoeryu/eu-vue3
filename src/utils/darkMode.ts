export type ThemeMode = 'light' | 'dark' | 'syncOS';
/**
 * 适配深色模式
 * @param {String} theme 主题 light | dark | syncOS
 */
export function darkMode(theme: ThemeMode = 'syncOS') {
  if (theme === 'light') {
    handleDarkMode(false);
    return;
  }
  if (theme === 'dark') {
    handleDarkMode(true);
    return;
  }
  const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  // 判断是否匹配深色模式
  if (darkMode?.matches) {
    handleDarkMode(true);
  } else {
    handleDarkMode(false);
  }
  // 监听主题切换事件
  darkMode?.addEventListener('change', (e) => {
    handleDarkMode(e.matches);
  });
}

export function isDark() {
  return document.documentElement.classList.contains('dark');
}

function handleDarkMode(isDark = false) {
  if (isDark) {
    // document.body.setAttribute('eu-theme', 'dark');
    document.documentElement.classList.add('dark');
  } else {
    // document.body.removeAttribute('eu-theme');
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Language Switcher Block
 * Allows users to switch between English and French versions of the site
 */
export default function decorate(block) {
  const languages = [
    { code: 'en', label: 'English', path: '' },
    { code: 'fr', label: 'Français', path: '/fr' },
  ];

  // Detect current language from URL path
  // Handles both deployed site (/fr/) and local dev (/content/fr/)
  const currentPath = window.location.pathname;
  const isFrench = currentPath.startsWith('/fr/') || currentPath === '/fr'
    || currentPath.includes('/content/fr/');
  const currentLang = isFrench ? 'fr' : 'en';

  // Create the switcher UI
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher-container';

  const currentLangData = languages.find((lang) => lang.code === currentLang);
  const otherLangs = languages.filter((lang) => lang.code !== currentLang);

  // Create current language display
  const currentDisplay = document.createElement('button');
  currentDisplay.className = 'language-switcher-current';
  currentDisplay.setAttribute('aria-expanded', 'false');
  currentDisplay.setAttribute('aria-haspopup', 'true');
  currentDisplay.innerHTML = `
    <span class="language-code">${currentLangData.code.toUpperCase()}</span>
    <span class="language-label">${currentLangData.label}</span>
    <span class="language-arrow"></span>
  `;

  // Create dropdown
  const dropdown = document.createElement('ul');
  dropdown.className = 'language-switcher-dropdown';
  dropdown.setAttribute('role', 'menu');

  otherLangs.forEach((lang) => {
    const item = document.createElement('li');
    item.setAttribute('role', 'menuitem');

    const link = document.createElement('a');

    // Calculate the target URL
    // Handles both deployed site (/fr/) and local dev (/content/fr/)
    let targetPath;
    if (lang.code === 'en' && currentPath.includes('/content/fr/')) {
      // Local dev: switching to English - remove /fr from /content/fr/
      targetPath = currentPath.replace('/content/fr/', '/content/');
    } else if (lang.code === 'en') {
      // Deployed site: switching to English - remove /fr prefix
      targetPath = currentPath.replace(/^\/fr\/?/, '/') || '/';
    } else if (currentPath.includes('/content/')) {
      // Local dev: switching to French - add /fr after /content/
      targetPath = currentPath.replace('/content/', '/content/fr/');
    } else {
      // Deployed site: switching to French - add /fr prefix
      targetPath = currentPath === '/' ? '/fr/' : `/fr${currentPath}`;
    }

    link.href = targetPath;
    link.innerHTML = `
      <span class="language-code">${lang.code.toUpperCase()}</span>
      <span class="language-label">${lang.label}</span>
    `;

    item.appendChild(link);
    dropdown.appendChild(item);
  });

  // Toggle dropdown on click
  currentDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = currentDisplay.getAttribute('aria-expanded') === 'true';
    currentDisplay.setAttribute('aria-expanded', !isExpanded);
    dropdown.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    currentDisplay.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('open');
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      currentDisplay.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('open');
    }
  });

  switcher.appendChild(currentDisplay);
  switcher.appendChild(dropdown);

  // Clear and append
  block.textContent = '';
  block.appendChild(switcher);
}

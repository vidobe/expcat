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
  // French content is at /content/fr/ not /fr/content/
  const currentPath = window.location.pathname;
  const isFrench = currentPath.includes('/content/fr/') || currentPath.includes('/fr/');
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
    // French content is at /content/fr/page.html, English at /content/page.html
    let targetPath;
    if (lang.code === 'en') {
      // Switching to English - remove /fr from /content/fr/
      targetPath = currentPath.replace('/content/fr/', '/content/') || '/';
    } else {
      // Switching to French - change /content/ to /content/fr/
      targetPath = currentPath.replace('/content/', '/content/fr/');
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

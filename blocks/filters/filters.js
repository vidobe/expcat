export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = '';

  // Create filters container
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'filters-container';

  // Add heading
  const heading = document.createElement('h2');
  heading.className = 'filters-heading';
  heading.textContent = 'Filters';
  filtersContainer.appendChild(heading);

  // Create filter controls wrapper
  const controlsWrapper = document.createElement('div');
  controlsWrapper.className = 'filters-controls';

  // Process each filter row
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const label = cells[0].textContent.trim();
      const optionsText = cells[1].textContent.trim();
      const options = optionsText.split(',').map((opt) => opt.trim());

      // Create filter group
      const filterGroup = document.createElement('div');
      filterGroup.className = 'filter-group';

      // Create select dropdown
      const select = document.createElement('select');
      select.className = 'filter-select';
      select.setAttribute('aria-label', label);

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = label;
      select.appendChild(defaultOption);

      // Add options
      options.forEach((opt) => {
        const option = document.createElement('option');
        option.value = opt.toLowerCase().replace(/\s+/g, '-');
        option.textContent = opt;
        select.appendChild(option);
      });

      filterGroup.appendChild(select);
      controlsWrapper.appendChild(filterGroup);
    }
  });

  // Add apply button
  const applyButton = document.createElement('button');
  applyButton.className = 'filter-apply';
  applyButton.textContent = 'Apply Filter';
  applyButton.addEventListener('click', () => {
    const filters = {};
    controlsWrapper.querySelectorAll('select').forEach((sel) => {
      if (sel.value) {
        filters[sel.getAttribute('aria-label')] = sel.value;
      }
    });
    block.dispatchEvent(new CustomEvent('filterApply', { detail: filters, bubbles: true }));
  });
  controlsWrapper.appendChild(applyButton);

  filtersContainer.appendChild(controlsWrapper);
  block.appendChild(filtersContainer);
}

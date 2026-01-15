export default function decorate(block) {
  // Get all rows from the block
  const rows = [...block.children];

  // Clear the block
  block.innerHTML = '';

  // Create heading
  const heading = document.createElement('h2');
  heading.textContent = 'Filters';
  block.appendChild(heading);

  // Create filters container
  const container = document.createElement('div');
  container.className = 'filters-container';

  // Parse filter data from rows
  // Expected format: Each row has [Label | Options (comma-separated)]
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const label = cells[0].textContent.trim();
      const optionsText = cells[1].textContent.trim();
      const options = optionsText.split(',').map((opt) => opt.trim());

      // Create filter group
      const group = document.createElement('div');
      group.className = 'filter-group';

      // Create label
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      labelEl.setAttribute('for', `filter-${label.toLowerCase().replace(/\s+/g, '-')}`);
      group.appendChild(labelEl);

      // Create select
      const select = document.createElement('select');
      select.id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
      select.name = label.toLowerCase().replace(/\s+/g, '-');

      // Add "All" option first
      const allOption = document.createElement('option');
      allOption.value = '';
      allOption.textContent = `All ${label}`;
      select.appendChild(allOption);

      // Add other options
      options.forEach((opt) => {
        if (opt) {
          const option = document.createElement('option');
          option.value = opt.toLowerCase().replace(/\s+/g, '-');
          option.textContent = opt;
          select.appendChild(option);
        }
      });

      group.appendChild(select);
      container.appendChild(group);
    }
  });

  // Create apply button
  const actions = document.createElement('div');
  actions.className = 'filters-actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Apply Filter';
  button.addEventListener('click', () => {
    // Get all selected values
    const selects = container.querySelectorAll('select');
    const filters = {};
    selects.forEach((select) => {
      if (select.value) {
        filters[select.name] = select.value;
      }
    });

    // Dispatch custom event for filtering
    const event = new CustomEvent('filterApply', {
      detail: filters,
      bubbles: true,
    });
    block.dispatchEvent(event);

    // For now, just log the filters (can be extended for actual filtering)
    // eslint-disable-next-line no-console
    console.log('Filters applied:', filters);
  });

  actions.appendChild(button);
  container.appendChild(actions);

  block.appendChild(container);
}

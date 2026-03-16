/*
 * Table Weather Block
 * Display weather data as horizontal scrolling bar-chart cards
 */

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const months = [...rows[0].children].map((c) => c.textContent.trim());
  const temps = [...rows[1].children].map((c) => c.textContent.trim());

  // Parse temperatures to compute relative bar heights
  const tempValues = temps.map((t) => parseInt(t, 10) || 0);
  const maxTemp = Math.max(...tempValues, 1);

  const scroll = document.createElement('div');
  scroll.className = 'table-weather-scroll';

  months.forEach((month, i) => {
    const card = document.createElement('div');
    card.className = 'table-weather-card';

    // Bar with height proportional to temperature
    const bar = document.createElement('div');
    bar.className = 'table-weather-bar';
    const minH = 97;
    const maxH = 200;
    const ratio = tempValues[i] / maxTemp;
    bar.style.height = `${minH + ratio * (maxH - minH)}px`;

    const icon = document.createElement('span');
    icon.className = 'table-weather-icon';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    const temp = document.createElement('div');
    temp.className = 'table-weather-temp';
    temp.textContent = temps[i] || '';

    bar.append(icon, temp);

    const label = document.createElement('div');
    label.className = 'table-weather-month';
    label.textContent = month;

    card.append(bar, label);
    scroll.append(card);
  });

  block.replaceChildren(scroll);
}

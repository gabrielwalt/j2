/*
 * Table Weather Block
 * Display weather data as horizontal scrolling cards
 */

export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const months = [...rows[0].children].map((c) => c.textContent.trim());
  const temps = [...rows[1].children].map((c) => c.textContent.trim());

  const scroll = document.createElement('div');
  scroll.className = 'table-weather-scroll';

  months.forEach((month, i) => {
    const card = document.createElement('div');
    card.className = 'table-weather-card';

    const temp = document.createElement('div');
    temp.className = 'table-weather-temp';
    temp.textContent = temps[i] || '';

    const label = document.createElement('div');
    label.className = 'table-weather-month';
    label.textContent = month;

    card.append(temp, label);
    scroll.append(card);
  });

  block.replaceChildren(scroll);
}

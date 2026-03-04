// Dynamically insert a small PNG thumbnail into each vps-card using the CTA's data-product slug.
// Strategy: try several filename candidates until an existing PNG is found, then prepend it to the .vps-header.

document.addEventListener('DOMContentLoaded', function () {
  const buttons = document.querySelectorAll('.cta-btn[data-product]');
  buttons.forEach(btn => {
    const slug = btn.dataset.product;
    if (!slug) return;
    const card = btn.closest('.vps-card');
    if (!card) return;
    const header = card.querySelector('.vps-header');
    if (!header) return;

    const imgEl = document.createElement('img');
    imgEl.className = 'vps-thumb';
    imgEl.alt = (header.querySelector('h3')?.textContent || slug) + ' image';

    // Build ordered list of candidate filenames (without extension)
    const candidates = [];

    // Special mapping for Minecraft shorthand 'mc-'
    if (slug.startsWith('mc-')) candidates.push('minecraft-' + slug.slice(3));

    // Exact slug (common cases like rust-bronze, dayz-small...)
    candidates.push(slug);

    // base game name (e.g., 'fivem-32' -> 'fivem')
    const base = slug.split('-')[0];
    if (!candidates.includes(base)) candidates.push(base);

    // generic thumb fallback names used in repo
    if (!candidates.includes(base + '-thumb')) candidates.push(base + '-thumb');

    // some games have alternate filenames (ark-plus, ark-standard)
    if (base === 'ark') {
      candidates.push('ark-plus', 'ark-standard');
    }

    // try candidates in order; when found, insert image
    let i = 0;
    function tryNext() {
      if (i >= candidates.length) return; // nothing found, keep card as-is
      const path = 'assets/images/' + candidates[i] + '.png';
      const probe = new Image();
      probe.onload = function () {
        imgEl.src = path;
        // mark card for styling and insert thumbnail at the start of header
        card.classList.add('has-thumb');
        header.insertBefore(imgEl, header.firstChild);
      };
      probe.onerror = function () {
        i++;
        tryNext();
      };
      probe.src = path;
    }
    tryNext();
  });
});

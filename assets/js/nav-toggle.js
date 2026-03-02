// Small, conservative nav toggle enhancer
// - Injects a toggle button into the first <nav> it finds
// - Adds accessibility attributes and toggles body class `nav-open`
// - Closes menu when a nav link is clicked or on Escape

(function(){
  function initNavToggle(){
    var nav = document.querySelector('header nav');
    if(!nav) return;

    // don't add if already added
    if(nav.querySelector('.nav-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-expanded','false');
    btn.setAttribute('aria-label','Afficher le menu');
    // SVG hamburger (3 stacked bars) for better, consistent rendering
    btn.innerHTML = '' +
      '<svg class="hamburger" width="28" height="20" viewBox="0 0 28 20" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="0" y="1" width="28" height="3" rx="2" />' +
      '<rect x="0" y="8.5" width="28" height="3" rx="2" />' +
      '<rect x="0" y="16" width="28" height="3" rx="2" />' +
      '</svg>';

    // insert button as first child of nav (before logo) for mobile priority
    nav.insertBefore(btn, nav.firstChild);

    function openMenu(){
      document.body.classList.add('nav-open');
      btn.setAttribute('aria-expanded','true');
      btn.setAttribute('aria-label','Fermer le menu');
    }
    function closeMenu(){
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-label','Afficher le menu');
    }

    btn.addEventListener('click', function(e){
      if(document.body.classList.contains('nav-open')) closeMenu(); else openMenu();
    });

    // Close when clicking a link
    nav.addEventListener('click', function(e){
      var tgt = e.target.closest('a');
      if(tgt && document.body.classList.contains('nav-open')){
        // small delay so Tap feels responsive
        setTimeout(closeMenu, 50);
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && document.body.classList.contains('nav-open')){
        closeMenu();
      }
    });

    // Close when resizing to desktop to ensure clean state
    var mql = window.matchMedia('(min-width: 769px)');
    mql.addEventListener && mql.addEventListener('change', function(e){ if(e.matches) closeMenu(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNavToggle);
  else initNavToggle();
})();

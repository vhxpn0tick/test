// Minimal Paymenter config fallback used by the site when no server-side config is provided
// This file intentionally uses the global window object so legacy script.js can read PAYMENTER_BASE
(function () {
  if (!window.PAYMENTER_BASE) {
    try {
      window.PAYMENTER_BASE = window.location.origin + '/paymenter';
    } catch (e) {
      window.PAYMENTER_BASE = '/paymenter';
    }
  }
})();

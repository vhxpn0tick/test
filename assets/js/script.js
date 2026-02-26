// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.advantage, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(el);
});

// Mobile menu toggle (if needed in future)
function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}

// Paymenter base URL (set by assets/js/paymenter-config.js or default)
const PAYMENTER_BASE = window.PAYMENTER_BASE || (window.location.origin + '/paymenter');

// Modal functionality
const modal = document.getElementById('login-modal');
const loginBtn = document.getElementById('login-btn');
const closeBtn = document.querySelector('.close');

// If the login button points to the external shop keep redirect behaviour,
// otherwise if it's intended to open the modal keep current modal behaviour.
if (loginBtn) {
    const href = loginBtn.getAttribute('href');
    if (href && href.includes('achat.velaryonhosting.fr')) {
        loginBtn.addEventListener('click', function(e) {
            // Redirect user to the Paymenter login endpoint
            // allow default navigation if it's an absolute external link
            if (href.startsWith('http')) return;
            e.preventDefault();
            window.location.href = PAYMENTER_BASE + '/login';
        });
    } else {
        // Open modal when login button is used as a modal trigger
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) modal.style.display = 'block';
        });
    }
}

if (closeBtn && modal) {
    closeBtn.addEventListener('click', function() { modal.style.display = 'none'; });

    window.addEventListener('click', function(event) {
        if (event.target === modal) modal.style.display = 'none';
    });
}

// Tab switching using data-tab attributes (replaces inline onclick handlers)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.auth-tabs .tab-btn[data-tab]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const tab = btn.dataset.tab;
            // Find the nearest modal-content or document root for the tabs
            const container = btn.closest('.modal-content') || document;
            const loginTab = container.querySelector('#login-tab');
            const registerTab = container.querySelector('#register-tab');

            if (!loginTab || !registerTab) return;

            if (tab === 'login') {
                loginTab.classList.remove('hidden');
                registerTab.classList.add('hidden');
                // toggle active states
                container.querySelectorAll('.auth-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                loginTab.classList.add('hidden');
                registerTab.classList.remove('hidden');
                container.querySelectorAll('.auth-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });
});

// Form submissions (placeholder - replace with actual auth logic)
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Fonctionnalité de connexion à implémenter avec un backend.');
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Fonctionnalité d\'inscription à implémenter avec un backend.');
});

document.querySelector('.discord-auth-btn').addEventListener('click', function() {
    alert('Connexion Discord à implémenter avec OAuth.');
});

// Contact form submission
if (document.getElementById('contact-form')) {
    document.getElementById('contact-form').addEventListener('submit', function(e) {
        e.preventDefault();
        // Basic client-side sanitization and honeypot check
        function sanitize(input) {
            if (!input) return '';
            return input.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;')
                        .substring(0, 2000); // limit length
        }

        const hp = document.getElementById('hp_field');
        if (hp && hp.value.trim() !== '') {
            // Honeypot filled - likely a bot. Fail silently.
            return;
        }

        const name = sanitize(document.getElementById('name').value.trim());
        const email = sanitize(document.getElementById('email').value.trim());
        const subject = sanitize(document.getElementById('subject').value.trim());
        const message = sanitize(document.getElementById('message').value.trim());

        // Placeholder for form submission - replace with actual backend logic
        alert(`Merci ${name || 'client'}! Votre message concernant "${subject || 'général'}" a été reçu. Nous vous répondrons sous 24h.`);

        // Reset form
        this.reset();
    });
}

// Order buttons functionality
document.addEventListener('DOMContentLoaded', function() {
    const orderButtons = document.querySelectorAll('.cta-btn:not(.secondary)');
    
    orderButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            // If the link points directly to the external shop (achat.velaryonhosting.fr/products...), let it navigate normally
            const href = this.getAttribute('href');
            if (href && href.includes('achat.velaryonhosting.fr/products')) {
                // allow default navigation to proceed to the shop
                return; // don't preventDefault
            }

            e.preventDefault();

            // Get the game/service name from the card. Accept .vps-card as well as .game-card/.service-card
            const card = this.closest('.vps-card, .game-card, .service-card');
            let serviceName = 'Service inconnu';
            let serviceType = 'Commande';

            if (card) {
                // Prefer an explicit slug if provided on the button (data-product) or on the card
                const explicitSlug = (this.dataset && this.dataset.product) || card.dataset && (card.dataset.product || card.dataset.service);
                if (explicitSlug) {
                    serviceName = explicitSlug;
                } else {
                    const titleElement = card.querySelector('h3');
                    if (titleElement) {
                        // basic sanitization for content extracted from DOM
                        serviceName = titleElement.textContent.replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,200);
                    }
                }

                // Determine service type
                if (card.classList.contains('game-card') || card.closest('.game-group')) {
                    serviceType = 'Serveur de jeu';
                } else if (card.closest('.service-group')) {
                    serviceType = 'Service';
                }
            }

            // Show loading state
            const originalText = this.textContent;
            this.textContent = 'Commande en cours...';
            this.disabled = true;

            // Redirect to Paymenter order page for checkout
            try {
                const orderUrl = PAYMENTER_BASE + '/order?service=' + encodeURIComponent(serviceName) + '&type=' + encodeURIComponent(serviceType);
                // navigate to order URL
                window.location.href = orderUrl;
            } catch (err) {
                console.error('Erreur redirection vers Paymenter:', err);
                alert('Erreur technique lors de la redirection vers le paiement. Veuillez nous contacter.');
            } finally {
                // Reset button state (in case redirection failed)
                this.textContent = originalText;
                this.disabled = false;
            }
        });
    });
});
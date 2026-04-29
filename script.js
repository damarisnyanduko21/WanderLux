/* =========================
   Helpers
========================= */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const setError = (form, key, message) => {
    const target = form.querySelector(`[data-error-key="${key}"]`);
    if (target) target.textContent = message;
};

/* =========================
   Fade-in Animation
========================= */
const observer = new IntersectionObserver(
    (entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.18 }
);

$$('.fade').forEach((el) => observer.observe(el));

/* =========================
   Banner Slider
========================= */
const banner = $('[data-banner]');

if (banner) {
    const slides = [
        'Featured this season • Bali • Kyoto • Queenstown',
        'Featured this season • Paris • Cape Town • Bali',
        'Featured this season • Kyoto • Queenstown • Paris'
    ];

    let index = 0;

    setInterval(() => {
        index = (index + 1) % slides.length;
        banner.textContent = slides[index];
    }, 3500);
}

/* =========================
   Mobile Navigation
========================= */
const navBtn = $('[data-menu-toggle]');
const nav = $('[data-menu]');

if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        navBtn.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            navBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

/* =========================
   Theme Toggle
========================= */
const themeBtn = $('[data-theme-toggle]');

if (themeBtn) {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    const updateThemeButton = () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        themeBtn.textContent = isDark ? '☀️' : '🌙';
        themeBtn.setAttribute(
            'aria-label',
            isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
    };

    updateThemeButton();

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';

        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }

        updateThemeButton();
    });
}

/* =========================
   Form Validation Engine
========================= */
const validateForm = (form, statusEl, successMessage) => {
    form.addEventListener('submit', (e) => {
        const action = form.getAttribute('action') || '';

        // Allow Formspree external handling
        if (action.includes('formspree.io')) return;

        e.preventDefault();

        let isValid = true;

        // clear old errors
        form.querySelectorAll('[data-error-key]').forEach(el => el.textContent = '');

        // validate required fields
        form.querySelectorAll('[required]').forEach((field) => {
            const key = field.dataset.errorKey || field.id;
            const value = field.value.trim();

            if (!value) {
                setError(form, key, 'This field is required.');
                isValid = false;
            }

            if (field.type === 'email' && value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    setError(form, key, 'Enter a valid email address.');
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            if (statusEl) statusEl.textContent = 'Please fix the highlighted fields.';
            return;
        }

        if (statusEl) statusEl.textContent = successMessage;
    });
};

/* =========================
   Calculator Logic
========================= */
const calculator = $('#calculator-form');

if (calculator) {
    const rates = {
        Bali: { base: 180, accommodation: 95 },
        Kyoto: { base: 240, accommodation: 140 },
        Queenstown: { base: 260, accommodation: 155 },
        Paris: { base: 320, accommodation: 220 },
        'Cape Town': { base: 210, accommodation: 120 }
    };

    const multipliers = {
        Budget: 0.85,
        Standard: 1,
        Luxury: 1.45
    };

    const labels = {
        Budget: 'Budget Travel Package',
        Standard: 'Standard Travel Package',
        Luxury: 'Luxury Travel Package'
    };

    calculator.addEventListener('submit', (e) => {
        e.preventDefault();

        ['destination', 'travellers', 'days', 'style'].forEach((k) =>
            setError(calculator, k, '')
        );

        const destination = calculator.destination.value;
        const travellers = Number(calculator.travellers.value);
        const days = Number(calculator.days.value);
        const style = calculator.style.value;

        let valid = true;

        if (!destination) {
            setError(calculator, 'destination', 'Choose a destination.');
            valid = false;
        }

        if (!travellers || travellers < 1) {
            setError(calculator, 'travellers', 'Enter at least 1 traveller.');
            valid = false;
        }

        if (!days || days < 1) {
            setError(calculator, 'days', 'Enter at least 1 day.');
            valid = false;
        }

        if (!style) {
            setError(calculator, 'style', 'Choose a style.');
            valid = false;
        }

        if (!valid) return;

        const total =
            (rates[destination].base * travellers * days +
                rates[destination].accommodation * days) *
            multipliers[style];

        const formatted = Math.round(total).toLocaleString();

        $('#calculator-result').innerHTML = `
            <strong>Estimated total: $${formatted}</strong>
            <p>
                Estimated cost for ${travellers} traveller${travellers > 1 ? 's' : ''} to
                ${destination} for ${days} day${days > 1 ? 's' : ''}:
                $${formatted} - ${labels[style]}.
            </p>
        `;
    });
}

/* =========================
   Form Attachments
========================= */
const appointmentForm = $('#appointment-form');
if (appointmentForm) {
    validateForm(
        appointmentForm,
        $('#appointment-status'),
        'Appointment email prepared.'
    );
}

const contactForm = $('#contact-form');
if (contactForm) {
    validateForm(
        contactForm,
        $('#contact-status'),
        'Enquiry email prepared.'
    );
}
// Helpers
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);



// =========================
// Fade‑in animation
// =========================
const observer = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            o.unobserve(e.target);
        }
    });
}, { threshold: 0.18 });

$$('.fade').forEach(el => observer.observe(el));



// =========================
// Rotating banner
// =========================
const banner = $('[data-banner]');

if (banner) {
    const slides = [
        'Featured this season • Bali • Kyoto • Queenstown',
        'Featured this season • Paris • Cape Town • Bali',
        'Featured this season • Kyoto • Queenstown • Paris'
    ];

    let i = 0;

    setInterval(() => {
        i = (i + 1) % slides.length;
        banner.textContent = slides[i];
    }, 3500);
}



// =========================
// Mobile navigation toggle
// =========================
const navBtn = $('[data-menu-toggle]');
const nav = $('[data-menu]');

if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        navBtn.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            nav.classList.remove('open');
            navBtn.setAttribute('aria-expanded', 'false');
        });
    });
}



// =========================
// Theme toggle (dark/light)
// =========================
const themeBtn = $('[data-theme-toggle]');

if (themeBtn) {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }

    const sync = () => {
        const dark = document.body.getAttribute('data-theme') === 'dark';
        themeBtn.textContent = dark ? '☀️' : '🌙';
        themeBtn.setAttribute(
            'aria-label',
            dark ? 'Switch to light mode' : 'Switch to dark mode'
        );
    };

    sync();

    themeBtn.addEventListener('click', () => {
        const dark = document.body.getAttribute('data-theme') === 'dark';

        if (dark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }

        sync();
    });
}



// =========================
// Form validation helper
// =========================
const setErr = (form, key, msg) => {
    const t = form.querySelector(`[data-error-key="${key}"]`);
    if (t) t.textContent = msg;
};

const validate = (form, status) => {
    form.addEventListener('submit', (e) => {
        const action = form.getAttribute('action') || '';
        const isFormspree = action.includes('formspree.io');

        let ok = true;

        form.querySelectorAll('[data-error-key]').forEach(
            x => (x.textContent = '')
        );

        form.querySelectorAll('[required]').forEach(el => {
            const key = el.dataset.errorKey || el.id;
            const v = el.value.trim();

            if (!v) {
                setErr(form, key, 'This field is required.');
                ok = false;
            }

            if (
                el.type === 'email' &&
                v &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
            ) {
                setErr(form, key, 'Enter a valid email address.');
                ok = false;
            }
        });

        if (!ok) {
            e.preventDefault();
            if (status) status.textContent = 'Please fix the highlighted fields.';
            return;
        }

        if (isFormspree) {
            if (status) status.textContent = 'Sending your message...';

            const body = new FormData(form);
            fetch(action, {
                method: 'POST',
                body,
                headers: {
                    Accept: 'application/json'
                }
            })
                .then(res => {
                    if (res.ok) {
                        if (status) status.textContent = 'Message sent! Thank you.';
                        form.reset();
                    } else {
                        res.json().then(data => {
                            if (status) status.textContent =
                                'Error: ' + (data?.error || 'Something went wrong.');
                        });
                    }
                })
                .catch(err => {
                    if (status) status.textContent = 'Network error. Please try again.';
                    console.error('Formspree submit error:', err);
                });

            return;
        }

        e.preventDefault();
        if (status) status.textContent = 'Form ready for email integration.';
        form.reset();
    });
};



// =========================
// Trip calculator
// =========================
const calc = $('#calculator-form');

if (calc) {
    const rates = {
        Bali: { base: 180, accommodation: 95 },
        Kyoto: { base: 240, accommodation: 140 },
        Queenstown: { base: 260, accommodation: 155 },
        Paris: { base: 320, accommodation: 220 },
        'Cape Town': { base: 210, accommodation: 120 }
    };

    const mult = {
        Budget: 0.85,
        Standard: 1,
        Luxury: 1.45
    };

    const note = {
        Budget: 'Budget Travel Package',
        Standard: 'Standard Travel Package',
        Luxury: 'Luxury Travel Package'
    };

    calc.addEventListener('submit', e => {
        e.preventDefault();

        // Clear errors
        ['destination', 'travellers', 'days', 'style']
            .forEach(k => setErr(calc, k, ''));

        const d = calc.destination.value;
        const t = Number(calc.travellers.value);
        const days = Number(calc.days.value);
        const s = calc.style.value;

        let ok = true;

        if (!d) {
            setErr(calc, 'destination', 'Choose a destination.');
            ok = false;
        }

        if (!t || t < 1) {
            setErr(calc, 'travellers', 'Enter at least 1 traveller.');
            ok = false;
        }

        if (!days || days < 1) {
            setErr(calc, 'days', 'Enter at least 1 day.');
            ok = false;
        }

        if (!s) {
            setErr(calc, 'style', 'Choose a style.');
            ok = false;
        }

        if (!ok) return;

        const total = Math.round(
            ((rates[d].base * t * days) +
            (rates[d].accommodation * days)) * mult[s]
        );

        $('#calculator-result').innerHTML = `
            <strong>Estimated total: $${total.toLocaleString()}</strong>
            <p>
                Estimated cost for ${t} traveller${t > 1 ? 's' : ''} 
                to ${d} for ${days} day${days > 1 ? 's' : ''}: 
                $${total.toLocaleString()} - ${note[s]}.
            </p>
        `;
    });
}



// =========================
// Formspree forms (appointment + contact)
// =========================
const app = $('#appointment-form');
if (app) validate(app, $('#appointment-status'));

const contact = $('#contact-form');
if (contact) validate(contact, $('#contact-status'));

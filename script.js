// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Dark Neon Area Chart Theme (animated)
class NeonAreaChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        this.points = [];
        this.animationId = null;
        this.time = 0;
        this.speed = 0.06;
        this.windowSize = 140; // number of points visible
        
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => {
            this.width = canvas.width = window.innerWidth;
            this.height = canvas.height = window.innerHeight;
        });
    }
    
    init() {
        this.generateSeries();
    }

    generateSeries() {
        // Smooth random walk with trend and noise
        const count = 220;
        let v = 100;
        let drift = 0.002;
        let momentum = 0;
        this.points = [];
        for (let i = 0; i < count; i++) {
            momentum = momentum * 0.9 + (Math.random() - 0.5) * 0.02;
            v = v * (1 + drift + momentum);
            this.points.push({ x: i, y: v });
        }
    }

    getMinMax() {
        const start = Math.max(0, this.points.length - this.windowSize);
        const slice = this.points.slice(start);
        let min = Infinity, max = -Infinity;
        slice.forEach(p => { min = Math.min(min, p.y); max = Math.max(max, p.y); });
        return { min, max };
    }

    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
        g.addColorStop(0, 'rgba(10, 10, 22, 0.9)');
        g.addColorStop(1, 'rgba(10, 10, 10, 0.0)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // neon grid
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 6; i++) {
            const y = (this.height / 6) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
        for (let i = 0; i <= 12; i++) {
            const x = (this.width / 12) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
    }

    drawSeries() {
        const start = Math.max(0, this.points.length - this.windowSize);
        const data = this.points.slice(start);
        const { min, max } = this.getMinMax();
        const range = Math.max(1e-6, max - min);

        const mapX = (i) => (i / (data.length - 1)) * this.width;
        const mapY = (y) => this.height - 60 - ((y - min) / range) * (this.height - 120);

        // area gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.35)');
        grad.addColorStop(1, 'rgba(0, 212, 255, 0.00)');

        // path
            this.ctx.beginPath();
        data.forEach((p, i) => {
            const x = mapX(i);
            const y = mapY(p.y);
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });

        // stroke
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.85)';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = 'rgba(0, 255, 136, 0.6)';
        this.ctx.shadowBlur = 10;
        this.ctx.stroke();

        // area fill
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.closePath();
        this.ctx.fillStyle = grad;
            this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // moving average (short)
        this.drawMA(data, 12, mapX, mapY, 'rgba(139, 92, 246, 0.9)');

        // highlight dot removed per request
    }

    drawMA(data, period, mapX, mapY, color) {
        if (data.length < period) return;
        this.ctx.beginPath();
        for (let i = period - 1; i < data.length; i++) {
            const slice = data.slice(i - period + 1, i + 1);
            const avg = slice.reduce((s, p) => s + p.y, 0) / period;
            const x = mapX(i);
            const y = mapY(avg);
            if (i === period - 1) this.ctx.moveTo(x, y); else this.ctx.lineTo(x, y);
        }
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.8;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    stepSeries() {
        // push a new point; remove first to keep window length stable
        const last = this.points[this.points.length - 1];
        const drift = 0.0015 + Math.sin(this.time * 0.05) * 0.001;
        const momentum = (Math.random() - 0.5) * 0.02;
        const next = last.y * (1 + drift + momentum);
        this.points.push({ x: last.x + 1, y: next });
        if (this.points.length > 240) this.points.shift();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();
        this.drawSeries();
        // step multiple times per frame for faster motion
        this.stepSeries();
        this.stepSeries();
        this.time += this.speed; // faster progression
        requestAnimationFrame(() => this.animate());
    }
}

// Fast Neon Candlestick Chart (no slowdown)
class FastCandlestickChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        this.candles = [];
        this.windowSize = 100; // number of candles visible
        this.volatility = 0.012; // baseline vol for historical generation
        this.time = 0;
        this.speedSteps = 1; // retained for compatibility
        this.frameCount = 0; // total frames elapsed

        // Live 1-minute-like behavior (simulated):
        // - current candle forms over periodFrames with micro-ticks
        // - at period end, candle is finalized and a new one starts
        this.periodFrames = 240; // frames per candle (~4s at 60fps). Adjust for demo speed
        this.tickEvery = 2; // update intra-candle every N frames for smoother motion
        this.tickVolatility = 0.0025; // per-tick micro movement
        this.drift = 0.0002; // slight upward/downward drift
        this.currentCandle = null;

        this.init();

        window.addEventListener('resize', () => {
            this.width = canvas.width = window.innerWidth;
            this.height = canvas.height = window.innerHeight;
        });

        this.animate();
    }

    init() {
        this.generateInitialCandles();
        const last = this.candles[this.candles.length - 1] || { close: 100 };
        const o = last.close;
        this.currentCandle = { open: o, high: o, low: o, close: o };
    }

    generateInitialCandles() {
        const base = 100;
        let price = base;
        for (let i = 0; i < this.windowSize; i++) {
            const change = (Math.random() - 0.5) * this.volatility;
            const open = price;
            const close = price * (1 + change);
            // shorter wicks
            const high = Math.max(open, close) * (1 + Math.random() * 0.003);
            const low = Math.min(open, close) * (1 - Math.random() * 0.003);
            this.candles.push({ open, close, high, low });
            price = close;
        }
    }

    pushCandle() {
        // finalize the current candle and start a new one
        if (!this.currentCandle) return;
        const finalized = { ...this.currentCandle };
        this.candles.push(finalized);
        if (this.candles.length > this.windowSize) this.candles.shift();
        const o = finalized.close;
        this.currentCandle = { open: o, high: o, low: o, close: o };
    }

    tickCandle() {
        if (!this.currentCandle) return;
        // micro price move
        const rnd = (Math.random() - 0.5) * this.tickVolatility;
        const change = rnd + this.drift * Math.sin(this.time * 0.05);
        const prevClose = this.currentCandle.close;
        const nextClose = prevClose * (1 + change);
        this.currentCandle.close = nextClose;
        if (nextClose > this.currentCandle.high) this.currentCandle.high = nextClose;
        if (nextClose < this.currentCandle.low) this.currentCandle.low = nextClose;
    }

    getMinMax() {
        let min = Infinity, max = -Infinity;
        for (const c of this.candles) {
            if (c.low < min) min = c.low;
            if (c.high > max) max = c.high;
        }
        if (min === max) { min -= 1; max += 1; }
        return { min, max };
    }

    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
        g.addColorStop(0, 'rgba(10, 10, 22, 0.9)');
        g.addColorStop(1, 'rgba(10, 10, 10, 0.0)');
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // subtle grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = (this.height / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawCandles() {
        const n = this.candles.length;
        if (n === 0) return;
        const { min, max } = this.getMinMax();
        const range = max - min;
        const padTop = 50, padBottom = 70;
        const usableH = Math.max(1, this.height - padTop - padBottom);
        // bigger candles (wider bodies)
        const candleW = Math.max(4, (this.width / this.windowSize) * 0.95);

        const mapY = (price) => this.height - padBottom - ((price - min) / range) * usableH;

        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 14;

        for (let i = 0; i < n; i++) {
            const c = this.candles[i];
            const x = (i / (this.windowSize - 1)) * this.width;
            const isBull = c.close >= c.open;
            const stroke = isBull ? 'rgba(0, 255, 136, 1.0)' : 'rgba(255, 80, 120, 1.0)';
            const fill = isBull ? 'rgba(0, 255, 136, 0.40)' : 'rgba(255, 80, 120, 0.40)';

            // wick
            this.ctx.strokeStyle = stroke;
            this.ctx.shadowColor = stroke;
            this.ctx.beginPath();
            this.ctx.moveTo(x, mapY(c.high));
            this.ctx.lineTo(x, mapY(c.low));
            this.ctx.stroke();

            // body
            const yOpen = mapY(c.open);
            const yClose = mapY(c.close);
            const top = Math.min(yOpen, yClose);
            const h = Math.max(3, Math.abs(yClose - yOpen));
            this.ctx.fillStyle = fill;
            this.ctx.fillRect(x - candleW / 2, top, candleW, h);
            this.ctx.strokeRect(x - candleW / 2, top, candleW, h);
        }

        this.ctx.shadowBlur = 0;

        // draw forming current candle as well
        if (this.currentCandle) {
            const isBull = this.currentCandle.close >= this.currentCandle.open;
            const stroke = isBull ? 'rgba(0, 255, 136, 1.0)' : 'rgba(255, 80, 120, 1.0)';
            const fill = isBull ? 'rgba(0, 255, 136, 0.40)' : 'rgba(255, 80, 120, 0.40)';
            const x = this.width; // render at the right edge
            const mapY = (price) => this.height - padBottom - ((price - min) / range) * usableH;
            // wick
            this.ctx.strokeStyle = stroke;
            this.ctx.shadowColor = stroke;
            this.ctx.beginPath();
            this.ctx.moveTo(x, mapY(this.currentCandle.high));
            this.ctx.lineTo(x, mapY(this.currentCandle.low));
            this.ctx.stroke();

            // body
            const yOpen = mapY(this.currentCandle.open);
            const yClose = mapY(this.currentCandle.close);
            const top = Math.min(yOpen, yClose);
            const h = Math.max(3, Math.abs(yClose - yOpen));
            this.ctx.fillStyle = fill;
            this.ctx.fillRect(x - candleW / 2, top, candleW, h);
            this.ctx.strokeRect(x - candleW / 2, top, candleW, h);
            this.ctx.shadowBlur = 0;
        }
    }

    animate() {
        // Live-like cadence: micro-tick updates; finalize every periodFrames
        this.frameCount++;
        if (this.frameCount % this.tickEvery === 0) {
            this.tickCandle();
            this.time += 1;
        }
        if (this.frameCount % this.periodFrames === 0) {
            this.pushCandle();
        }
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawBackground();
        this.drawCandles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize chart when page loads
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('chartCanvas');
    if (canvas) {
        new FastCandlestickChart(canvas);
    }

    // Particles background
    const particlesCanvas = document.getElementById('particlesCanvas');
    if (particlesCanvas) {
        // Disable particles overlay per request
        try { particlesCanvas.style.display = 'none'; } catch (_) {}
        // Do not initialize particles rendering
    /*
        const ctx = particlesCanvas.getContext('2d');
        const resize = () => {
            particlesCanvas.width = window.innerWidth;
            particlesCanvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const particleCount = 120;
        const particles = Array.from({ length: particleCount }).map(() => ({
            x: Math.random() * particlesCanvas.width,
            y: Math.random() * particlesCanvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 2 + 0.5
        }));

        function renderParticles() {
            ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
            // connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 120) {
                        const alpha = 1 - dist / 120;
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // particles
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > particlesCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > particlesCanvas.height) p.vy *= -1;
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                grd.addColorStop(0, 'rgba(0,255,136,0.9)');
                grd.addColorStop(1, 'rgba(0,255,136,0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    */
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe elements for animation (staggered)
document.addEventListener('DOMContentLoaded', () => {
    const animateSelectors = ['.service-card', '.process-step', '.team-member', '.value-item', '.faq-item', '.stat-item'];
    animateSelectors.forEach(selector => {
        const group = document.querySelectorAll(selector);
        group.forEach((el, idx) => {
            el.classList.add('animate-on-scroll');
            el.style.transitionDelay = `${idx * 80}ms`;
            observer.observe(el);
        });
    });
});

// Contact form handling
document.addEventListener('DOMContentLoaded', () => {
    // Google Apps Script endpoint (recommended, uses your Gmail to send)
    // Deploy a Web App in Apps Script and paste the URL below
    const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbygcwkSzOoMWXEt-1rHvJGhkFjUM4DGn_d3Jtboah9Mwp0zDrgA93PVSKA5h2LlxC0NOQ/exec';

    // EmailJS config (replace with your real IDs)
    const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
    const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
    const EMAILJS_TEMPLATE_USER_WELCOME = 'YOUR_TEMPLATE_ID_WELCOME_USER';
    const EMAILJS_TEMPLATE_NOTIFY_CEO = 'YOUR_TEMPLATE_ID_NOTIFY_CEO';
    const CEO_EMAIL = 'mitrathanasingh2000@gmail.com';

    // SMTP.js (client-side SMTP) config — WARNING: exposes token in client. Prefer a serverless proxy in production.
    const SMTP_ENABLED = true; // set to true to use SMTP.js path
    const SMTP_SECURE_TOKEN = 'YOUR_SMTPJS_SECURE_TOKEN'; // e.g., from smtpjs.com (Elastic Email token) or leave '' to disable
    const SMTP_FROM = 'no-reply@yourdomain.com'; // must be a verified sender with your SMTP provider

    // Initialize EmailJS if available
    if (window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        try { window.emailjs.init(EMAILJS_PUBLIC_KEY); } catch (_) {}
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            const params = {
                from_name: data.name || 'Guest',
                from_email: data.email || '',
                phone: `${data.countryCode || ''} ${data.phone || ''}`.trim(),
                service_interest: data.service || 'General',
                message: data.message || '',
                to_email_user: data.email || '',
                to_email_ceo: CEO_EMAIL
            };

            const canSendGAS = Boolean(GAS_ENDPOINT);
            const canSendEmailJS = Boolean(window.emailjs && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_USER_WELCOME && EMAILJS_TEMPLATE_NOTIFY_CEO);
            const canSendSMTP = Boolean(window.Email && SMTP_ENABLED && SMTP_SECURE_TOKEN && SMTP_SECURE_TOKEN !== 'YOUR_SMTPJS_SECURE_TOKEN' && SMTP_FROM);

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const finish = (ok) => {
                submitBtn.textContent = ok ? 'Message Sent!' : 'Failed. Try Again';
                submitBtn.style.background = ok ? 'linear-gradient(45deg, #00ff88, #00d4ff)' : '';
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    if (ok) contactForm.reset();
                }, 2000);
            };

            if (!canSendGAS && !canSendEmailJS && !canSendSMTP) {
                // Fallback: simulate success visually
                setTimeout(() => finish(true), 1200);
                return;
            }

            const sendWithGAS = () => {
                return fetch(GAS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_name: params.from_name,
                        from_email: params.from_email,
                        phone: params.phone,
                        service_interest: params.service_interest,
                        message: params.message,
                        to_email_ceo: params.to_email_ceo
                    })
                }).then(async (res) => {
                    if (!res.ok) {
                        const txt = await res.text().catch(() => '');
                        console.error('GAS error status:', res.status, txt);
                        throw new Error('GAS send failed');
                    }
                    return res.json().catch(() => ({}));
                });
            };

            const sendWithEmailJS = () => {
                const sendUser = window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_USER_WELCOME, params);
                const sendCeo = window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_NOTIFY_CEO, params);
                return Promise.all([sendUser, sendCeo]);
            };

            const sendWithSMTP = () => {
                const subjectUser = 'Welcome to JMS AlogDEV';
                const bodyUser = `Hi ${params.from_name},\n\nThanks for contacting JMS AlogDEV. We received your message about: ${params.service_interest}.\n\nMobile: ${params.phone || 'N/A'}\nMessage:\n${params.message}\n\nWe will get back to you shortly.\n\n— JMS AlogDEV`;
                const subjectCEO = 'New Contact Form Submission';
                const bodyCEO = `New inquiry from ${params.from_name} <${params.from_email}>\nMobile: ${params.phone || 'N/A'}\nService: ${params.service_interest}\n\nMessage:\n${params.message}`;

                const sendUserSMTP = window.Email.send({
                    SecureToken: SMTP_SECURE_TOKEN,
                    To: params.to_email_user,
                    From: SMTP_FROM,
                    Subject: subjectUser,
                    Body: bodyUser.replace(/\n/g, '<br>')
                });
                const sendCeoSMTP = window.Email.send({
                    SecureToken: SMTP_SECURE_TOKEN,
                    To: params.to_email_ceo,
                    From: SMTP_FROM,
                    Subject: subjectCEO,
                    Body: bodyCEO.replace(/\n/g, '<br>')
                });
                return Promise.all([sendUserSMTP, sendCeoSMTP]);
            };

            const sender = canSendGAS ? sendWithGAS : (canSendSMTP ? sendWithSMTP : sendWithEmailJS);
            sender()
                .then(() => finish(true))
                .catch(() => finish(false));
        });
    }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.backdropFilter = 'blur(15px)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add hover effects to service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card, .service-card-detailed');
    serviceCards.forEach(card => card.classList.add('tilt'));
    
    serviceCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rx = ((y / rect.height) - 0.5) * -10;
            const ry = ((x / rect.width) - 0.5) * 10;
            card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
});

// removed live trading ticker

// Button ripple
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            this.classList.remove('ripple');
            // position ripple center at click
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.style.setProperty('--ripple-x', x + 'px');
            this.style.setProperty('--ripple-y', y + 'px');
            void this.offsetWidth; // reflow
            this.classList.add('ripple');
            setTimeout(() => this.classList.remove('ripple'), 600);
        });
    });
});

// Headline per-letter animation
document.addEventListener('DOMContentLoaded', () => {
    const headlines = document.querySelectorAll('.headline-animate');
    headlines.forEach(h => {
        const text = h.textContent;
        h.textContent = '';
        const frag = document.createDocumentFragment();
        [...text].forEach((ch, idx) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.style.animationDelay = `${idx * 40}ms`;
            if (ch === ' ') {
                span.classList.add('space');
                span.textContent = '\u00A0';
            } else {
                span.textContent = ch;
            }
            frag.appendChild(span);
        });
        h.appendChild(frag);
        h.classList.add('glow');
    });
});

// Depth Parallax for hero headline (Chrome Shine variant)
document.addEventListener('DOMContentLoaded', () => {
    const tiltTargets = document.querySelectorAll('.parallax-tilt');
    const maxRotate = 7; // degrees
    const maxTranslateZ = 20; // px for per-letter pop
    function handleMove(e) {
        tiltTargets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const rx = Math.max(-1, Math.min(1, -dy)) * maxRotate;
            const ry = Math.max(-1, Math.min(1, dx)) * maxRotate;
            el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            // depth for characters
            el.querySelectorAll('.char').forEach((ch, idx) => {
                const depth = ((idx % 5) / 5) * maxTranslateZ;
                ch.style.transform = `translateZ(${depth}px)`;
            });
        });
    }
    function handleLeave() {
        tiltTargets.forEach(el => {
            el.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
            el.querySelectorAll('.char').forEach(ch => {
                ch.style.transform = 'translateZ(0)';
            });
        });
    }
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseout', handleLeave);
});

// Add counter animation for stats
document.addEventListener('DOMContentLoaded', () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target) => {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target.toString().includes('%')) {
                element.textContent = Math.floor(current) + '%';
            } else if (target.toString().includes('+')) {
                element.textContent = Math.floor(current) + '+';
            } else if (target.toString().includes('/')) {
                element.textContent = Math.floor(current) + '/7';
            } else {
                element.textContent = Math.floor(current);
            }
        }, 20);
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                if (text.includes('500+')) {
                    animateCounter(element, 500);
                } else if (text.includes('98%')) {
                    animateCounter(element, 98);
                } else if (text.includes('24/7')) {
                    element.textContent = '24/7';
                } else if (text.includes('5+')) {
                    animateCounter(element, 5);
                }
                
                statsObserver.unobserve(element);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add custom cursor effect
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(0, 212, 255, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
    });
});

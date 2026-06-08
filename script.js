document.addEventListener('DOMContentLoaded', () => {

    // ── Partículas rosas ───────────────────────────────────────────
    const canvas = document.getElementById('particles');
    const ctx    = canvas.getContext('2d');
    let   parts  = [];

    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#e91e63','#f48fb1','#c2185b','#f06292','#ff80ab'];

    function newPart() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            r: Math.random() * 2.2 + 0.6,
            vy: Math.random() * 0.5 + 0.2,
            vx: (Math.random() - 0.5) * 0.35,
            a: Math.random() * 0.45 + 0.1,
            c: COLORS[Math.floor(Math.random() * COLORS.length)],
            phase: Math.random() * Math.PI * 2,
        };
    }

    for (let i = 0; i < 60; i++) {
        const p = newPart();
        p.y = Math.random() * canvas.height;
        parts.push(p);
    }

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = Date.now() * 0.001;
        parts.forEach((p, i) => {
            p.y -= p.vy; p.x += p.vx;
            const a = Math.max(0, Math.min(0.65, p.a + Math.sin(t + p.phase) * 0.015));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.c;
            ctx.globalAlpha = a;
            ctx.fill();
            if (p.y < -10) parts[i] = newPart();
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    })();

    // ── Sistema de escenas ─────────────────────────────────────────
    // Usamos display:none/flex para que NO haya solapamiento visual
    const TOTAL      = 4;
    let   current    = 0;
    let   busy       = false;
    const progress   = document.getElementById('progressFill');

    function setProgress(i) {
        progress.style.width = ((i + 1) / TOTAL * 100) + '%';
    }
    setProgress(0);

    // Escena 0 arranca visible con animación de entrada
    const first = document.getElementById('scene-0');
    first.classList.add('anim-in');

    function goTo(next) {
        if (busy || next === current) return;
        busy = true;

        const curEl  = document.getElementById('scene-' + current);
        const nextEl = document.getElementById('scene-' + next);
        if (!nextEl) { busy = false; return; }

        // 1) animar salida de la escena actual
        curEl.classList.add('anim-out');

        curEl.addEventListener('animationend', function handler() {
            curEl.removeEventListener('animationend', handler);
            // 2) ocultar la actual completamente
            curEl.classList.remove('active', 'anim-out');

            // 3) mostrar la siguiente y animar entrada
            nextEl.classList.add('active', 'anim-in');
            nextEl.addEventListener('animationend', function h2() {
                nextEl.removeEventListener('animationend', h2);
                nextEl.classList.remove('anim-in');
                busy    = false;
                current = next;
            });

            setProgress(next);

            // Inicializar botón NO cuando lleguemos a escena 3
            if (next === 3) initNoBtn();
        });
    }

    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => goTo(parseInt(btn.dataset.next)));
    });

    // ── Botón NO que escapa ────────────────────────────────────────
    const noBtn      = document.getElementById('noBtn');
    const yesBtn     = document.getElementById('yesBtn');
    const area       = document.getElementById('buttonsArea');
    const respMsg    = document.getElementById('responseMessage');
    let   noAttempts = 0;
    let   noBtnReady = false;

    function initNoBtn() {
        if (noBtnReady) return;
        noBtnReady = true;

        // Posición inicial: a la derecha del SÍ
        setTimeout(() => {
            const ar = area.getBoundingClientRect();
            const nr = noBtn.getBoundingClientRect();
            noBtn.style.top  = ((ar.height - nr.height) / 2) + 'px';
            noBtn.style.left = ((ar.width  - nr.width)  / 2 + nr.width + 24) + 'px';
        }, 120);
    }

    function moveNo() {
        const ar   = area.getBoundingClientRect();
        const nr   = noBtn.getBoundingClientRect();
        const maxX = Math.max(0, ar.width  - nr.width);
        const maxY = Math.max(0, ar.height - nr.height);

        let nx, ny, t = 0;
        do {
            nx = Math.floor(Math.random() * maxX);
            ny = Math.floor(Math.random() * maxY);
            t++;
        } while (
            t < 10 &&
            Math.abs(nx - parseFloat(noBtn.style.left || 0)) < 50 &&
            Math.abs(ny - parseFloat(noBtn.style.top  || 0)) < 25
        );

        noBtn.style.left = nx + 'px';
        noBtn.style.top  = ny + 'px';

        noAttempts++;
        const shrink = Math.max(0.5, 1 - noAttempts * 0.06);
        const fade   = Math.max(0.3, 1 - noAttempts * 0.09);
        noBtn.style.transform = `scale(${shrink})`;
        noBtn.style.opacity   = String(fade);
    }

    noBtn.addEventListener('mouseenter', moveNo);
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveNo();
    }, { passive: false });

    // ── Botón SÍ ──────────────────────────────────────────────────
    yesBtn.addEventListener('click', () => {
        yesBtn.style.display = 'none';
        noBtn.style.display  = 'none';
        respMsg.classList.remove('hidden');

        const colors = ['#e91e63','#f48fb1','#c2185b','#f06292','#ffffff','#ff80ab'];
        const boom   = () => {
            confetti({ particleCount: 120, spread: 80,  origin: { y: 0.55 }, colors });
            confetti({ particleCount: 80,  angle: 60,   spread: 60, origin: { x: 0, y: 0.7 }, colors });
            confetti({ particleCount: 80,  angle: 120,  spread: 60, origin: { x: 1, y: 0.7 }, colors });
        };
        boom();
        setTimeout(boom, 900);
        setTimeout(() => confetti({
            particleCount: 60, spread: 110,
            origin: { y: 0.35 }, colors, shapes: ['star'], scalar: 1.2
        }), 1800);
    });
});

/* =========================================================
   BIRTHDAY WEBSITE · script.js
   Modul: Confetti · FX (partikel latar) · Music · Stage (navigasi)
          Envelope · Cake · Wishes · Letter · Reminders
   Teks kartu harapan & pengingat ada di bagian CONTENT.
   ========================================================= */
'use strict';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = matchMedia('(max-width: 640px)').matches;

  /* ===================== CONTENT ===================== */
  const WISHES = [
    'always be happy, even on your hardest days.',
    'may all your dreams come true.',
    'never stop believing in yourself.',
    'stay healthy and take care of yourself.',
    'may you always be surrounded by good people.',
    'never lose your beautiful smile.',
    'be proud of every little achievement.',
    "don't be afraid to try something new.",
    'may your days be filled with laughter.',
    'always find reasons to keep going.',
    'never forget how precious you are.',
    'may you find peace in everything you do.',
    'keep growing and becoming a better person.',
    "don't let anyone make you feel less worthy.",
    'may life treat you kindly.',
    'always remember that you deserve happiness.'
  ];

  const REMINDERS = [
    "you're doing better than you think.",
    "it's okay to have bad days.",
    "you don't have to be perfect.",
    'your happiness matters.',
    "take your time, there's no rush.",
    'always be kind to yourself.'
  ];

  /* ===================== CONFETTI ===================== */
  const Confetti = (() => {
    const canvas = $('#fx-confetti');
    const ctx = canvas.getContext('2d');
    const COLORS = ['#F8C8DC', '#FCE4EC', '#F4A9C4', '#FFE3B8', '#E8B4CB', '#FFFFFF', '#F6D5C8'];
    let w = 0, h = 0, pieces = [], raf = 0, last = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y, count) {
      if (x == null) x = w / 2;
      if (y == null) y = h * 0.3;
      if (count == null) count = isSmall ? 55 : 90;
      if (reduceMotion) count = Math.round(count / 3);
      for (let i = 0; i < count; i++) {
        pieces.push({
          x, y,
          vx: (Math.random() - .5) * 9,
          vy: -Math.random() * 9 - 2,
          g: .22 + Math.random() * .1,
          size: 5 + Math.random() * 6,
          rot: Math.random() * 6.28,
          vr: (Math.random() - .5) * .3,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          round: Math.random() < .35,
          life: 0,
          max: 140 + Math.random() * 80
        });
      }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    function tick(t) {
      const dt = Math.min((t - last) / 16.67, 3);
      last = t;
      ctx.clearRect(0, 0, w, h);
      pieces = pieces.filter(p => p.life < p.max && p.y < h + 20);
      for (const p of pieces) {
        p.vy += p.g * dt; p.vx *= .992;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt; p.life += dt;
        ctx.globalAlpha = Math.min(1, (p.max - p.life) / 40);
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.size / 2.2, 0, 6.283); ctx.fill(); }
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      if (pieces.length) raf = requestAnimationFrame(tick);
      else { raf = 0; ctx.clearRect(0, 0, w, h); }
    }

    addEventListener('resize', resize);
    resize();
    return { burst };
  })();

  /* ===================== FX · partikel latar ===================== */
  const FX = (() => {
    const canvas = $('#fx-bg');
    const ctx = canvas.getContext('2d');

    // komposisi partikel per section (bobot relatif)
    const MOODS = {
      opening:   { petal: .45, star: .3,  sparkle: .25 },
      greeting:  { heart: .4,  sparkle: .35, petal: .25 },
      wishes:    { heart: .3,  sparkle: .4,  star: .3 },
      letter:    { petal: .6,  heart: .2,  sparkle: .2 },
      reminders: { sparkle: .4, glow: .4,  heart: .2 },
      final:     { star: .3,   heart: .3,  glow: .4 }
    };
    const COLORS = {
      heart:   ['#F4A9C4', '#F8C8DC', '#EFA3C0'],
      petal:   ['#F8C8DC', '#FBD5E4', '#F2B5CD', '#FFFFFF'],
      sparkle: ['#F4B8D0', '#FFFFFF', '#FFD9A8'],
      star:    ['#F4B8D0', '#FFE3B8', '#FFFFFF'],
      glow:    ['#FFFFFF', '#F6B6CF']
    };
    const COUNT = reduceMotion ? 10 : (isSmall ? 22 : 36);
    const SPEED = reduceMotion ? .4 : 1;

    // sprite glow dibuat sekali supaya ringan
    const glowSprites = {};
    COLORS.glow.forEach(c => {
      const s = 64, cv = document.createElement('canvas');
      cv.width = cv.height = s;
      const g = cv.getContext('2d');
      const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      gr.addColorStop(0, c); gr.addColorStop(1, c + '00');
      g.fillStyle = gr; g.fillRect(0, 0, s, s);
      glowSprites[c] = cv;
    });

    let w = 0, h = 0, mood = 'opening', parts = [], raf = 0, last = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pickType() {
      const m = MOODS[mood];
      const entries = Object.entries(m);
      let r = Math.random() * entries.reduce((a, [, v]) => a + v, 0);
      for (const [k, v] of entries) { if ((r -= v) <= 0) return k; }
      return entries[0][0];
    }

    function spawn(p, initial) {
      p.type = pickType();
      const list = COLORS[p.type];
      p.color = list[(Math.random() * list.length) | 0];
      p.fade = initial ? Math.random() : 0;
      p.dying = false;
      p.phase = Math.random() * 6.28;
      p.rot = Math.random() * 6.28;
      p.vr = (Math.random() - .5) * .03;
      p.x = Math.random() * w;
      switch (p.type) {
        case 'heart':
          p.size = 9 + Math.random() * 10; p.vy = -(.25 + Math.random() * .35); p.base = .55;
          p.y = initial ? Math.random() * h : h + 24; p.vr = 0; break;
        case 'petal':
          p.size = 6 + Math.random() * 6; p.vy = .35 + Math.random() * .45; p.base = .8;
          p.y = initial ? Math.random() * h : -24; break;
        case 'sparkle':
          p.size = 5 + Math.random() * 7; p.vy = -.05; p.base = .95; p.tw = .6 + Math.random();
          p.y = Math.random() * h; p.vr = 0; break;
        case 'star':
          p.size = 3 + Math.random() * 4; p.vy = -.04; p.base = .85; p.tw = .5 + Math.random();
          p.y = Math.random() * h; p.vr = 0; break;
        case 'glow':
          p.size = 50 + Math.random() * 70; p.vy = -.12; p.base = .5;
          p.y = initial ? Math.random() * h : h + 60; p.vr = 0; break;
      }
    }

    // path helpers (digambar di titik 0,0)
    function heart(s) {
      ctx.beginPath();
      ctx.moveTo(0, s * .35);
      ctx.bezierCurveTo(-s * .65, -s * .05, -s * .35, -s * .55, 0, -s * .2);
      ctx.bezierCurveTo(s * .35, -s * .55, s * .65, -s * .05, 0, s * .35);
      ctx.closePath();
    }
    function petal(s) {
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * .6, -s * .5, s * .45, s * .6, 0, s);
      ctx.bezierCurveTo(-s * .45, s * .6, -s * .6, -s * .5, 0, -s);
      ctx.closePath();
    }
    function sparkle(s) {
      const k = s * .14;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(k, -k, s, 0);
      ctx.quadraticCurveTo(k, k, 0, s);
      ctx.quadraticCurveTo(-k, k, -s, 0);
      ctx.quadraticCurveTo(-k, -k, 0, -s);
      ctx.closePath();
    }
    function star(r) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
    }

    function frame(t) {
      const dt = Math.min((t - last) / 16.67, 3) * SPEED;
      last = t;
      ctx.clearRect(0, 0, w, h);

      for (const p of parts) {
        p.phase += .02 * dt;
        p.y += p.vy * dt;
        if (p.type === 'heart' || p.type === 'petal') p.x += Math.sin(p.phase) * .35 * dt;
        else p.x += Math.sin(p.phase * .5) * .08 * dt;
        p.rot += p.vr * dt;

        p.fade = p.dying ? p.fade - .02 * dt : Math.min(1, p.fade + .02 * dt);
        const off = p.y < -90 || p.y > h + 90;
        if ((p.dying && p.fade <= 0) || off) { spawn(p, false); continue; }

        let a = p.base * p.fade;
        if (p.tw) a *= .45 + .55 * Math.abs(Math.sin(p.phase * p.tw * 2));
        ctx.globalAlpha = a;

        if (p.type === 'glow') {
          ctx.drawImage(glowSprites[p.color], p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          continue;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        if (p.type === 'petal') {
          ctx.rotate(p.rot + Math.sin(p.phase) * .6);
          ctx.scale(.7, 1);
          petal(p.size);
        } else if (p.type === 'heart') {
          ctx.rotate(Math.sin(p.phase) * .25);
          heart(p.size);
        } else if (p.type === 'sparkle') {
          sparkle(p.size);
        } else {
          star(p.size);
        }
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function setMood(name) {
      if (!MOODS[name]) return;
      mood = name;
      parts.forEach(p => { p.dying = !(p.type in MOODS[mood]); });
    }

    function start() {
      resize();
      for (let i = 0; i < COUNT; i++) { const p = {}; spawn(p, true); parts.push(p); }
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    });

    start();
    return { setMood };
  })();

  /* ===================== MUSIC ===================== */
  // Satu elemen <audio> di luar semua section → tidak pernah restart saat pindah section.
  const Music = (() => {
    const audio = $('#bgm');
    const box = $('#music');
    const btn = $('#musicBtn');
    const text = $('#musicText');
    const hint = $('#musicHint');
    const hintText = $('#musicHintText');
    const retry = $('#musicRetry');

    audio.volume = 0.35;

    const LABEL = { off: 'music off', playing: 'now playing', paused: 'music paused' };

    function setState(state) {
      box.dataset.state = state;
      text.textContent = LABEL[state];
      const playing = state === 'playing';
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', playing ? 'pause music' : 'play music');
    }

    function showHint(msg) { hintText.textContent = msg; hint.hidden = false; }
    function hideHint() { hint.hidden = true; }

    async function play() {
      audio.volume = 0.35;
      try {
        await audio.play();
        hideHint();
      } catch (err) {
        if (err && err.name === 'NotAllowedError') {
          showHint('the browser blocked the music. tap the button below to play it.');
        } else {
          showHint('birthday-music.mp3 could not be played. check that it is inside the assets folder.');
        }
      }
    }

    audio.addEventListener('playing', () => { setState('playing'); hideHint(); });
    audio.addEventListener('pause', () => { if (box.dataset.state === 'playing') setState('paused'); });
    audio.addEventListener('error', () => {
      showHint('birthday-music.mp3 was not found in the assets folder.');
    });

    btn.addEventListener('click', () => {
      if (audio.paused) play();
      else audio.pause();
    });
    retry.addEventListener('click', play);

    setState('off');
    return { start: play };
  })();

  /* ===================== STAGE · navigasi antar section ===================== */
  const Stage = (() => {
    const slides = $$('.slide');
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const dotsWrap = $('#navDots');
    const hooks = {};
    let current = 0;
    let unlocked = false;

    slides.forEach((s, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `go to section ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      li.appendChild(b);
      dotsWrap.appendChild(li);
    });
    const dots = $$('li', dotsWrap);

    function render() {
      slides.forEach((s, i) => {
        const pos = i < current ? 'before' : i > current ? 'after' : 'active';
        s.dataset.pos = pos;
        s.inert = pos !== 'active';
        s.setAttribute('aria-hidden', String(pos !== 'active'));
      });
      const s = slides[current];
      document.body.dataset.tone = s.dataset.tone;
      FX.setMood(s.dataset.mood);
      dots.forEach((li, i) => {
        li.classList.toggle('on', i === current);
        if (i === current) li.firstChild.setAttribute('aria-current', 'step');
        else li.firstChild.removeAttribute('aria-current');
      });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
      s.scrollTop = 0;
    }

    function goTo(i) {
      if (i < 0 || i >= slides.length || i === current) return;
      if (i > 0 && !unlocked) return; // amplop harus dibuka dulu
      const from = slides[current].id;
      current = i;
      render();
      if (hooks[from] && hooks[from].leave) hooks[from].leave();
      const to = slides[current].id;
      if (hooks[to] && hooks[to].enter) hooks[to].enter();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    document.addEventListener('keydown', e => {
      if ($('#wishModal').classList.contains('is-open')) return;
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    render();

    return {
      goTo,
      next: () => goTo(current + 1),
      unlock() { unlocked = true; document.body.dataset.opened = 'true'; },
      on(id, h) { hooks[id] = h; }
    };
  })();

  /* ===================== 1 · ENVELOPE ===================== */
  (() => {
    const env = $('#envelope');
    const btn = $('#openBtn');
    let opened = false;

    function open() {
      if (opened) { Stage.next(); return; }
      opened = true;
      env.classList.add('is-open');
      btn.disabled = true;
      Music.start();   // dipanggil langsung dari klik → lolos aturan autoplay browser
      Stage.unlock();
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'continue ♡';
        Stage.next();
      }, reduceMotion ? 600 : 2300);
    }

    btn.addEventListener('click', open);
    env.addEventListener('click', () => { if (!opened) open(); });
    env.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && !opened) { e.preventDefault(); open(); }
    });
  })();

  /* ===================== 2 · CAKE ===================== */
  (() => {
    const g = $('#candles');
    const NS = 'http://www.w3.org/2000/svg';
    const make = (tag, attrs) => {
      const el = document.createElementNS(NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      return el;
    };

    for (let i = 0; i < 16; i++) {
      const x = 84 + i * (152 / 15);
      g.appendChild(make('rect', {
        x: x - 2.5, y: 80, width: 5, height: 26, rx: 1.5,
        fill: i % 2 ? '#FFFFFF' : '#F4A9C4'
      }));
      g.appendChild(make('ellipse', { cx: x, cy: 70, rx: 5.5, ry: 8, fill: '#FFE3B8', opacity: '.35' }));
      const flame = make('ellipse', { cx: x, cy: 72, rx: 2.8, ry: 5.2, fill: '#FFD08A', class: 'flame' });
      flame.style.setProperty('--fd', (-Math.random() * 1.3).toFixed(2) + 's');
      g.appendChild(flame);
    }

    $('#cake').addEventListener('click', e => Confetti.burst(e.clientX, e.clientY, 40));

    let t = 0;
    Stage.on('s2', {
      enter() { clearTimeout(t); t = setTimeout(() => Confetti.burst(innerWidth / 2, innerHeight * .3), 650); },
      leave() { clearTimeout(t); }
    });
  })();

  /* ===================== 3 · WISHES ===================== */
  (() => {
    const grid = $('#wishGrid');
    const progress = $('#wishProgress');
    const modal = $('#wishModal');
    const numFront = $('#wishNumFront');
    const num = $('#wishNum');
    const msg = $('#wishText');
    const closeBtn = $('#wishClose');
    const seen = new Set();
    let lastFocus = null, flipTimer = 0;

    WISHES.forEach((_, i) => {
      const n = String(i + 1).padStart(2, '0');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wish';
      b.setAttribute('aria-label', `wish ${n}`);
      b.innerHTML = `<span>${n}</span><svg class="wish__h" aria-hidden="true"><use href="#i-heart"/></svg>`;
      b.addEventListener('click', () => openWish(i, b));
      grid.appendChild(b);
    });

    function openWish(i, card) {
      const n = String(i + 1).padStart(2, '0');
      numFront.textContent = n;
      num.textContent = n;
      msg.textContent = WISHES[i];
      lastFocus = card;

      modal.inert = false;
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      clearTimeout(flipTimer);
      flipTimer = setTimeout(() => {
        modal.classList.add('is-flipped');
        Confetti.burst(innerWidth / 2, innerHeight / 2, 14);
      }, reduceMotion ? 0 : 380);
      closeBtn.focus({ preventScroll: true });

      card.classList.add('is-opened');
      seen.add(i);
      progress.textContent = seen.size === 16 ? 'all 16 wishes opened ♡' : `${seen.size} of 16 opened`;
      if (seen.size === 16) setTimeout(() => Confetti.burst(innerWidth / 2, innerHeight * .4, 70), 1400);
    }

    function closeWish() {
      clearTimeout(flipTimer);
      modal.classList.remove('is-flipped', 'is-open');
      modal.setAttribute('aria-hidden', 'true');
      modal.inert = true;
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }

    modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeWish(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeWish();
    });
  })();

  /* ===================== 4 · LETTER ===================== */
  (() => {
    const btn = $('#letterBtn');
    const letter = $('#letter');
    const slide = $('#s4');
    let done = false;

    btn.addEventListener('click', () => {
      if (done) return;
      done = true;
      btn.setAttribute('aria-expanded', 'true');
      btn.hidden = true;
      letter.hidden = false;

      // paragraf muncul pelan-pelan saat tergulir ke layar
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { root: slide, threshold: .12 });
      $$('.reveal', letter).forEach(p => io.observe(p));

      requestAnimationFrame(() => requestAnimationFrame(() => letter.classList.add('is-in')));
    });
  })();

  /* ===================== 5 · REMINDERS ===================== */
  (() => {
    const el = $('#reminderText');
    const dotsEl = $('#reminderDots');
    REMINDERS.forEach(() => dotsEl.appendChild(document.createElement('i')));
    const dots = $$('i', dotsEl);
    let i = 0, interval = 0, swapTimer = 0;

    function show(n, instant) {
      i = n;
      clearTimeout(swapTimer);
      el.classList.remove('is-in');
      swapTimer = setTimeout(() => {
        el.textContent = REMINDERS[i];
        dots.forEach((d, k) => d.classList.toggle('on', k === i));
        el.classList.add('is-in');
      }, instant ? 30 : 800);
    }

    function stop() { clearInterval(interval); clearTimeout(swapTimer); interval = 0; }

    Stage.on('s5', {
      enter() {
        stop();
        el.textContent = '';
        setTimeout(() => show(0, true), 700);
        interval = setInterval(() => show((i + 1) % REMINDERS.length), 4400);
      },
      leave: stop
    });
  })();

  /* ===================== 6 · FINAL ===================== */
  (() => {
    $('#replayBtn').addEventListener('click', () => Stage.goTo(0));
    let t = 0;
    Stage.on('s6', {
      enter() { clearTimeout(t); t = setTimeout(() => Confetti.burst(innerWidth / 2, innerHeight * .25, 30), 900); },
      leave() { clearTimeout(t); }
    });
  })();
})();
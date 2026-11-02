/* ==========================================================
   Shreya Roshan — "Now Shipping"
   Interactions, mini-games and easter eggs.
   ========================================================== */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  /* ---------------------------------------------------------
     Easter egg registry
     --------------------------------------------------------- */
  const EGGS = {
    launch:     { name: "Liftoff",          hint: "Every launch needs a countdown." },
    eclipse:    { name: "Total eclipse",    hint: "The moon is ticklish. Keep poking it." },
    konami:     { name: "Zero gravity",     hint: "↑ ↑ ↓ ↓ ← → ← → B A (keyboard)" },
    sudo:       { name: "Root access",      hint: "Type a superuser command anywhere on the page." },
    polyglot:   { name: "Polyglot",         hint: "Say hi in the fourth spoken language." },
    astronomer: { name: "Astronomer",       hint: "Cluster 30+ stars in the playground." },
    astronaut:  { name: "Lost & found",     hint: "Someone is drifting below the lineup." },
    hire:       { name: "DevTools diver",   hint: "Developers: open the console." },
  };
  const STORE_KEY = "sr-eggs-v1";
  let found = new Set();
  try { found = new Set(JSON.parse(localStorage.getItem(STORE_KEY) || "[]").filter((k) => k in EGGS)); } catch (_) {}

  const eggCount = $("#eggCount"), eggCount2 = $("#eggCount2"), eggPill = $("#eggPill");
  $("#eggTotal").textContent = Object.keys(EGGS).length;
  const renderEggs = () => {
    eggCount.textContent = found.size;
    eggCount2.textContent = found.size;
    $("#eggList").innerHTML = Object.entries(EGGS).map(([k, e]) =>
      found.has(k)
        ? `<li class="got"><span>✦</span><span><b>${e.name}</b></span></li>`
        : `<li><span>?</span><span>${e.hint}</span></li>`
    ).join("");
  };
  renderEggs();

  function egg(key) {
    if (!EGGS[key] || found.has(key)) return false;
    found.add(key);
    try { localStorage.setItem(STORE_KEY, JSON.stringify([...found])); } catch (_) {}
    renderEggs();
    eggPill.classList.remove("bump"); void eggPill.offsetWidth; eggPill.classList.add("bump");
    const total = Object.keys(EGGS).length;
    toast(`Easter egg ${found.size}/${total}`, `✦ ${EGGS[key].name}`);
    if (found.size === total) {
      setTimeout(() => {
        toast("All eggs found", "You found every secret. Honestly, just email me. 💌");
        burst(innerWidth / 2, innerHeight / 2, 120);
      }, 1200);
    }
    return true;
  }

  const dialog = $("#eggDialog");
  const openLog = () => { renderEggs(); dialog.showModal ? dialog.showModal() : dialog.setAttribute("open", ""); };
  eggPill.addEventListener("click", openLog);
  $("#hintBtn").addEventListener("click", openLog);

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  const toasts = $("#toasts");
  function toast(label, msg, ms = 3800) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<small>${label}</small>${msg}`;
    toasts.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, ms);
  }

  /* ---------------------------------------------------------
     Sparkle layer (cursor trail + bursts)
     --------------------------------------------------------- */
  const sc = $("#sparkle"), sctx = sc.getContext("2d");
  const parts = [];
  let sparkRunning = false;
  const SPARK_COLORS = ["#ffffff", "#ddd1ff", "#ffc2a8", "#ff8fb1", "#b9a4ff", "#ffe08a"];
  function sizeSparkle() {
    const d = Math.min(devicePixelRatio || 1, 2);
    sc.width = innerWidth * d; sc.height = innerHeight * d;
    sc.style.width = innerWidth + "px"; sc.style.height = innerHeight + "px";
    sctx.setTransform(d, 0, 0, d, 0, 0);
  }
  sizeSparkle();
  addEventListener("resize", sizeSparkle);

  function spawn(x, y, vx, vy, life, size) {
    parts.push({ x, y, vx, vy, life, max: life, size, c: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0], rot: rand(0, Math.PI) });
    if (!sparkRunning) { sparkRunning = true; requestAnimationFrame(sparkLoop); }
  }
  function drawStar(ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(0, -r); ctx.rotate(Math.PI / 4); ctx.lineTo(0, -r * 0.3); ctx.rotate(Math.PI / 4);
    }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function sparkLoop() {
    sctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life--; p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.vx *= 0.98; p.rot += 0.05;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      sctx.globalAlpha = p.life / p.max;
      sctx.fillStyle = p.c;
      drawStar(sctx, p.x, p.y, p.size * (0.4 + 0.6 * p.life / p.max), p.rot);
    }
    sctx.globalAlpha = 1;
    if (parts.length) requestAnimationFrame(sparkLoop);
    else { sparkRunning = false; sctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function burst(x, y, n = 40) {
    if (reduceMotion) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2), s = rand(2, 8);
      spawn(x, y, Math.cos(a) * s, Math.sin(a) * s - 2, rand(40, 90), rand(3, 7));
    }
  }
  if (finePointer && !reduceMotion) {
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 28) return;
      last = now;
      spawn(e.clientX, e.clientY, rand(-0.5, 0.5), rand(-0.5, 0.3), 32, rand(1.5, 3.2));
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Nav: switch style over paper sections
     --------------------------------------------------------- */
  const nav = $(".nav");
  function navTheme() {
    const els = document.elementsFromPoint(innerWidth / 2, 40);
    const onPaper = els.some((el) => el !== nav && !nav.contains(el) && el.closest && el.closest(".paper, .ticker"));
    nav.classList.toggle("on-paper", onPaper);
  }
  addEventListener("scroll", navTheme, { passive: true });
  navTheme();

  /* ---------------------------------------------------------
     Hero sky: stars, shooting stars, warp
     --------------------------------------------------------- */
  const hero = $(".hero");
  const sky = $("#sky"), ctx = sky.getContext("2d");
  let W = 0, H = 0, stars = [], warp = 0, warpTarget = 0, heroVisible = true, shooting = null;
  function sizeSky() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    sky.width = W * d; sky.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.round(Math.min(260, (W * H) / 5200));
    stars = Array.from({ length: n }, () => newStar());
  }
  function newStar() {
    return { x: rand(0, W), y: rand(0, H * 0.78), r: Math.random() ** 2 * 1.6 + 0.3, t: rand(0, 6.28), s: rand(0.01, 0.04) };
  }
  sizeSky();
  addEventListener("resize", sizeSky);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(hero);

  function skyLoop() {
    requestAnimationFrame(skyLoop);
    if (!heroVisible) return;
    warp += (warpTarget - warp) * 0.05;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.45;
    for (const st of stars) {
      st.t += st.s;
      const alpha = 0.35 + 0.65 * Math.abs(Math.sin(st.t));
      if (warp > 0.02) {
        const dx = st.x - cx, dy = st.y - cy;
        const k = warp * 0.06;
        const nx = st.x + dx * k, ny = st.y + dy * k;
        ctx.strokeStyle = `rgba(255,240,255,${Math.min(1, alpha + warp * 0.3)})`;
        ctx.lineWidth = st.r;
        ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(nx, ny); ctx.stroke();
        st.x = nx; st.y = ny;
        if (st.x < -20 || st.x > W + 20 || st.y < -20 || st.y > H + 20) {
          st.x = cx + rand(-W * 0.15, W * 0.15); st.y = cy + rand(-H * 0.12, H * 0.12);
        }
      } else {
        ctx.fillStyle = `rgba(255,245,255,${alpha})`;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, 6.283); ctx.fill();
      }
    }
    // shooting star
    if (!shooting && Math.random() < 0.004 && !reduceMotion) {
      shooting = { x: rand(W * 0.1, W * 0.8), y: rand(0, H * 0.3), vx: rand(7, 11), vy: rand(2, 4), life: 60 };
    }
    if (shooting) {
      const s = shooting;
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
      g.addColorStop(0, `rgba(255,255,255,${s.life / 60})`); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10); ctx.stroke();
      s.x += s.vx; s.y += s.vy; s.life--;
      if (s.life <= 0) shooting = null;
    }
  }
  requestAnimationFrame(skyLoop);

  function hyperspace(ms = 2200) {
    if (reduceMotion) return;
    warpTarget = 1;
    setTimeout(() => {
      warpTarget = 0;
      setTimeout(() => { stars.forEach((s) => Object.assign(s, newStar())); }, 900);
    }, ms);
  }

  /* parallax */
  const depthEls = $$("[data-depth]");
  if (!reduceMotion) {
    let tx = 0, ty = 0, px = 0, py = 0;
    hero.addEventListener("pointermove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
    });
    (function para() {
      px += (tx - px) * 0.06; py += (ty - py) * 0.06;
      const sy = Math.min(scrollY, innerHeight);
      for (const el of depthEls) {
        const d = +el.dataset.depth;
        el.style.transform = `translate3d(${-px * d}px, ${-py * d + sy * d * 0.012}px, 0)`;
      }
      requestAnimationFrame(para);
    })();
  }

  /* stat counters */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1600;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  setTimeout(() => $$("[data-count]").forEach(countUp), 400);

  /* ---------------------------------------------------------
     Launch sequence
     --------------------------------------------------------- */
  const launchBtn = $("#launchBtn"), countdown = $("#countdown"), rocket = $("#rocket");
  let launching = false;
  launchBtn.addEventListener("click", () => {
    if (launching) return;
    launching = true;
    launchBtn.disabled = true;
    const seq = ["3", "2", "1"];
    let i = 0;
    (function next() {
      if (i < seq.length) {
        countdown.innerHTML = `<span>${seq[i]}</span>`;
        i++;
        setTimeout(next, 850);
      } else {
        countdown.innerHTML = "";
        hero.classList.add("shake");
        rocket.classList.remove("go"); void rocket.offsetWidth; rocket.classList.add("go");
        hyperspace(2400);
        const r = launchBtn.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 70);
        egg("launch");
        setTimeout(() => {
          hero.classList.remove("shake");
          launchBtn.innerHTML = `<span class="play">✓</span> Launched. Replay?`;
          launchBtn.disabled = false;
          launching = false;
        }, 2600);
      }
    })();
  });

  /* moon */
  const moon = $("#moon");
  let moonHits = 0;
  const moonLines = ["hey!", "that tickles", "stop it 🙈", "ok fine…"];
  moon.addEventListener("click", (e) => {
    moon.classList.remove("wobble"); void moon.offsetWidth; moon.classList.add("wobble");
    if (moon.classList.contains("eclipse")) {
      moon.classList.remove("eclipse"); moonHits = 0; return;
    }
    if (moonHits < moonLines.length) toast("moon.say()", moonLines[moonHits], 1600);
    moonHits++;
    burst(e.clientX, e.clientY, 12);
    if (moonHits >= 5) {
      moon.classList.add("eclipse");
      egg("eclipse");
      burst(e.clientX, e.clientY, 60);
    }
  });

  /* logo: triple-click → hyperspace */
  const logo = $("#logo");
  let logoClicks = 0, logoTimer;
  logo.addEventListener("click", () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => {
      if (logoClicks >= 3) {
        logo.classList.add("spin");
        setTimeout(() => logo.classList.remove("spin"), 700);
        scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        hyperspace(1800);
        toast("warp drive", "Engaging hyperspace ✦", 2200);
      } else {
        scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }
      logoClicks = 0;
    }, 320);
  });

  /* ---------------------------------------------------------
     Keyboard eggs: konami + sudo
     --------------------------------------------------------- */
  const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
  let keyBuf = [], typed = "";
  addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    const k = e.key.toLowerCase();
    keyBuf.push(k); keyBuf = keyBuf.slice(-KONAMI.length);
    if (keyBuf.join() === KONAMI.join()) { keyBuf = []; toggleZeroG(); }
    if (k.length === 1) {
      typed = (typed + k).slice(-12);
      if (typed.endsWith("sudo")) {
        typed = "";
        toast("sudo", "shreya is not in the sudoers file. This incident will be reported… to her inbox. Just email her instead. 🍪", 5200);
        egg("sudo");
      }
      if (typed.endsWith("hello") || typed.endsWith("hi shreya")) {
        typed = "";
        toast("echo", "hi back! 👋 (try the moon)", 2600);
      }
    }
    if (k === "escape" && document.body.classList.contains("zero-g")) toggleZeroG();
  });

  let zgTimer;
  function toggleZeroG() {
    const on = !document.body.classList.contains("zero-g");
    clearTimeout(zgTimer);
    if (on) {
      $$(".hero-window, .card, .sticker, .stamp, .box, .smiley, .display, .release, .contact-link, .spec-table > div, .contact-title, .lab").forEach((el) => {
        el.classList.add("zg");
        el.style.setProperty("--fx", rand(-40, 40) + "px");
        el.style.setProperty("--fy", rand(-50, 20) + "px");
        el.style.setProperty("--fr", rand(-10, 10) + "deg");
        el.style.setProperty("--fd", rand(3, 7) + "s");
      });
      document.body.classList.add("zero-g");
      toast("gravity.disable()", "Zero-G mode on. Enter the code again or press Esc to land.", 4200);
      egg("konami");
      zgTimer = setTimeout(toggleZeroG, 20000);
    } else {
      document.body.classList.remove("zero-g");
      toast("gravity.enable()", "Touchdown. Welcome back. 🌍", 2000);
    }
  }

  /* ---------------------------------------------------------
     Languages hover → polyglot
     --------------------------------------------------------- */
  $$(".langs span").forEach((s) => s.setAttribute("tabindex", "0"));
  const jp = $("#jp");
  const greet = () => egg("polyglot");
  jp.addEventListener("mouseenter", greet);
  jp.addEventListener("focus", greet);
  jp.addEventListener("click", greet);

  /* ---------------------------------------------------------
     Changelog accordion
     --------------------------------------------------------- */
  $$(".release").forEach((rel) => {
    const btn = $(".rel-head", rel);
    btn.addEventListener("click", () => {
      const open = rel.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------------------------------------------------------
     Product cards: tilt + flip
     --------------------------------------------------------- */
  $$(".card").forEach((card) => {
    if (finePointer && !reduceMotion) {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(0)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    }
    const flip = () => card.classList.toggle("flipped");
    card.addEventListener("click", flip);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });

  /* astronaut */
  const astro = $("#astronaut");
  astro.addEventListener("click", (e) => {
    e.stopPropagation();
    burst(e.clientX, e.clientY, 40);
    toast("🧑‍🚀", "Thanks for finding me! I was looking for the playground…", 3200);
    egg("astronaut");
    astro.classList.add("found");
    setTimeout(() => astro.remove(), 2000);
  });

  /* ---------------------------------------------------------
     Playground: k-means constellations
     --------------------------------------------------------- */
  const kc = $("#kmeans"), kx = kc.getContext("2d"), kwrap = kc.parentElement;
  const COLORS = ["#b9a4ff", "#ff8fb1", "#ffc2a8", "#7fd6ff", "#c6f5c9", "#ffe08a", "#f4f0ff"];
  let KW = 0, KH = 0, pts = [], cents = [], kAnim = null, iter = 0, inertia = null, kVisible = false;
  const kSlider = $("#kSlider"), kVal = $("#kVal"), readout = $("#labReadout"), empty = $("#labEmpty");

  function sizeK() {
    const d = Math.min(devicePixelRatio || 1, 2);
    const nw = kwrap.clientWidth, nh = kwrap.clientHeight;
    if (KW && nw) { const sx = nw / KW, sy = nh / KH; pts.forEach((p) => { p.x *= sx; p.y *= sy; }); cents.forEach((c) => { c.x *= sx; c.y *= sy; c.tx *= sx; c.ty *= sy; }); }
    KW = nw; KH = nh;
    kc.width = KW * d; kc.height = KH * d;
    kx.setTransform(d, 0, 0, d, 0, 0);
  }
  sizeK();
  addEventListener("resize", sizeK);
  new IntersectionObserver(([e]) => { kVisible = e.isIntersecting; }).observe(kwrap);

  const updateReadout = () => {
    readout.textContent = `stars: ${pts.length} · iter: ${iter} · inertia: ${inertia == null ? "—" : Math.round(inertia).toLocaleString()}`;
    empty.style.opacity = pts.length ? 0 : 0.5;
  };

  function addPt(x, y) {
    if (pts.length > 600) return;
    pts.push({ x, y, c: -1, tw: rand(0, 6.28), r: rand(1.4, 2.8) });
    updateReadout();
  }
  let painting = false, lastP = null;
  kc.addEventListener("pointerdown", (e) => {
    const r = kc.getBoundingClientRect();
    painting = true; kc.setPointerCapture(e.pointerId);
    lastP = { x: e.clientX - r.left, y: e.clientY - r.top };
    addPt(lastP.x, lastP.y);
  });
  kc.addEventListener("pointermove", (e) => {
    if (!painting) return;
    const r = kc.getBoundingClientRect();
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (Math.hypot(p.x - lastP.x, p.y - lastP.y) > 16) {
      addPt(p.x + rand(-6, 6), p.y + rand(-6, 6));
      lastP = p;
    }
  });
  const stopPaint = () => { painting = false; };
  kc.addEventListener("pointerup", stopPaint);
  kc.addEventListener("pointercancel", stopPaint);

  kSlider.addEventListener("input", () => { kVal.textContent = kSlider.value; });

  $("#scatterK").addEventListener("click", () => {
    const blobs = Math.round(rand(3, 6));
    for (let b = 0; b < blobs; b++) {
      const cx = rand(KW * 0.12, KW * 0.88), cy = rand(KH * 0.15, KH * 0.85), s = rand(24, 60);
      for (let i = 0; i < 16; i++) {
        // Box–Muller gaussian
        const u = 1 - Math.random(), v = Math.random();
        const m = Math.sqrt(-2 * Math.log(u));
        addPt(cx + m * Math.cos(6.283 * v) * s, cy + m * Math.sin(6.283 * v) * s);
      }
    }
  });
  $("#clearK").addEventListener("click", () => { pts = []; cents = []; iter = 0; inertia = null; kAnim = null; updateReadout(); });

  function initCentroids(k) {
    // k-means++
    const c = [pts[(Math.random() * pts.length) | 0]];
    while (c.length < k) {
      const d2 = pts.map((p) => Math.min(...c.map((q) => (p.x - q.x) ** 2 + (p.y - q.y) ** 2)));
      const sum = d2.reduce((a, b) => a + b, 0);
      let r = Math.random() * sum, i = 0;
      while (r > d2[i] && i < d2.length - 1) { r -= d2[i]; i++; }
      c.push(pts[i]);
    }
    return c.map((p, i) => ({ x: p.x, y: p.y, tx: p.x, ty: p.y, col: COLORS[i % COLORS.length], n: 0 }));
  }
  function assign() {
    inertia = 0;
    cents.forEach((c) => (c.n = 0));
    for (const p of pts) {
      let best = 0, bd = Infinity;
      cents.forEach((c, i) => { const d = (p.x - c.tx) ** 2 + (p.y - c.ty) ** 2; if (d < bd) { bd = d; best = i; } });
      p.c = best; cents[best].n++; inertia += bd;
    }
  }
  function recenter() {
    let moved = 0;
    cents.forEach((c, i) => {
      const mine = pts.filter((p) => p.c === i);
      if (!mine.length) return;
      const nx = mine.reduce((a, p) => a + p.x, 0) / mine.length;
      const ny = mine.reduce((a, p) => a + p.y, 0) / mine.length;
      moved += Math.hypot(nx - c.tx, ny - c.ty);
      c.x = c.tx; c.y = c.ty; c.tx = nx; c.ty = ny;
    });
    return moved;
  }
  $("#runK").addEventListener("click", () => {
    const k = +kSlider.value;
    if (pts.length < k) { toast("k-means", `Need at least ${k} stars. Click the sky, or hit “Scatter a galaxy”.`, 3000); return; }
    cents = initCentroids(k);
    iter = 0;
    assign(); updateReadout();
    const stepDelay = reduceMotion ? 0 : 520;
    const step = () => {
      iter++;
      const moved = recenter();
      kAnim = { t0: performance.now(), dur: stepDelay };
      setTimeout(() => {
        assign(); updateReadout();
        if (moved > 0.5 && iter < 20) step();
        else {
          kAnim = null;
          toast("k-means converged", `${iter} iterations · ${k} constellations ✦`, 2400);
          if (pts.length >= 30) egg("astronomer");
        }
      }, stepDelay);
    };
    step();
  });

  function kLoop(now) {
    requestAnimationFrame(kLoop);
    if (!kVisible) return;
    kx.clearRect(0, 0, KW, KH);
    let t = 1;
    if (kAnim && kAnim.dur) t = Math.min(1, (now - kAnim.t0) / kAnim.dur);
    const e = 1 - Math.pow(1 - t, 3);
    const cpos = cents.map((c) => ({ x: c.x + (c.tx - c.x) * e, y: c.y + (c.ty - c.y) * e, col: c.col, n: c.n }));
    // spokes
    kx.lineWidth = 0.8;
    for (const p of pts) {
      if (p.c < 0 || !cpos[p.c]) continue;
      const c = cpos[p.c];
      kx.strokeStyle = c.col + "40";
      kx.beginPath(); kx.moveTo(p.x, p.y); kx.lineTo(c.x, c.y); kx.stroke();
    }
    // stars
    for (const p of pts) {
      p.tw += 0.05;
      const col = p.c >= 0 && cpos[p.c] ? cpos[p.c].col : "#ffffff";
      kx.globalAlpha = 0.65 + 0.35 * Math.sin(p.tw);
      kx.fillStyle = col;
      kx.shadowColor = col; kx.shadowBlur = 8;
      kx.beginPath(); kx.arc(p.x, p.y, p.r, 0, 6.283); kx.fill();
    }
    kx.globalAlpha = 1; kx.shadowBlur = 0;
    // centroids as little planets
    for (const c of cpos) {
      const g = kx.createRadialGradient(c.x - 4, c.y - 4, 1, c.x, c.y, 13);
      g.addColorStop(0, "#fff"); g.addColorStop(0.5, c.col); g.addColorStop(1, c.col + "33");
      kx.fillStyle = g;
      kx.beginPath(); kx.arc(c.x, c.y, 12, 0, 6.283); kx.fill();
      kx.strokeStyle = c.col; kx.lineWidth = 1.2;
      kx.beginPath(); kx.ellipse(c.x, c.y, 20, 6, -0.35, 0, 6.283); kx.stroke();
      kx.fillStyle = "#fff"; kx.font = "11px JetBrains Mono, monospace";
      kx.fillText(String(c.n), c.x + 16, c.y - 12);
    }
  }
  requestAnimationFrame(kLoop);
  updateReadout();

  /* ---------------------------------------------------------
     Sticker board: drag, shuffle, tidy
     --------------------------------------------------------- */
  const board = $("#board"), stickers = $$(".sticker", board);
  function shuffle() {
    const bw = board.clientWidth, bh = board.clientHeight;
    stickers.forEach((s) => {
      const w = s.offsetWidth, h = s.offsetHeight;
      s.style.left = rand(10, Math.max(12, bw - w - 10)) + "px";
      s.style.top = rand(10, Math.max(12, bh - h - 34)) + "px";
      s.style.rotate = rand(-14, 14) + "deg";
    });
  }
  function tidy() {
    const bw = board.clientWidth, gap = 10;
    let x = 18, y = 18, rowH = 0;
    stickers.forEach((s) => {
      const w = s.offsetWidth, h = s.offsetHeight;
      if (x + w > bw - 18) { x = 18; y += rowH + gap; rowH = 0; }
      s.style.left = x + "px"; s.style.top = y + "px"; s.style.rotate = "0deg";
      x += w + gap; rowH = Math.max(rowH, h);
    });
  }
  let z = 20;
  stickers.forEach((s) => {
    let ox = 0, oy = 0, dragging = false;
    s.addEventListener("pointerdown", (e) => {
      dragging = true; s.setPointerCapture(e.pointerId);
      s.classList.add("dragging"); s.style.zIndex = ++z;
      const r = s.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
    });
    s.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const br = board.getBoundingClientRect();
      const x = Math.max(-20, Math.min(br.width - s.offsetWidth + 20, e.clientX - br.left - ox));
      const y = Math.max(-10, Math.min(br.height - s.offsetHeight + 10, e.clientY - br.top - oy));
      s.style.left = x + "px"; s.style.top = y + "px";
    });
    const end = () => { if (!dragging) return; dragging = false; s.classList.remove("dragging"); };
    s.addEventListener("pointerup", end);
    s.addEventListener("pointercancel", end);
  });
  $("#shuffle").addEventListener("click", shuffle);
  $("#tidy").addEventListener("click", tidy);
  // initial messy layout once fonts are ready so sizes are right
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => (board.clientWidth < 600 ? tidy() : shuffle()));
  let lastBW = board.clientWidth;
  addEventListener("resize", () => { if (Math.abs(board.clientWidth - lastBW) > 40) { lastBW = board.clientWidth; board.clientWidth < 600 ? tidy() : shuffle(); } });

  /* ---------------------------------------------------------
     Copy email
     --------------------------------------------------------- */
  const copyBtn = $("#copyEmail");
  copyBtn.addEventListener("click", async (e) => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      toast("clipboard", "Email copied ✦ Talk soon!", 2400);
      burst(e.clientX, e.clientY, 30);
    } catch (_) {
      location.href = "mailto:" + email;
    }
  });

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (el.closest(".cards, .stamps") ? (i % 3) * 90 : 0) + "ms";
    io.observe(el);
  });

  /* ---------------------------------------------------------
     Console egg
     --------------------------------------------------------- */
  console.log(
    "%c✦ Shreya Roshan v1.0 ✦",
    "font: 600 22px 'Space Grotesk', sans-serif; color: #b9a4ff; background: #120a26; padding: 10px 16px; border-radius: 10px;"
  );
  console.log("%cHello, fellow dev-tools explorer. Try running:  shreya.hire()", "font: 13px monospace; color: #ffc2a8;");
  window.shreya = {
    hire() {
      egg("hire");
      setTimeout(() => (location.href = "#contact"), 400);
      return "✦ Excellent decision. Redirecting you to the contact section…";
    },
    skills: ["Python", "PySpark", "SQL", "Databricks", "MLflow", "LLM agents", "FastAPI", "Docker"],
    eggs: () => `${found.size}/${Object.keys(EGGS).length} found`,
  };
})();

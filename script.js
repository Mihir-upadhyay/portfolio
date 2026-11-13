/* ==========================================================
   Mihir Upadhyay — portfolio interactions (vanilla JS, no deps)
   - scroll progress, nav scroll-spy, reveal on scroll, count-up
   - halftone portrait, animated dot visuals + tabs, accordion
   - motion on/off toggle (respects prefers-reduced-motion)
   ========================================================== */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;

  /* ---------- motion preference ---------- */
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var motionOn = !reduceMQ.matches;
  try {
    var saved = localStorage.getItem("motion");
    if (saved) motionOn = saved === "on";
  } catch (e) { /* storage may be unavailable */ }

  var motionListeners = [];
  var motionBtn = $("#motionBtn");

  function setMotion(on, persist) {
    motionOn = on;
    root.setAttribute("data-motion", on ? "on" : "off");
    if (motionBtn) {
      motionBtn.setAttribute("aria-pressed", String(on));
      $("span", motionBtn).textContent = on ? "Motion on" : "Motion off";
    }
    if (persist) {
      try { localStorage.setItem("motion", on ? "on" : "off"); } catch (e) { }
    }
    motionListeners.forEach(function (fn) { fn(on); });
  }
  if (motionBtn) {
    motionBtn.addEventListener("click", function () { setMotion(!motionOn, true); });
  }

  /* ---------- scroll progress + nav state ---------- */
  var progress = $("#progress");
  var nav = $("#nav");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = root.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
      progress.style.transform = "scaleX(" + p + ")";
      nav.classList.toggle("scrolled", window.scrollY > 40);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- scroll-spy ---------- */
  var spyLinks = $$("[data-spy]");
  var spyTargets = spyLinks.map(function (a) { return document.getElementById(a.dataset.spy); }).filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) {
            a.classList.toggle("is-on", a.dataset.spy === en.target.id);
          });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spyTargets.forEach(function (t) { spyIO.observe(t); });
    // clear highlight when back at the hero
    var hero = $("#top");
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) spyLinks.forEach(function (a) { a.classList.remove("is-on"); });
    }, { threshold: 0.4 }).observe(hero);
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revIO.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count-up ---------- */
  function fmt(v, dec, comma) {
    if (comma) return v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return v.toFixed(dec);
  }
  var counters = $$(".count");
  if ("IntersectionObserver" in window) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        cIO.unobserve(el);
        if (!motionOn) return; // keep the final value already in the markup
        var to = parseFloat(el.dataset.to);
        var dec = parseInt(el.dataset.dec || "0", 10);
        var comma = !!el.dataset.comma;
        var start = performance.now();
        var dur = 1400;
        (function tick(now) {
          var k = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - k, 4);
          el.textContent = fmt(to * eased, dec, comma);
          if (k < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cIO.observe(c); });
  }

  /* ---------- halftone portrait ---------- */
  (function portrait() {
    var wrap = $("#portrait");
    if (!wrap) return;
    var canvas = $("canvas", wrap);
    var fallback = $("img", wrap);
    // Put your own photo at images/mihir.jpg to use it; otherwise the GitHub avatar is used.
    var sources = ["images/mihir.jpg", "https://avatars.githubusercontent.com/u/169142515?s=460&v=4"];
    var loaded = null;
    var loadedSrc = "";

    function draw(img) {
      var cssW = wrap.clientWidth, cssH = wrap.clientHeight;
      if (!cssW || !cssH) return false;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      var step = Math.max(4, Math.round(cssW / 80));
      var cols = Math.ceil(cssW / step), rows = Math.ceil(cssH / step);
      var off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      var octx = off.getContext("2d", { willReadFrequently: true });

      var ir = img.naturalWidth / img.naturalHeight, cr = cols / rows, sw, sh, sx, sy;
      if (ir > cr) { sh = img.naturalHeight; sw = sh * cr; sx = (img.naturalWidth - sw) / 2; sy = 0; }
      else { sw = img.naturalWidth; sh = sw / cr; sx = 0; sy = (img.naturalHeight - sh) * 0.15; }
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);

      var data;
      try { data = octx.getImageData(0, 0, cols, rows).data; }
      catch (e) { return false; } // cross-origin / file:// -> use the plain image instead

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var i = (r * cols + c) * 4;
          var lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          var l = Math.max(0, Math.min(1, (lum - 0.08) / 0.8));
          l = Math.pow(l, 1.25);
          if (l < 0.05) continue;
          var x = (c + (r % 2 ? 0.5 : 0) + 0.5) * step;
          var y = (r + 0.5) * step;
          ctx.fillStyle = "rgba(236,226,210," + (0.35 + 0.65 * l).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, step * 0.52 * l + 0.2, 0, 6.2832);
          ctx.fill();
        }
      }
      return true;
    }

    function show(img) {
      loaded = img;
      if (draw(img)) {
        canvas.classList.add("ready");
      } else {
        fallback.src = loadedSrc;
        fallback.hidden = false;
        requestAnimationFrame(function () { fallback.classList.add("ready"); });
      }
    }

    function tryLoad(i) {
      if (i >= sources.length) { wrap.classList.add("none"); return; } // no photo reachable: collapse the space
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { loadedSrc = sources[i]; show(img); };
      img.onerror = function () { tryLoad(i + 1); };
      img.src = sources[i];
    }
    tryLoad(0);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (loaded && canvas.classList.contains("ready")) draw(loaded); }, 200);
    });

    // gentle parallax
    var heroEl = $("#top");
    heroEl.addEventListener("pointermove", function (e) {
      if (!motionOn) return;
      var x = (e.clientX / window.innerWidth - 0.5) * 2;
      var y = (e.clientY / window.innerHeight - 0.5) * 2;
      wrap.style.transform = "translate(" + (x * 8).toFixed(1) + "px," + (y * 6).toFixed(1) + "px)";
    });
    heroEl.addEventListener("pointerleave", function () { wrap.style.transform = ""; });
  })();

  /* ---------- animated dot visual + tabs ---------- */
  (function viz() {
    var canvas = $("#viz");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, t = 0, last = 0, raf = 0, visible = false;
    var mode = "structure";
    var mouse = { x: 0, y: 0, px: -999, py: -999, tx: 0, ty: 0 };
    var ACC = [232, 119, 78], CREAM = [240, 226, 206];

    // fibonacci sphere points
    var N = 1100, pts = [];
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }

    function mix(a, b, k) {
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
    function col(c, a) {
      return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + a.toFixed(3) + ")";
    }
    function dot(x, y, rad, c, a) {
      ctx.fillStyle = col(c, a);
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 6.2832);
      ctx.fill();
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function drawStructure() {
      var n = 34, s = Math.min(w, h) * 0.78, cx = w / 2, cy = h / 2 - 10;
      for (var a = 0; a < n; a++) {
        for (var b = 0; b < n; b++) {
          var u = a / (n - 1), v = b / (n - 1);
          var x = (u - 0.5) * s, y = (v - 0.5) * s;
          var wave = Math.sin(u * 6 + t * 1.1) * Math.cos(v * 5 - t * 0.8) + Math.sin((u + v) * 4 + t * 0.6) * 0.5;
          var px = cx + x + wave * 2, py = cy + y + wave * 7;
          var dx = px - mouse.px, dy = py - mouse.py;
          var bump = Math.exp(-(dx * dx + dy * dy) / 7200);
          py -= bump * 12;
          var k = (wave + 1.5) / 3;
          dot(px, py, 0.9 + k * 1.1 + bump * 1.2, mix(ACC, CREAM, k * 0.8 + bump), 0.22 + k * 0.6);
        }
      }
    }

    function drawConstellation() {
      var R = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2 - 6;
      var ang = t * 0.25 + mouse.x * 0.7, tilt = 0.25 + mouse.y * 0.4;
      var ca = Math.cos(ang), sa = Math.sin(ang), cb = Math.cos(tilt), sb = Math.sin(tilt);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        var x1 = p[0] * ca + p[2] * sa, z1 = -p[0] * sa + p[2] * ca;
        var y2 = p[1] * cb - z1 * sb, z2 = p[1] * sb + z1 * cb;
        var persp = 1.7 / (1.7 - z2 * 0.5);
        var depth = (z2 + 1) / 2;
        dot(cx + x1 * R * persp, cy + y2 * R * persp, 0.5 + depth * 1.3,
          i % 9 === 0 ? ACC : CREAM, 0.1 + depth * 0.8);
      }
    }

    function drawRipples() {
      var R = Math.min(w, h) * 0.44, cx = w / 2, cy = h / 2 - 6, rings = 26;
      dot(cx, cy, 2.2, ACC, 0.9);
      for (var k = 1; k <= rings; k++) {
        var rad = R * k / rings;
        var n = Math.max(6, Math.floor(6.2832 * rad / 7));
        var wave = Math.sin(k * 0.45 - t * 2.2);
        var kk = (wave + 1) / 2;
        var c = mix(ACC, CREAM, k / rings);
        for (var m = 0; m < n; m++) {
          var a = 6.2832 * m / n + k * 0.03 + t * 0.05 * (k % 2 ? 1 : -1);
          var rr = rad + wave * 4;
          dot(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.5 + kk * 1.1, c, 0.18 + kk * 0.7);
        }
      }
    }

    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      if (mode === "structure") drawStructure();
      else if (mode === "constellation") drawConstellation();
      else drawRipples();
    }

    function frame(ts) {
      raf = 0;
      if (!visible) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
      last = ts;
      if (motionOn) t += dt;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      draw();
      if (motionOn) raf = requestAnimationFrame(frame);
    }
    function start() {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        visible = e[0].isIntersecting;
        if (visible) { if (motionOn) start(); else draw(); } else stop();
      }, { threshold: 0.05 }).observe(canvas);
    } else { visible = true; start(); }

    motionListeners.push(function (on) { if (on) start(); else { stop(); draw(); } });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    canvas.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.px = e.clientX - rect.left;
      mouse.py = e.clientY - rect.top;
      mouse.tx = (mouse.px / rect.width - 0.5) * 2;
      mouse.ty = (mouse.py / rect.height - 0.5) * 2;
      if (!motionOn) draw();
    });
    canvas.addEventListener("pointerleave", function () {
      mouse.px = mouse.py = -999; mouse.tx = mouse.ty = 0;
      if (!motionOn) draw();
    });

    /* tabs */
    var data = [
      {
        mode: "structure", cap: "Structure",
        title: "Give logic a shape.",
        text: "State machines, debounced inputs and testbenches on a Xilinx Artix-7, designed in simulation and then run on a real board.",
        label: "Explore the FPGA work", href: "#work-fpga"
      },
      {
        mode: "ripples", cap: "Ripples",
        title: "Make it move.",
        text: "Firmware, servos and wireless control: ESP32 gaits, PCA9685 drivers and ESP-NOW links with only a few milliseconds of latency.",
        label: "Explore the robot", href: "#work-robot"
      },
      {
        mode: "constellation", cap: "Constellation",
        title: "Bring the parts together.",
        text: "Sensors, custom ESP32 PCBs, MQTT and a Raspberry Pi / Jetson brain, wired into one closed loop.",
        label: "Explore the hydroponics system", href: "#work-iot"
      }
    ];
    var tabs = $$(".tab");
    var panel = $("#tabPanel"), tpTitle = $("#tpTitle"), tpText = $("#tpText"),
      tpLink = $("#tpLink"), vizCap = $("#vizCap"), vizCount = $("#vizCount");
    var current = 0, swapTimer;

    function select(idx) {
      if (idx === current && tabs[idx].classList.contains("is-on")) return;
      current = idx;
      tabs.forEach(function (b, k) {
        b.classList.toggle("is-on", k === idx);
        b.setAttribute("aria-selected", String(k === idx));
      });
      var d = data[idx];
      canvas.classList.add("fade");
      panel.classList.add("swap");
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () {
        mode = d.mode;
        vizCap.textContent = d.cap;
        vizCount.textContent = "0" + (idx + 1) + " / 03";
        tpTitle.textContent = d.title;
        tpText.textContent = d.text;
        $("span", tpLink).textContent = d.label;
        tpLink.setAttribute("href", d.href);
        canvas.classList.remove("fade");
        panel.classList.remove("swap");
        if (!raf) draw();
      }, 220);
    }
    tabs.forEach(function (b, k) { b.addEventListener("click", function () { select(k); }); });
  })();

  /* ---------- accordion ---------- */
  $$(".acc-item").forEach(function (item) {
    var btn = $(".acc-head", item);
    btn.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      $$(".acc-item").forEach(function (o) {
        o.classList.remove("is-open");
        $(".acc-head", o).setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- back to top ---------- */
  var toTop = $("#toTop");
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: motionOn ? "smooth" : "auto" });
    });
  }

  /* ---------- init motion state last so listeners are registered ---------- */
  setMotion(motionOn, false);
})();

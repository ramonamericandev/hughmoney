/* HughMoney — site interactions
   - mobile nav
   - compound-growth calculator + SVG line chart (hover, table view)
   - waitlist form (front-end only; see README for wiring a backend)
*/
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const fmtUSD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const fmtShort = (v) => {
    if (v >= 1e6) return "$" + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1) + "M";
    if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
    return "$" + Math.round(v);
  };

  /* ---------- footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- mobile nav ---------- */
  const toggle = $(".nav-toggle");
  const navList = $("#nav-list");
  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      navList.classList.toggle("is-open", !open);
    });
    navList.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        navList.classList.remove("is-open");
      }
    });
  }

  /* ---------- calculator ---------- */
  const RETIRE_AGE = 65;
  const WAIT_YEARS = 10;

  const monthlyIn = $("#c-monthly");
  const ageIn = $("#c-age");
  const rateIn = $("#c-rate");
  const chartEl = $("#chart");
  const tipEl = $("#chart-tip");
  if (!monthlyIn || !ageIn || !rateIn || !chartEl) return;

  /** Balance at each age from startAge to RETIRE_AGE, contributing `monthly` with monthly compounding. */
  function series(monthly, startAge, annualRate, fromAge) {
    const r = annualRate / 100 / 12;
    const out = [];
    let bal = 0;
    for (let age = fromAge; age <= RETIRE_AGE; age++) {
      if (age > startAge) {
        for (let m = 0; m < 12; m++) bal = bal * (1 + r) + monthly;
      }
      out.push({ age, value: bal });
    }
    return out;
  }

  let state = { a: [], b: [], startA: 18, startB: 28, monthly: 25, rate: 7 };

  function recompute() {
    const monthly = Number(monthlyIn.value);
    const startA = Number(ageIn.value);
    const startB = startA + WAIT_YEARS;
    const rate = Number(rateIn.value);

    $("#c-monthly-out").textContent = fmtUSD.format(monthly);
    const weeklyEl = $("#c-weekly");
    if (weeklyEl) {
      const weekly = monthly * 12 / 52;
      weeklyEl.textContent = weekly < 10
        ? "About " + fmtUSD.format(Math.round(weekly)) + " a week"
        : "About " + fmtUSD.format(Math.round(weekly)) + " a week, or " + fmtUSD.format(Math.round(monthly / 30 * 100) / 100) + " a day";
    }
    $("#c-age-out").textContent = String(startA);
    $("#c-rate-out").textContent = rate + "%";

    const a = series(monthly, startA, rate, startA);
    const b = series(monthly, startB, rate, startA);
    const finalA = a[a.length - 1].value;
    const finalB = b[b.length - 1].value;
    const extraContrib = monthly * 12 * WAIT_YEARS;

    $("#s-age-a").textContent = String(startA);
    $("#s-age-b").textContent = String(startB);
    $("#s-val-a").textContent = fmtUSD.format(finalA);
    $("#s-val-b").textContent = fmtUSD.format(finalB);
    $("#s-diff").textContent = fmtUSD.format(finalA - finalB);
    $("#s-extra").textContent = fmtUSD.format(extraContrib);

    const labelA = "Start at " + startA;
    const labelB = "Start at " + startB;
    $("#lg-a").textContent = labelA;
    $("#lg-b").textContent = labelB;
    $("#th-a").textContent = labelA;
    $("#th-b").textContent = labelB;

    state = { a, b, startA, startB, monthly, rate };
    renderChart();
    renderTable();
  }

  /* ---------- table view ---------- */
  function renderTable() {
    const tbody = $("#chart-table-el tbody");
    if (!tbody) return;
    const rows = [];
    state.a.forEach((pt, i) => {
      const isStep = (pt.age - state.startA) % 5 === 0 || pt.age === RETIRE_AGE;
      if (!isStep) return;
      rows.push(
        "<tr><td>" + pt.age + "</td><td>" + fmtUSD.format(pt.value) + "</td><td>" + fmtUSD.format(state.b[i].value) + "</td></tr>"
      );
    });
    tbody.innerHTML = rows.join("");
  }

  /* ---------- chart ---------- */
  const NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, text) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  function niceMax(v) {
    if (v <= 0) return 1000;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const f = v / exp;
    const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * exp;
  }

  let geom = null;

  function renderChart() {
    const W = Math.max(280, chartEl.clientWidth);
    const H = chartEl.clientHeight || 300;
    const padL = 48, padR = 72, padT = 16, padB = 28;
    const iw = W - padL - padR;
    const ih = H - padT - padB;

    const maxVal = niceMax(state.a[state.a.length - 1].value);
    const x = (age) => padL + ((age - state.startA) / (RETIRE_AGE - state.startA)) * iw;
    const y = (v) => padT + ih - (v / maxVal) * ih;

    const svg = el("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Line chart of projected balance by age for both starting ages" });

    // horizontal grid + y labels (4 steps)
    for (let i = 0; i <= 4; i++) {
      const v = (maxVal / 4) * i;
      const yy = y(v);
      svg.appendChild(el("line", { x1: padL, x2: W - padR, y1: yy, y2: yy, class: i === 0 ? "baseline" : "grid-line" }));
      svg.appendChild(el("text", { x: padL - 8, y: yy + 4, "text-anchor": "end", class: "axis-text" }, fmtShort(v)));
    }
    // x labels every 5-ish years
    const span = RETIRE_AGE - state.startA;
    const stepX = span > 30 ? 10 : 5;
    for (let age = state.startA; age <= RETIRE_AGE; age++) {
      if ((age - state.startA) % stepX === 0 || age === RETIRE_AGE) {
        svg.appendChild(el("text", { x: x(age), y: H - 8, "text-anchor": "middle", class: "axis-text" }, String(age)));
      }
    }

    const pathOf = (pts) => pts.map((p, i) => (i ? "L" : "M") + x(p.age).toFixed(1) + " " + y(p.value).toFixed(1)).join(" ");

    // soft area under series A
    const lastA = state.a[state.a.length - 1];
    svg.appendChild(el("path", { d: pathOf(state.a) + " L" + x(lastA.age).toFixed(1) + " " + y(0) + " L" + x(state.startA) + " " + y(0) + " Z", class: "area-a" }));
    svg.appendChild(el("path", { d: pathOf(state.a), class: "line line-a" }));
    svg.appendChild(el("path", { d: pathOf(state.b), class: "line line-b" }));

    // end markers + direct labels (kept apart if too close)
    const lastB = state.b[state.b.length - 1];
    let yA = y(lastA.value), yB = y(lastB.value);
    let lyA = yA, lyB = yB;
    if (Math.abs(lyA - lyB) < 16) { lyA -= 8; lyB += 8; }
    svg.appendChild(el("circle", { cx: x(RETIRE_AGE), cy: yA, r: 4.5, class: "end-dot end-dot-a" }));
    svg.appendChild(el("circle", { cx: x(RETIRE_AGE), cy: yB, r: 4.5, class: "end-dot end-dot-b" }));
    svg.appendChild(el("text", { x: x(RETIRE_AGE) + 10, y: lyA + 4, class: "end-label" }, fmtShort(lastA.value)));
    svg.appendChild(el("text", { x: x(RETIRE_AGE) + 10, y: lyB + 4, class: "end-label" }, fmtShort(lastB.value)));

    // hover layer
    const cross = el("line", { x1: 0, x2: 0, y1: padT, y2: padT + ih, class: "crosshair", visibility: "hidden" });
    const dotA = el("circle", { r: 5, class: "hover-dot", fill: "var(--series-a)", visibility: "hidden" });
    const dotB = el("circle", { r: 5, class: "hover-dot", fill: "var(--series-b)", visibility: "hidden" });
    const hit = el("rect", { x: padL, y: padT, width: iw, height: ih, class: "hit" });
    svg.appendChild(cross); svg.appendChild(dotA); svg.appendChild(dotB); svg.appendChild(hit);

    chartEl.innerHTML = "";
    chartEl.appendChild(svg);
    geom = { W, H, padL, iw, x, y, cross, dotA, dotB };

    hit.addEventListener("pointermove", onHover);
    hit.addEventListener("pointerleave", hideTip);
  }

  function onHover(e) {
    if (!geom) return;
    const rect = chartEl.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * geom.W;
    const span = RETIRE_AGE - state.startA;
    let idx = Math.round(((px - geom.padL) / geom.iw) * span);
    idx = Math.max(0, Math.min(span, idx));
    const pa = state.a[idx], pb = state.b[idx];

    const cx = geom.x(pa.age);
    geom.cross.setAttribute("x1", cx); geom.cross.setAttribute("x2", cx);
    geom.cross.setAttribute("visibility", "visible");
    geom.dotA.setAttribute("cx", cx); geom.dotA.setAttribute("cy", geom.y(pa.value)); geom.dotA.setAttribute("visibility", "visible");
    geom.dotB.setAttribute("cx", cx); geom.dotB.setAttribute("cy", geom.y(pb.value)); geom.dotB.setAttribute("visibility", pb.value > 0 ? "visible" : "hidden");

    tipEl.innerHTML =
      "<strong>Age " + pa.age + "</strong>" +
      '<div class="tip-row"><span><span class="swatch swatch-a"></span> Start at ' + state.startA + "</span><span>" + fmtUSD.format(pa.value) + "</span></div>" +
      '<div class="tip-row"><span><span class="swatch swatch-b"></span> Start at ' + state.startB + "</span><span>" + (pb.value > 0 ? fmtUSD.format(pb.value) : "—") + "</span></div>";
    tipEl.hidden = false;
    const scale = rect.width / geom.W;
    const left = Math.max(80, Math.min(rect.width - 80, cx * scale));
    tipEl.style.left = left + "px";
    tipEl.style.top = Math.max(0, geom.y(pa.value) * scale - 12) + "px";
  }

  function hideTip() {
    if (!geom) return;
    tipEl.hidden = true;
    geom.cross.setAttribute("visibility", "hidden");
    geom.dotA.setAttribute("visibility", "hidden");
    geom.dotB.setAttribute("visibility", "hidden");
  }

  [monthlyIn, ageIn, rateIn].forEach((inp) => inp.addEventListener("input", recompute));
  if ("ResizeObserver" in window) {
    let raf = 0;
    new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(renderChart); }).observe(chartEl);
  } else {
    window.addEventListener("resize", renderChart);
  }
  recompute();

  /* ---------- waitlist form ---------- */
  const form = $("#waitlist-form");
  const msg = $("#form-msg");
  if (form && msg) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = $("#wl-email");
      const email = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        input.setAttribute("aria-invalid", "true");
        msg.className = "form-msg is-err";
        msg.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
      const btn = form.querySelector("button");
      btn.disabled = true;

      // WAITLIST_ENDPOINT: set data-endpoint on the form to POST {email} as JSON.
      const endpoint = form.dataset.endpoint;
      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, source: "site" })
          });
          if (!res.ok) throw new Error("bad status " + res.status);
        } else {
          // No backend configured yet: keep a local copy so nothing is lost during testing.
          try {
            const list = JSON.parse(localStorage.getItem("hm_waitlist") || "[]");
            list.push({ email, at: new Date().toISOString() });
            localStorage.setItem("hm_waitlist", JSON.stringify(list));
          } catch (_) { /* storage unavailable */ }
        }
        msg.className = "form-msg is-ok";
        msg.textContent = "You're on the list. We'll email you when HughMoney opens near you.";
        form.reset();
      } catch (err) {
        msg.className = "form-msg is-err";
        msg.textContent = "Something went wrong. Please try again in a moment.";
      } finally {
        btn.disabled = false;
      }
    });
  }
})();

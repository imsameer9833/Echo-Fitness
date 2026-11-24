/* =========================================================
   ECHO — ui.js
   Shared building blocks: icons, charts (pure SVG), toast,
   pop-up dialogs and small formatting helpers.
   ========================================================= */

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11"/>',
  meal: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M16.5 21V3c-2.2 1.2-3.5 4-3.5 7.5h3.5"/>',
  echo: '<path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4"/>',
  tasks: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12.2 2.8 2.8L16 9.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  send: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  arrowUp: '<path d="M7 17 17 7M9 7h8v8"/>',
  arrowDown: '<path d="M7 7l10 10M17 9v8H9"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  flame: '<path d="M12 21c-4 0-7-2.7-7-6.5 0-3.5 3-5.5 4-9 2 1.5 3 3.5 3 5.5 1-.5 2-1.5 2.5-3 2 2 3.5 4 3.5 6.5 0 3.8-2.9 6.5-6 6.5z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  volume: '<path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  repeat: '<path d="M4 12a7 7 0 0 1 12-5l3 3M20 12a7 7 0 0 1-12 5l-3-3M19 5v5h-5M5 19v-5h5"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>'
};

const UI = {
  icon(name, size, stroke) {
    return `<svg width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke || 2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  },

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  },
  num(n) { return Math.round(Number(n) || 0).toLocaleString('en-IN'); },
  kg(n) { const v = Math.round((Number(n) || 0) * 10) / 10; return v.toLocaleString('en-IN'); },
  mins(m) {
    m = Math.round(m || 0);
    if (m < 60) return m + 'm';
    return Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + (m % 60) + 'm' : '');
  },
  scoreColor(score) { return score >= 75 ? 'lime' : score >= 50 ? 'amber' : 'coral'; },

  /* ---------- Charts (pure SVG, drawn from data) ---------- */
  ring(pct, size, stroke, color, track) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(1, pct || 0));
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track || 'var(--line)'}" stroke-width="${stroke}"/>
      <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color || 'var(--lime)'}" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" style="--c:${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>`;
  },

  /* Charts are drawn at their real on-screen width so text stays 12px */
  contentWidth() {
    const w = window.innerWidth;
    if (w <= 900) return w - 32;
    return Math.min(1120, w - 248) - (w <= 1180 ? 56 : 80);
  },
  chartWidth(kind) {
    const w = window.innerWidth, cw = UI.contentWidth(), pad = w <= 560 ? 34 : 42;
    if (w <= 900 || kind === 'full') return Math.round(cw - pad);
    const col = (cw - 20) / 2.6;
    return Math.round((kind === 'side' ? col : col * 1.6) - pad);
  },

  lineChart(values, labels, opts) {
    opts = opts || {};
    const W = Math.max(280, opts.width || 640), H = opts.height || 220, padL = 46, padR = 16, padT = 16, padB = 30;
    const max = Math.max(...values, 1);
    const niceMax = UI.niceCeil(max * 1.1);
    const min = 0;
    const x = i => padL + (values.length === 1 ? 0 : i * (W - padL - padR) / (values.length - 1));
    const y = v => padT + (H - padT - padB) * (1 - (v - min) / (niceMax - min));
    const pts = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    const grid = [0, 0.5, 1].map(f => {
      const v = niceMax * f, yy = y(v).toFixed(1);
      return `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="var(--line)"/>
              <text x="${padL - 10}" y="${(+yy + 4)}" text-anchor="end" class="axis">${opts.fmt ? opts.fmt(v) : UI.short(v)}</text>`;
    }).join('');
    const area = `M${pts[0]} L${pts.slice(1).join(' L')} L${x(values.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
    const dots = values.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${i === values.length - 1 ? 6 : 4}" class="${i === values.length - 1 ? 'dot-last' : 'dot'}"><title>${labels[i]}: ${UI.num(v)} kg</title></circle>`).join('');
    const xl = labels.map((l, i) => `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="axis${i === labels.length - 1 ? ' axis-hi' : ''}">${l}</text>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${UI.esc(opts.label || 'Chart')}" preserveAspectRatio="xMidYMid meet">
      ${grid}
      <path d="${area}" class="area"/>
      <path d="M${pts.join(' L')}" class="line" pathLength="1"/>
      ${dots}${xl}
    </svg>`;
  },

  barChart(values, labels, colors, opts) {
    opts = opts || {};
    const W = Math.max(280, opts.width || 640), H = opts.height || 220, padL = 40, padR = 8, padT = 12, padB = 30;
    const max = opts.max || Math.max(...values.map(v => v || 0), 1);
    const n = values.length;
    const slot = (W - padL - padR) / n;
    const bw = Math.min(28, slot * 0.6);
    const y = v => padT + (H - padT - padB) * (1 - v / max);
    const grid = (opts.ticks || [0, max / 2, max]).map(v => {
      const yy = y(v).toFixed(1);
      const hi = opts.goal === v;
      return `<line x1="${padL}" y1="${yy}" x2="${W - padR}" y2="${yy}" stroke="${hi ? 'var(--lime)' : 'var(--line)'}" ${hi ? 'stroke-dasharray="4 5" opacity=".6"' : ''}/>
        <text x="${padL - 8}" y="${+yy + 4}" text-anchor="end" class="axis${hi ? ' axis-hi' : ''}">${Math.round(v)}</text>`;
    }).join('');
    const bars = values.map((v, i) => {
      const bx = padL + i * slot + (slot - bw) / 2;
      if (v == null) return `<rect x="${bx.toFixed(1)}" y="${y(0) - 3}" width="${bw.toFixed(1)}" height="3" rx="1.5" fill="var(--line)"/>`;
      const by = y(v);
      return `<rect class="bar" style="animation-delay:${i * 30}ms" x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${(y(0) - by).toFixed(1)}" rx="5" fill="var(--${colors[i]})"><title>${labels[i] || ''}: ${v}</title></rect>`;
    }).join('');
    const xl = labels.map((l, i) => l ? `<text x="${(padL + i * slot + slot / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="axis${i === n - 1 ? ' axis-hi' : ''}">${l}</text>` : '').join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${UI.esc(opts.label || 'Bar chart')}" preserveAspectRatio="xMidYMid meet">${grid}${bars}${xl}</svg>`;
  },
  niceCeil(v) {
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    return steps.find(x => n <= x) * p;
  },
  short(v) { return v >= 1000 ? (Math.round(v / 100) / 10).toString().replace(/\.0$/, '') + 'k' : String(Math.round(v)); },

  /* ---------- Toast ---------- */
  toast(msg, kind) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast-' + kind : '');
    el.setAttribute('role', 'status');
    el.innerHTML = `${UI.icon(kind === 'warn' ? 'x' : 'check', 18, 2.6)}<span>${UI.esc(msg)}</span>`;
    root.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600);
    setTimeout(() => el.remove(), 3000);
  },

  /* ---------- Pop-up dialog (returns a Promise) ----------
     fields: [{name, label, value, type, placeholder, options}] */
  dialog({ title, text, fields, ok, cancel, danger }) {
    return new Promise(resolve => {
      const root = document.getElementById('modal-root');
      const fieldHtml = (fields || []).map((f, i) => {
        const id = 'dlg-' + f.name;
        if (f.type === 'textarea') return `<label class="field" for="${id}"><span>${UI.esc(f.label)}</span><textarea id="${id}" name="${f.name}" rows="${f.rows || 3}" placeholder="${UI.esc(f.placeholder || '')}">${UI.esc(f.value || '')}</textarea></label>`;
        return `<label class="field" for="${id}"><span>${UI.esc(f.label)}</span><input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${UI.esc(f.value == null ? '' : f.value)}" placeholder="${UI.esc(f.placeholder || '')}" ${f.min != null ? 'min="' + f.min + '"' : ''} ${f.max != null ? 'max="' + f.max + '"' : ''}></label>`;
      }).join('');
      root.innerHTML = `<div class="modal-backdrop" data-close="1">
        <form class="modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
          <h2 id="dlg-title">${UI.esc(title)}</h2>
          ${text ? `<p class="muted">${text}</p>` : ''}
          ${fieldHtml}
          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" data-cancel="1">${UI.esc(cancel || 'Cancel')}</button>
            <button type="submit" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${UI.esc(ok || 'Save')}</button>
          </div>
        </form></div>`;
      const form = root.querySelector('form');
      const close = val => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); resolve(val); };
      const onKey = e => { if (e.key === 'Escape') close(null); };
      document.addEventListener('keydown', onKey);
      root.querySelector('[data-cancel]').onclick = () => close(null);
      root.querySelector('.modal-backdrop').onclick = e => { if (e.target.dataset.close) close(null); };
      form.onsubmit = e => {
        e.preventDefault();
        const out = {};
        (fields || []).forEach(f => { out[f.name] = form.elements[f.name].value; });
        close(fields && fields.length ? out : true);
      };
      const first = form.querySelector('input, textarea');
      setTimeout(() => (first || form.querySelector('[type=submit]')).focus(), 30);
    });
  },

  /* Small "ding" when a focus session ends (Web Audio API, no files needed) */
  ding() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [880, 1320].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.5);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 0.55);
      });
    } catch (e) { /* sound is optional */ }
  }
};

/* ---------- Speech (voice input + spoken replies) ---------- */
const Voice = {
  rec: null,
  supported() { return !!(window.SpeechRecognition || window.webkitSpeechRecognition); },
  listen(onText, onEnd) {
    if (!Voice.supported()) { UI.toast('Voice input works in Google Chrome or Edge', 'warn'); onEnd && onEnd(); return; }
    Voice.stop();
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new R();
    rec.lang = 'en-IN';
    rec.interimResults = true;
    rec.onresult = e => {
      let txt = '';
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      onText(txt, e.results[e.results.length - 1].isFinal);
    };
    rec.onerror = e => { if (e.error === 'not-allowed') UI.toast('Allow microphone access to use voice', 'warn'); };
    rec.onend = () => { Voice.rec = null; onEnd && onEnd(); };
    Voice.rec = rec;
    try { rec.start(); } catch (e) { onEnd && onEnd(); }
  },
  stop() { if (Voice.rec) { try { Voice.rec.stop(); } catch (e) { } Voice.rec = null; } },
  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 1.02;
    window.speechSynthesis.speak(u);
  }
};

/* Registries every screen plugs into (see app.js) */
const Views = {};    // screens: Views.home.render()
const Actions = {};  // click / submit handlers: data-action="name"
const Inputs = {};   // typing handlers: data-input="name"
const Changes = {};  // select / change handlers: data-change="name"

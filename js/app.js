/* =========================================================
   ECHO — app.js
   The "engine": page router, layout (sidebar on laptop,
   bottom bar on phone) and one click handler for the app.
   Each screen lives in js/views/*.js and registers itself
   in Views; buttons call functions in Actions.
   ========================================================= */

const NAV = [
  { route: 'home', label: 'Home', icon: 'home' },
  { route: 'fitness', label: 'Fitness', icon: 'dumbbell' },
  { route: 'meal', label: 'Meal', icon: 'meal' },
  { route: 'echo', label: 'ECHO AI', short: 'ECHO', icon: 'echo' },
  { route: 'tasks', label: 'Tasks', icon: 'tasks' }
];

const App = {
  ui: {},            // temporary screen state (open tabs, filters, drafts)
  lastRoute: null,

  init() {
    Store.load();
    document.addEventListener('click', App.onClick);
    document.addEventListener('input', e => App.dispatch(e, 'data-input', Inputs));
    document.addEventListener('change', e => App.dispatch(e, 'data-change', Changes));
    document.addEventListener('submit', e => {
      const form = e.target.closest('form[data-submit]');
      if (!form) return;
      e.preventDefault();
      const fn = Actions[form.dataset.submit];
      if (fn) fn(form, e);
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && e.target.matches('[data-enter]')) {
        e.preventDefault();
        const fn = Actions[e.target.dataset.enter];
        if (fn) fn(e.target, e);
      }
    });
    window.addEventListener('hashchange', () => App.render());
    // Redraw charts when the window size changes (laptop <-> phone)
    let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (Store.state.user && !document.querySelector('.modal')) App.refresh(); }, 250); });
    App.render();
    setInterval(App.tick, 500);
  },

  onClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = Actions[el.dataset.action];
    if (fn) { e.preventDefault(); fn(el, e); }
  },
  dispatch(e, attr, table) {
    const el = e.target.closest('[' + attr + ']');
    if (!el) return;
    const fn = table[el.getAttribute(attr)];
    if (fn) fn(el, e);
  },

  parse() {
    // Pages are named like #fitness or #fitness-progress
    const parts = location.hash.replace(/^#\/?/, '').split(/[-/]/);
    return { route: parts[0] || 'home', sub: parts[1] || null };
  },
  go(hash) {
    if (location.hash === hash) App.render(); else location.hash = hash;
  },

  render() {
    let { route, sub } = App.parse();
    const root = document.getElementById('root');
    const s = Store.state;

    // Not logged in: only the welcome and setup screens
    if (!s.user) {
      if (route !== 'setup') route = 'welcome';
      root.innerHTML = Views[route].render(sub);
      document.title = 'ECHO — Your Personal Life Operating System';
      App.lastRoute = route;
      window.scrollTo(0, 0);
      return;
    }
    if (route === 'welcome' || route === 'setup' || !Views[route]) route = 'home';

    const view = Views[route];
    const changed = App.lastRoute !== route + '/' + sub;
    if (changed && route !== 'profile') App.ui.pf = null;
    const y = window.scrollY;
    root.innerHTML = App.shell(route, view.render(sub), changed);
    if (view.after) view.after(sub);
    if (changed) window.scrollTo(0, 0); else window.scrollTo(0, y);
    App.lastRoute = route + '/' + sub;
    App.updateTimerChip();
  },
  refresh() { App.lastRoute = App.parse().route + '/' + App.parse().sub; App.render(); },

  shell(route, content, animate) {
    const u = Store.state.user;
    const t = Calc.targets(u);
    const items = NAV.map(n => `
      <a href="#${n.route}" class="nav-item${route === n.route ? ' active' : ''}" ${route === n.route ? 'aria-current="page"' : ''}>
        ${UI.icon(n.icon, 22, 1.8)}<span class="nav-long">${n.label}</span><span class="nav-short">${n.short || n.label}</span>
      </a>`).join('');
    const goal = { lose: 'Lose fat', maintain: 'Maintain', build: 'Build muscle' }[u.goal];
    return `
    <div class="shell">
      <aside class="sidebar">
        <a href="#home" class="brand"><span class="logo">${UI.icon('echo', 22, 2.4)}</span><span class="wordmark">ECHO</span></a>
        <nav class="side-nav" aria-label="Main">${items}</nav>
        <div class="side-foot">
          <a href="#tasks-focus" class="timer-chip" id="timer-chip" hidden>${UI.icon('clock', 16)}<span id="timer-chip-text">25:00</span></a>
          <a href="#profile" class="me${route === 'profile' ? ' active' : ''}">
            <span class="avatar">${UI.esc(u.name.charAt(0).toUpperCase())}</span>
            <span class="me-text"><b>${UI.esc(u.name)}</b><small>${goal} · ${UI.num(t.kcal)} kcal</small></span>
          </a>
        </div>
      </aside>
      <main class="main" id="main"><div class="view${animate ? ' animate' : ''}">${content}</div></main>
      <nav class="bottom-nav" aria-label="Main">${items}</nav>
    </div>`;
  },

  /* Page header used by every screen */
  header(title, right) {
    return `<header class="page-head">
      <div><p class="eyebrow">${Dates.long()}</p><h1>${title}</h1></div>
      <div class="page-head-right">${right || ''}</div>
    </header>`;
  },
  tabs(items) {
    return `<div class="seg seg-tabs" role="tablist">${items.map(i => `<a href="${i.href}" role="tab" aria-selected="${i.active}" class="seg-item${i.active ? ' on' : ''}">${i.label}</a>`).join('')}</div>`;
  },

  /* Runs twice a second: keeps the focus timer moving on every page */
  tick() {
    const t = Store.state.timer;
    if (!t || t.state !== 'running') { App.updateTimerChip(); return; }
    const left = Math.max(0, Math.round((t.endAt - Date.now()) / 1000));
    if (left <= 0) { Views.tasks.completeTimer(); return; }
    if (Views.tasks.updateTimer) Views.tasks.updateTimer(left);
    App.updateTimerChip(left);
  },
  updateTimerChip(left) {
    const chip = document.getElementById('timer-chip');
    const t = Store.state.timer;
    if (!chip) return;
    if (!t || t.state === 'idle') { chip.hidden = true; document.title = 'ECHO — Your Personal Life Operating System'; return; }
    if (left == null) left = t.state === 'running' ? Math.max(0, Math.round((t.endAt - Date.now()) / 1000)) : t.left;
    const txt = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
    chip.hidden = false;
    chip.classList.toggle('paused', t.state === 'paused');
    document.getElementById('timer-chip-text').textContent = (t.state === 'paused' ? 'Paused ' : 'Focus ') + txt;
    document.title = (t.state === 'paused' ? '⏸ ' : '⏱ ') + txt + ' · ECHO';
  }
};

document.addEventListener('DOMContentLoaded', App.init);

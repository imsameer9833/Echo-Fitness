/* =========================================================
   ECHO — views/tasks.js
   To-do: add today's tasks, tick ✓ done or ✗ skipped.
   Focus timer: 25 / 45 / custom minutes, counts focused
   time and lets you add a note about what you got done.
   ========================================================= */

const TAGS = ['Study', 'Fitness', 'Meal', 'Work', 'Personal'];

Views.tasks = {
  render(sub) {
    const tabs = App.tabs([
      { href: '#tasks', label: 'To-do', active: sub !== 'focus' },
      { href: '#tasks-focus', label: 'Focus timer', active: sub === 'focus' }
    ]);
    return App.header('Tasks', '') + tabs + (sub === 'focus' ? Views.tasks.focus() : Views.tasks.todo());
  },

  /* ================= TO-DO ================= */
  todo() {
    const list = Store.todayTasks();
    const done = list.filter(t => t.status === 'done').length;
    const skipped = list.filter(t => t.status === 'skipped').length;
    const open = list.filter(t => t.status === 'open');
    const groups = [['open', 'To do'], ['done', 'Done'], ['skipped', 'Skipped']];
    return `<div class="grid-main">
      <div class="stack">
        <form class="add-task card" data-submit="addTask">
          <label for="task-title" class="sr">New task</label>
          <input id="task-title" name="title" placeholder="What do you want to do today?" maxlength="80" autocomplete="off">
          <label for="task-tag" class="sr">Category</label>
          <select id="task-tag" name="tag">${TAGS.map(t => `<option${t === (App.ui.lastTag || 'Study') ? ' selected' : ''}>${t}</option>`).join('')}</select>
          <button class="btn btn-primary" type="submit">${UI.icon('plus', 18, 2.4)}Add</button>
        </form>
        ${groups.map(([st, label]) => {
      const items = list.filter(t => t.status === st);
      if (!items.length && st !== 'open') return '';
      return `<section class="task-group">
            <h2 class="section-title">${label} <span class="muted">${items.length}</span></h2>
            ${items.length ? `<ul class="task-list">${items.map(Views.tasks.row).join('')}</ul>` : '<div class="card empty small">Nothing left. Add a task above.</div>'}
          </section>`;
    }).join('')}
        <p class="muted small center">Tap ✓ when it's done, ✗ if you skipped it. Workout and meal tasks tick themselves.</p>
      </div>
      <aside class="stack">
        <section class="card progress-card">
          <div class="ring-wrap sm">${UI.ring(list.length ? done / list.length : 0, 96, 10)}<div class="ring-text"><b>${list.length ? Math.round(done / list.length * 100) : 0}%</b></div></div>
          <div><p class="big-line">${done} of ${list.length} done</p><p class="muted small">${open.length} to go · ${skipped} skipped</p></div>
        </section>
        <a href="#tasks-focus" class="card focus-mini">
          <span class="sec-icon">${UI.icon('clock', 20)}</span>
          <span><b>${UI.mins(Store.todayFocusMinutes())}</b> focused today<small class="muted">Start a focus session</small></span>
          ${UI.icon('chevronRight', 18)}
        </a>
      </aside>
    </div>`;
  },

  row(t) {
    const auto = t.auto ? (t.auto === 'workout' ? 'Ticks when you finish a workout' : 'Ticks when you save this meal') : '';
    return `<li class="task-row is-${t.status}">
      <div class="task-text"><b>${UI.esc(t.title)}</b><small><span class="tag">${UI.esc(t.tag)}</span>${auto ? ' · ' + auto : ''}</small></div>
      <button class="tick tick-done${t.status === 'done' ? ' on' : ''}" data-action="taskSet" data-id="${t.id}" data-status="done" aria-pressed="${t.status === 'done'}" aria-label="Mark ${UI.esc(t.title)} done">${UI.icon('check', 18, 2.8)}</button>
      <button class="tick tick-skip${t.status === 'skipped' ? ' on' : ''}" data-action="taskSet" data-id="${t.id}" data-status="skipped" aria-pressed="${t.status === 'skipped'}" aria-label="Mark ${UI.esc(t.title)} skipped">${UI.icon('x', 18, 2.8)}</button>
      <button class="icon-btn icon-btn-sm" data-action="taskDelete" data-id="${t.id}" aria-label="Delete ${UI.esc(t.title)}">${UI.icon('trash', 15)}</button>
    </li>`;
  },

  /* ================= FOCUS TIMER ================= */
  focus() {
    const s = Store.state, tm = s.timer;
    const mins = App.ui.focusMins || 25;
    const total = tm ? tm.total : mins * 60;
    const left = !tm ? total : tm.state === 'running' ? Math.max(0, Math.round((tm.endAt - Date.now()) / 1000)) : tm.left;
    const sessions = s.focus.filter(f => f.date === Dates.today()).slice().reverse();
    const todayMin = Store.todayFocusMinutes();
    const presets = [25, 45];
    const isPreset = presets.includes(mins);
    const days = []; for (let i = 6; i >= 0; i--) { const k = Dates.add(Dates.today(), -i); days.push({ k, m: s.focus.filter(f => f.date === k).reduce((a, f) => a + f.minutes, 0) }); }

    const controls = !tm
      ? `<button class="btn btn-primary btn-lg grow" data-action="timerStart">${UI.icon('play', 18, 2.4)}Start focus</button>`
      : `<button class="btn btn-ghost btn-lg" data-action="timerReset">${UI.icon('reset', 18)}Reset</button>
         ${tm.state === 'running' ? `<button class="btn btn-primary btn-lg grow" data-action="timerPause">${UI.icon('pause', 18, 2.6)}Pause</button>` : `<button class="btn btn-primary btn-lg grow" data-action="timerResume">${UI.icon('play', 18, 2.4)}Resume</button>`}
         <button class="btn btn-ghost btn-lg" data-action="timerFinish">${UI.icon('check', 18, 2.6)}Finish</button>`;

    return `<div class="grid-main">
      <section class="card timer-card${tm && tm.state === 'running' ? ' running' : ''}">
        <div class="timer-ring" id="timer-ring">
          ${UI.ring(left / total, 260, 14)}
          <div class="ring-text"><b id="timer-text">${Views.tasks.fmt(left)}</b><small>${tm ? (tm.state === 'paused' ? 'Paused' : 'Stay with it') : 'of ' + mins + ' min'}</small></div>
        </div>
        <div class="seg seg-3" role="group" aria-label="Timer length">
          ${presets.map(p => `<button class="seg-item${mins === p ? ' on' : ''}" data-action="timerPreset" data-min="${p}" ${tm ? 'disabled' : ''}>${p} min</button>`).join('')}
          <button class="seg-item${!isPreset ? ' on' : ''}" data-action="timerCustom" ${tm ? 'disabled' : ''}>${isPreset ? 'Custom' : mins + ' min'}</button>
        </div>
        <label class="field full"><span>What are you working on?</span>
          <input id="focus-title" value="${UI.esc(tm ? tm.title : (App.ui.focusTitle || ''))}" placeholder="e.g. Revise DBMS notes, unit 3" data-input="focusTitle" maxlength="60" ${tm ? 'disabled' : ''}></label>
        <div class="btn-row full">${controls}</div>
      </section>
      <div class="stack">
        <section class="card">
          <div class="card-head"><h2 class="card-title">Focused today</h2><b class="c-lime big-num">${UI.mins(todayMin)}</b></div>
          ${sessions.length ? `<ul class="session-list">${sessions.map(f => `
            <li>
              <div class="session-text">
                <div class="session-top"><b>${UI.esc(f.title)}</b><span class="muted small">${f.minutes} min · ${UI.esc(f.time)}</span></div>
                ${f.note ? `<p class="note">“${UI.esc(f.note)}”</p>` : '<p class="muted small">No note yet</p>'}
              </div>
              <button class="icon-btn icon-btn-sm" data-action="sessionNote" data-id="${f.id}" aria-label="Edit note for ${UI.esc(f.title)}">${UI.icon('pencil', 15)}</button>
              <button class="icon-btn icon-btn-sm" data-action="sessionDelete" data-id="${f.id}" aria-label="Delete session ${UI.esc(f.title)}">${UI.icon('trash', 15)}</button>
            </li>`).join('')}</ul>` : '<div class="empty small">No sessions yet today. Start your first one.</div>'}
        </section>
        <section class="card">
          <div class="card-head"><h2 class="card-title">Last 7 days</h2><span class="muted small">${UI.mins(days.reduce((a, d) => a + d.m, 0))} total</span></div>
          ${UI.barChart(days.map(d => d.m), days.map((d, i) => i === 6 ? 'Today' : Dates.weekday(d.k).slice(0, 2)), days.map(() => 'lime'), { width: UI.chartWidth('side'), height: 170, max: Math.max(60, ...days.map(d => d.m)), label: 'Focus minutes per day' })}
        </section>
      </div>
    </div>`;
  },

  fmt(sec) { return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0'); },

  /* Called twice a second by App.tick while the timer runs */
  updateTimer(left) {
    const txt = document.getElementById('timer-text');
    if (!txt) return;
    txt.textContent = Views.tasks.fmt(left);
    const fill = document.querySelector('#timer-ring .ring-fill');
    const tm = Store.state.timer;
    if (fill && tm) { const c = parseFloat(fill.style.getPropertyValue('--c')); fill.setAttribute('stroke-dashoffset', (c * (1 - left / tm.total)).toFixed(1)); }
  },

  async completeTimer(minutesOverride) {
    const s = Store.state, tm = s.timer;
    if (!tm) return;
    const minutes = minutesOverride || Math.round(tm.total / 60);
    const title = tm.title || 'Focus session';
    s.timer = null;
    Store.save();
    UI.ding();
    App.render();
    const r = await UI.dialog({ title: 'Session complete!', text: `${minutes} minutes on <b>${UI.esc(title)}</b>. What did you get done?`, fields: [{ name: 'note', label: 'Note (optional)', type: 'textarea', rows: 3, placeholder: 'e.g. Finished unit 3 and made short notes' }], ok: 'Save session', cancel: 'Skip note' });
    s.focus.push({ id: uid(), date: Dates.today(), time: Dates.time(new Date()).toLowerCase(), minutes, title, note: r ? r.note.trim() : '' });
    Store.save();
    UI.toast(`${minutes} min added to today's focus`);
    App.render();
  }
};

/* ---------------- to-do actions ---------------- */
Actions.addTask = form => {
  const title = form.elements.title.value.trim();
  if (!title) { UI.toast('Type a task first', 'warn'); form.elements.title.focus(); return; }
  App.ui.lastTag = form.elements.tag.value;
  Store.state.tasks.push({ id: uid(), date: Dates.today(), title, tag: form.elements.tag.value, status: 'open', auto: null, created: Date.now() });
  Store.save(); App.refresh();
  const input = document.getElementById('task-title'); if (input) input.focus();
};
Actions.taskSet = el => {
  const t = Store.state.tasks.find(x => x.id === el.dataset.id);
  if (!t) return;
  t.status = t.status === el.dataset.status ? 'open' : el.dataset.status;
  Store.save();
  if (t.status === 'done') UI.toast('Nice! "' + t.title + '" done');
  App.refresh();
};
Actions.taskDelete = el => {
  Store.state.tasks = Store.state.tasks.filter(x => x.id !== el.dataset.id);
  Store.save(); App.refresh();
};

/* ---------------- timer actions ---------------- */
Inputs.focusTitle = el => { App.ui.focusTitle = el.value; };
Actions.timerPreset = el => { App.ui.focusMins = Number(el.dataset.min); App.refresh(); };
Actions.timerCustom = async () => {
  const r = await UI.dialog({ title: 'Custom timer', fields: [{ name: 'm', label: 'Minutes (1–180)', type: 'number', value: App.ui.focusMins || 30, min: 1, max: 180 }], ok: 'Set' });
  if (!r) return;
  const m = Math.round(Number(r.m));
  if (!(m >= 1 && m <= 180)) { UI.toast('Pick between 1 and 180 minutes', 'warn'); return; }
  App.ui.focusMins = m; App.refresh();
};
Actions.timerStart = () => {
  const total = (App.ui.focusMins || 25) * 60;
  const title = (App.ui.focusTitle || '').trim() || 'Focus session';
  Store.state.timer = { state: 'running', total, endAt: Date.now() + total * 1000, left: total, title };
  Store.save(); App.refresh();
};
Actions.timerPause = () => {
  const tm = Store.state.timer;
  tm.left = Math.max(0, Math.round((tm.endAt - Date.now()) / 1000));
  tm.state = 'paused'; Store.save(); App.refresh();
};
Actions.timerResume = () => {
  const tm = Store.state.timer;
  tm.endAt = Date.now() + tm.left * 1000; tm.state = 'running'; Store.save(); App.refresh();
};
Actions.timerReset = () => { Store.state.timer = null; Store.save(); App.refresh(); };
Actions.timerFinish = () => {
  const tm = Store.state.timer;
  const left = tm.state === 'running' ? Math.max(0, Math.round((tm.endAt - Date.now()) / 1000)) : tm.left;
  const minutes = Math.round((tm.total - left) / 60);
  if (minutes < 1) { Store.state.timer = null; Store.save(); UI.toast('Less than a minute, so it wasn\'t saved', 'warn'); App.refresh(); return; }
  Views.tasks.completeTimer(minutes);
};
Actions.sessionNote = async el => {
  const f = Store.state.focus.find(x => x.id === el.dataset.id);
  const r = await UI.dialog({ title: 'Session note', text: UI.esc(f.title) + ' · ' + f.minutes + ' min', fields: [{ name: 'note', label: 'What did you get done?', type: 'textarea', value: f.note }] });
  if (!r) return;
  f.note = r.note.trim(); Store.save(); App.refresh();
};
Actions.sessionDelete = el => {
  Store.state.focus = Store.state.focus.filter(x => x.id !== el.dataset.id);
  Store.save(); App.refresh();
};

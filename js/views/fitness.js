/* =========================================================
   ECHO — views/fitness.js
   Today: pick your split (or rest day), add suggested
   exercises, log sets (kg x reps), finish to save.
   Progress: intensity graph, best lifts, history + edit.
   ========================================================= */

Views.fitness = {
  render(sub) {
    const tabs = App.tabs([
      { href: '#fitness', label: 'Today', active: sub !== 'progress' },
      { href: '#fitness-progress', label: 'Progress', active: sub === 'progress' }
    ]);
    return App.header('Fitness', '') + tabs + (sub === 'progress' ? Views.fitness.progress() : Views.fitness.today());
  },

  /* ================= TODAY ================= */
  today() {
    const s = Store.state, d = s.draft;
    const saved = Store.todayWorkout();
    const editing = d && d.editingId;
    if (saved && !editing) return saved.rest ? Views.fitness.restView() : Views.fitness.summary(saved);

    const banner = editing ? `<div class="banner">${UI.icon('pencil', 18)}<span>Editing <b>${Dates.label(d.date)}</b> workout</span><button class="btn btn-text" data-action="cancelEdit">Cancel</button></div>` : '';
    return banner + Views.fitness.splitPicker(d, editing) + (d && d.split ? Views.fitness.logger(d) : Views.fitness.emptyPick());
  },

  splitPicker(d, editing) {
    const u = Store.state.user, next = Store.suggestedSplit();
    const chips = (u.split || []).map(name => {
      const on = d && d.split === name;
      return `<button class="chip${on ? ' on' : ''}" aria-pressed="${on}" data-action="pickSplit" data-name="${UI.esc(name)}">${UI.esc(name)}${!on && name === next && !editing ? '<span class="chip-dot" title="Up next"></span>' : ''}</button>`;
    }).join('');
    return `<section class="block">
      <div class="block-head"><h2 class="card-title">What are you training today?</h2>
        <button class="btn btn-soft btn-sm" data-action="editSplit">${UI.icon('pencil', 15)}Edit split</button></div>
      <div class="chip-wrap">
        ${chips}
        ${editing ? '' : `<button class="chip" data-action="restDay">${UI.icon('moon', 15)}Rest day</button>`}
        <button class="chip chip-dashed" data-action="customSplit">+ Custom</button>
      </div>
    </section>`;
  },

  emptyPick() {
    const next = Store.suggestedSplit();
    return `<div class="card empty-card">
      <span class="empty-icon">${UI.icon('dumbbell', 28)}</span>
      <h3>Pick what you're training</h3>
      <p class="muted">ECHO will suggest exercises for that muscle group and remember your weights.</p>
      ${next ? `<button class="btn btn-primary" data-action="pickSplit" data-name="${UI.esc(next)}">Start ${UI.esc(next)}</button>` : ''}
    </div>`;
  },

  logger(d) {
    const s = Store.state;
    const best = Calc.bestLifts(s.workouts, d.editingId);
    const added = d.exercises.map(e => e.name);
    const sugg = Calc.suggestions(d.split).filter(n => !added.includes(n)).slice(0, 8);
    const prev = s.workouts.filter(w => !w.rest && w.split === d.split && w.id !== d.editingId && w.date < d.date).sort((a, b) => b.date.localeCompare(a.date))[0];

    const cards = d.exercises.length ? d.exercises.map(ex => Views.fitness.exCard(ex, best)).join('') :
      `<div class="card empty-card slim"><p class="muted">Tap a suggested exercise to add it, or add your own.</p></div>`;

    return `<div class="fit-grid">
      <aside class="fit-aside">
        <section class="card">
          <h2 class="card-title">Suggested for ${UI.esc(d.split.toLowerCase())}</h2>
          <p class="muted small">Tap to add</p>
          <div class="chip-wrap">
            ${sugg.map(n => `<button class="chip chip-add" data-action="addEx" data-name="${UI.esc(n)}">${UI.icon('plus', 14, 2.6)}${UI.esc(n)}</button>`).join('')}
            <button class="chip chip-dashed" data-action="addOwnEx">+ Own exercise</button>
          </div>
          ${prev ? `<button class="btn btn-soft btn-block" data-action="repeatLast" data-id="${prev.id}">${UI.icon('repeat', 16)}Repeat last ${UI.esc(d.split)} (${Dates.label(prev.date)})</button>` : ''}
        </section>
      </aside>
      <div class="fit-main">
        ${cards}
        <div class="finish-bar">
          <p class="muted small" id="fit-summary">${Views.fitness.summaryText(d)}</p>
          <div class="finish-actions">
            <button class="btn btn-ghost" data-action="discardWorkout">Discard</button>
            <button class="btn btn-primary btn-lg grow" data-action="finishWorkout">${UI.icon('check', 20, 2.6)}${d.editingId ? 'Save changes' : 'Finish workout'}</button>
          </div>
        </div>
      </div>
    </div>`;
  },

  exCard(ex, best) {
    const last = Calc.lastSet(Store.state.workouts, ex.name, Store.state.draft.editingId);
    const b = best[ex.name];
    const top = Math.max(0, ...ex.sets.map(s => Number(s.kg) || 0));
    const isPR = b && top > b.kg;
    const hint = [last ? `Last time ${UI.kg(last.kg)} kg × ${last.reps}` : 'First time logging this', b ? `Best ${UI.kg(b.kg)} kg` : ''].filter(Boolean).join(' · ');
    return `<article class="card ex-card" id="ex-${ex.id}">
      <div class="ex-head">
        <div><h3>${UI.esc(ex.name)} <span class="badge badge-lime pr-badge"${isPR ? '' : ' hidden'} id="pr-${ex.id}">${UI.icon('trophy', 12, 2.4)}New best</span></h3>
          <p class="muted small">${hint}</p></div>
        <button class="icon-btn" data-action="exRemove" data-ex="${ex.id}" aria-label="Remove ${UI.esc(ex.name)}">${UI.icon('trash', 18)}</button>
      </div>
      <table class="sets">
        <thead><tr><th>Set</th><th>Weight (kg)</th><th>Reps</th><th class="r">Done</th><th class="r"><span class="sr">Remove</span></th></tr></thead>
        <tbody>${ex.sets.map((st, i) => `
          <tr class="${st.done ? 'is-done' : ''}">
            <td class="muted">${i + 1}</td>
            <td><input class="set-input" type="number" inputmode="decimal" min="0" step="0.5" value="${st.kg === '' || st.kg == null ? '' : st.kg}" placeholder="0" aria-label="Set ${i + 1} weight in kg" data-input="setVal" data-ex="${ex.id}" data-set="${i}" data-field="kg"></td>
            <td><input class="set-input" type="number" inputmode="numeric" min="0" step="1" value="${st.reps === '' || st.reps == null ? '' : st.reps}" placeholder="0" aria-label="Set ${i + 1} reps" data-input="setVal" data-ex="${ex.id}" data-set="${i}" data-field="reps"></td>
            <td class="r"><button class="set-check${st.done ? ' on' : ''}" data-action="setDone" data-ex="${ex.id}" data-set="${i}" aria-label="Mark set ${i + 1} done" aria-pressed="${!!st.done}">${UI.icon('check', 16, 3)}</button></td>
            <td class="r"><button class="icon-btn icon-btn-sm" data-action="setRemove" data-ex="${ex.id}" data-set="${i}" aria-label="Remove set ${i + 1}">${UI.icon('x', 14, 2.4)}</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <button class="btn btn-dashed btn-block" data-action="setAdd" data-ex="${ex.id}">${UI.icon('plus', 16, 2.4)}Add set</button>
    </article>`;
  },

  summaryText(d) {
    const w = { exercises: d.exercises };
    const sets = Calc.workoutSets(w), vol = Calc.workoutVolume(w);
    return `${d.exercises.length} exercise${d.exercises.length === 1 ? '' : 's'} · ${sets} set${sets === 1 ? '' : 's'} · ${UI.num(vol)} kg lifted`;
  },

  summary(w) {
    const best = Calc.bestLifts(Store.state.workouts, w.id);
    const prs = w.exercises.filter(ex => {
      const top = Math.max(0, ...ex.sets.map(s => Number(s.kg) || 0));
      return best[ex.name] && top > best[ex.name].kg;
    });
    const fresh = App.ui.justSaved === w.id;
    return `<section class="card done-card${fresh ? ' pop' : ''}">
      <div class="done-head">
        <span class="done-icon">${UI.icon('check', 28, 3)}</span>
        <div><p class="eyebrow">Workout saved</p><h2>${UI.esc(w.split)}</h2></div>
      </div>
      <div class="stat-grid stat-grid-3">
        <div class="stat-tile"><small>Exercises</small><b>${w.exercises.length}</b></div>
        <div class="stat-tile"><small>Sets</small><b>${Calc.workoutSets(w)}</b></div>
        <div class="stat-tile"><small>Weight lifted</small><b>${UI.num(Calc.workoutVolume(w))} <em>kg</em></b></div>
      </div>
      ${prs.length ? `<div class="pr-strip">${UI.icon('trophy', 20)}<span><b>New best${prs.length > 1 ? 's' : ''}:</b> ${prs.map(p => UI.esc(p.name)).join(', ')}</span></div>` : ''}
      <ul class="ex-summary">${w.exercises.map(ex => `<li><b>${UI.esc(ex.name)}</b><span>${ex.sets.map(s => `${UI.kg(s.kg)}×${s.reps}`).join(' · ')}</span></li>`).join('')}</ul>
      <div class="btn-row">
        <button class="btn btn-ghost" data-action="editWorkout" data-id="${w.id}">${UI.icon('pencil', 16)}Edit workout</button>
        <a class="btn btn-primary" href="#fitness-progress">${UI.icon('arrowUp', 16)}See progress</a>
      </div>
    </section>`;
  },

  restView() {
    const next = Store.suggestedSplit();
    return `<section class="card empty-card rest-card">
      <span class="empty-icon">${UI.icon('moon', 30)}</span>
      <h3>Rest day logged</h3>
      <p class="muted">Muscles grow while you recover. ${next ? 'Next up: <b>' + UI.esc(next) + '</b>.' : ''}</p>
      <button class="btn btn-ghost" data-action="undoRest">Undo rest day</button>
    </section>`;
  },

  /* ================= PROGRESS ================= */
  progress() {
    const s = Store.state;
    const filter = App.ui.progFilter || '';
    const weeks = Calc.weeklyVolume(s.workouts, 8, filter);
    const vals = weeks.map(w => w.vol);
    const labels = weeks.map((w, i) => i === weeks.length - 1 ? 'This wk' : Dates.short(w.start));
    const last4 = vals.slice(4).reduce((a, b) => a + b, 0), prev4 = vals.slice(0, 4).reduce((a, b) => a + b, 0);
    const trend = prev4 ? Math.round((last4 - prev4) / prev4 * 100) : null;
    const thisWeek = vals[vals.length - 1];
    const bestWeek = Math.max(...vals);
    const count7 = s.workouts.filter(w => !w.rest && w.date >= Dates.add(Dates.today(), -6) && (!filter || w.split === filter)).length;

    const chips = ['', ...(s.user.split || [])].map(n => `<button class="chip chip-sm${filter === n ? ' on' : ''}" data-action="progFilter" data-name="${UI.esc(n)}">${n ? UI.esc(n) : 'All'}</button>`).join('');

    const trendBadge = trend == null ? '' : `<span class="badge ${trend >= 0 ? 'badge-lime' : 'badge-coral'}">${UI.icon(trend >= 0 ? 'arrowUp' : 'arrowDown', 14, 2.4)}${trend >= 0 ? '+' : ''}${trend}% vs previous 4 weeks</span>`;

    return `<section class="card chart-card">
      <div class="card-head wrap">
        <div><h2 class="card-title">Workout intensity</h2><p class="muted small">Total kg lifted per week (weight × reps). A rising line means you're getting stronger.</p></div>
        ${trendBadge}
      </div>
      <div class="chip-wrap">${chips}</div>
      ${vals.some(v => v) ? UI.lineChart(vals, labels, { width: UI.chartWidth('full'), height: 240, label: 'Weekly kg lifted over the last 8 weeks' }) : '<div class="empty">No workouts logged yet for this filter.</div>'}
      <div class="stat-grid stat-grid-3">
        <div class="stat-tile"><small>This week</small><b>${UI.num(thisWeek)} <em>kg</em></b></div>
        <div class="stat-tile"><small>Workouts (7 days)</small><b>${count7}</b></div>
        <div class="stat-tile"><small>Best week</small><b>${UI.num(bestWeek)} <em>kg</em></b></div>
      </div>
    </section>
    <div class="grid-2">
      ${Views.fitness.bestLifts()}
      ${Views.fitness.history()}
    </div>`;
  },

  bestLifts() {
    const best = Object.values(Calc.bestLifts(Store.state.workouts));
    best.sort((a, b) => b.date.localeCompare(a.date) || b.kg - a.kg);
    const recent = Dates.add(Dates.today(), -7);
    return `<section class="card">
      <div class="card-head"><h2 class="card-title">Best lifts</h2><span class="muted small">All time</span></div>
      ${best.length ? `<div class="pr-grid">${best.slice(0, 6).map(b => `
        <div class="pr-tile${b.date >= recent ? ' is-new' : ''}">
          <span class="pr-ico">${UI.icon('trophy', 16)}</span>
          <small>${UI.esc(b.name)}</small>
          <b>${UI.kg(b.kg)}<em> kg</em></b>
          <span class="muted small">× ${b.reps} · ${Dates.label(b.date)}</span>
        </div>`).join('')}</div>` : '<div class="empty small">Finish a workout to see your best lifts here.</div>'}
    </section>`;
  },

  history() {
    const list = Store.state.workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
    const open = App.ui.histOpen;
    return `<section class="card">
      <div class="card-head"><h2 class="card-title">History</h2><span class="muted small">Tap a day to see sets</span></div>
      ${list.length ? `<ul class="hist-list">${list.map(w => `
        <li class="hist-item${open === w.id ? ' open' : ''}">
          <button class="hist-row" data-action="histToggle" data-id="${w.id}" aria-expanded="${open === w.id}">
            <span class="day-badge${w.date === Dates.today() ? ' today' : ''}"><small>${Dates.weekday(w.date)}</small><b>${Dates.dayNum(w.date)}</b></span>
            <span class="hist-text"><b>${UI.esc(w.split)}</b><small class="muted">${w.rest ? 'Recovery' : `${w.exercises.length} exercises · ${UI.num(Calc.workoutVolume(w))} kg`}</small></span>
            ${w.rest ? '' : UI.icon('chevronDown', 18)}
          </button>
          ${open === w.id && !w.rest ? `<div class="hist-detail">
            <ul class="ex-summary">${w.exercises.map(ex => `<li><b>${UI.esc(ex.name)}</b><span>${ex.sets.map(s => `${UI.kg(s.kg)}×${s.reps}`).join(' · ')}</span></li>`).join('')}</ul>
            <div class="btn-row">
              <button class="btn btn-ghost btn-sm" data-action="editWorkout" data-id="${w.id}">${UI.icon('pencil', 15)}Edit</button>
              <button class="btn btn-ghost btn-sm" data-action="deleteWorkout" data-id="${w.id}">${UI.icon('trash', 15)}Delete</button>
            </div></div>` : ''}
        </li>`).join('')}</ul>` : '<div class="empty small">No workouts yet.</div>'}
    </section>`;
  }
};

/* ---------------- actions ---------------- */
const Fit = {
  draft() { return Store.state.draft; },
  ex(id) { return Store.state.draft.exercises.find(e => e.id === id); },
  newDraft(split) { return { date: Dates.today(), split, exercises: [], editingId: null }; },
  save() { Store.save(); }
};

Actions.pickSplit = el => {
  const s = Store.state, name = el.dataset.name;
  if (!s.draft) s.draft = Fit.newDraft(name); else s.draft.split = name;
  Fit.save(); App.refresh();
};
Actions.restDay = async () => {
  const s = Store.state;
  if (s.draft && s.draft.exercises.length) {
    const ok = await UI.dialog({ title: 'Make today a rest day?', text: 'The exercises you added today will be cleared.', ok: 'Rest day', danger: true });
    if (!ok) return;
  }
  s.draft = null;
  s.workouts = s.workouts.filter(w => w.date !== Dates.today());
  s.workouts.push({ id: uid(), date: Dates.today(), split: 'Rest day', rest: true, exercises: [] });
  Store.todayTasks().forEach(t => { if (t.auto === 'workout' && t.status === 'open') t.status = 'skipped'; });
  Fit.save(); UI.toast('Rest day logged'); App.refresh();
};
Actions.undoRest = () => {
  const s = Store.state;
  s.workouts = s.workouts.filter(w => !(w.date === Dates.today() && w.rest));
  Store.todayTasks().forEach(t => { if (t.auto === 'workout' && t.status === 'skipped') t.status = 'open'; });
  Fit.save(); App.refresh();
};
Actions.customSplit = async () => {
  const r = await UI.dialog({ title: 'Name your workout', fields: [{ name: 'name', label: 'Workout name', placeholder: 'e.g. Upper body, Push, Cardio' }], ok: 'Add' });
  if (!r || !r.name.trim()) return;
  const name = r.name.trim().slice(0, 30), u = Store.state.user;
  if (!u.split.includes(name)) u.split.push(name);
  Actions.pickSplit({ dataset: { name } });
};
Actions.editSplit = async () => {
  const u = Store.state.user;
  const r = await UI.dialog({ title: 'Edit your split', text: 'One workout per line, in the order you follow them.', fields: [{ name: 'list', label: 'Your workouts', type: 'textarea', rows: 5, value: (u.split || []).join('\n') }] });
  if (!r) return;
  const list = r.list.split(/\n|,/).map(x => x.trim()).filter(Boolean).slice(0, 10);
  if (!list.length) { UI.toast('Add at least one workout', 'warn'); return; }
  u.split = list; Fit.save(); UI.toast('Split updated'); App.refresh();
};
Actions.addEx = el => {
  const d = Fit.draft(), name = el.dataset.name;
  const last = Calc.lastSet(Store.state.workouts, name, d.editingId);
  d.exercises.push({ id: uid(), name, sets: [{ kg: last ? last.kg : '', reps: last ? last.reps : '', done: false }] });
  Fit.save(); App.refresh();
};
Actions.addOwnEx = async () => {
  const r = await UI.dialog({ title: 'Add your own exercise', fields: [{ name: 'name', label: 'Exercise name', placeholder: 'e.g. Machine Chest Press' }], ok: 'Add' });
  if (!r || !r.name.trim()) return;
  Actions.addEx({ dataset: { name: r.name.trim().slice(0, 40) } });
};
Actions.repeatLast = el => {
  const d = Fit.draft(), w = Store.state.workouts.find(x => x.id === el.dataset.id);
  if (!w) return;
  w.exercises.forEach(ex => {
    if (d.exercises.some(e => e.name === ex.name)) return;
    d.exercises.push({ id: uid(), name: ex.name, sets: ex.sets.map(s => ({ kg: s.kg, reps: s.reps, done: false })) });
  });
  Fit.save(); UI.toast('Loaded your last ' + w.split + ' session'); App.refresh();
};
Actions.exRemove = el => {
  const d = Fit.draft(); d.exercises = d.exercises.filter(e => e.id !== el.dataset.ex);
  Fit.save(); App.refresh();
};
Actions.setAdd = el => {
  const ex = Fit.ex(el.dataset.ex), last = ex.sets[ex.sets.length - 1];
  ex.sets.push({ kg: last ? last.kg : '', reps: last ? last.reps : '', done: false });
  Fit.save(); App.refresh();
};
Actions.setRemove = el => {
  const ex = Fit.ex(el.dataset.ex); ex.sets.splice(Number(el.dataset.set), 1);
  if (!ex.sets.length) ex.sets.push({ kg: '', reps: '', done: false });
  Fit.save(); App.refresh();
};
Actions.setDone = el => {
  const ex = Fit.ex(el.dataset.ex), st = ex.sets[Number(el.dataset.set)];
  if (!st.done && !(Number(st.reps) > 0)) { UI.toast('Enter the reps first', 'warn'); return; }
  st.done = !st.done;
  Fit.save(); App.refresh();
};
Inputs.setVal = el => {
  const ex = Fit.ex(el.dataset.ex); if (!ex) return;
  const st = ex.sets[Number(el.dataset.set)];
  st[el.dataset.field] = el.value === '' ? '' : Number(el.value);
  Fit.save();
  const sum = document.getElementById('fit-summary');
  if (sum) sum.textContent = Views.fitness.summaryText(Fit.draft());
  const best = Calc.bestLifts(Store.state.workouts, Fit.draft().editingId)[ex.name];
  const top = Math.max(0, ...ex.sets.map(s => Number(s.kg) || 0));
  const badge = document.getElementById('pr-' + ex.id);
  if (badge) badge.hidden = !(best && top > best.kg);
};
Actions.finishWorkout = () => {
  const s = Store.state, d = s.draft;
  const exercises = d.exercises.map(ex => ({ id: ex.id, name: ex.name, sets: ex.sets.filter(st => Number(st.reps) > 0).map(st => ({ kg: Number(st.kg) || 0, reps: Number(st.reps), done: true })) })).filter(ex => ex.sets.length);
  if (!exercises.length) { UI.toast('Add at least one set with reps', 'warn'); return; }
  const before = Calc.bestLifts(s.workouts, d.editingId);
  const prs = exercises.filter(ex => before[ex.name] && Math.max(...ex.sets.map(x => x.kg)) > before[ex.name].kg).map(ex => ex.name);
  const w = { id: d.editingId || uid(), date: d.date, split: d.split, rest: false, exercises };
  s.workouts = s.workouts.filter(x => x.id !== w.id && !(x.date === w.date && x.rest));
  s.workouts.push(w);
  const wasEdit = !!d.editingId, isToday = d.date === Dates.today();
  s.draft = null;
  if (isToday) Store.completeAuto('workout');
  App.ui.justSaved = w.id;
  Fit.save();
  UI.toast(prs.length ? `Saved! New best on ${prs[0]}` : `Workout saved · ${UI.num(Calc.workoutVolume(w))} kg lifted`);
  if (wasEdit && !isToday) App.go('#fitness-progress'); else App.refresh();
};
Actions.discardWorkout = async () => {
  const d = Fit.draft();
  if (d.exercises.length && !d.editingId) {
    const ok = await UI.dialog({ title: 'Discard this workout?', text: 'Everything you logged in this session will be removed.', ok: 'Discard', danger: true });
    if (!ok) return;
  }
  Store.state.draft = null; Fit.save(); App.refresh();
};
Actions.editWorkout = el => {
  const w = Store.state.workouts.find(x => x.id === el.dataset.id);
  if (!w) return;
  Store.state.draft = { date: w.date, split: w.split, editingId: w.id, exercises: w.exercises.map(ex => ({ id: uid(), name: ex.name, sets: ex.sets.map(s => Object.assign({}, s)) })) };
  Fit.save(); App.go('#fitness');
};
Actions.cancelEdit = () => { Store.state.draft = null; Fit.save(); App.refresh(); };
Actions.deleteWorkout = async el => {
  const ok = await UI.dialog({ title: 'Delete this workout?', text: 'It will be removed from your history and graph.', ok: 'Delete', danger: true });
  if (!ok) return;
  Store.state.workouts = Store.state.workouts.filter(w => w.id !== el.dataset.id);
  Fit.save(); UI.toast('Workout deleted'); App.refresh();
};
Actions.histToggle = el => { App.ui.histOpen = App.ui.histOpen === el.dataset.id ? null : el.dataset.id; App.refresh(); };
Actions.progFilter = el => { App.ui.progFilter = el.dataset.name; App.refresh(); };

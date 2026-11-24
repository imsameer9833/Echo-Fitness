/* =========================================================
   ECHO — views/meal.js
   Today: targets from your profile, then type (or speak)
   what you ate per meal; ECHO estimates calories, macros
   and a score out of 100 with a tip. History: 14-day view.
   ========================================================= */

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' }
];
const QUICK_FOODS = {
  breakfast: ['poha', '2 boiled eggs', '1 bowl oats', '2 idli', '1 glass milk', 'tea', 'banana'],
  lunch: ['2 chapati', 'dal', '1 bowl rice', 'salad', 'curd', 'paneer bhurji', 'chicken curry'],
  dinner: ['2 chapati', 'dal', 'mix veg', '1 bowl rice', 'curd', 'egg curry', 'paneer tikka'],
  snacks: ['banana', 'whey protein', 'handful almonds', 'apple', 'tea', 'sprouts', 'greek yogurt']
};

Views.meal = {
  render(sub) {
    const tabs = App.tabs([
      { href: '#meal', label: 'Today', active: sub !== 'history' },
      { href: '#meal-history', label: 'History', active: sub === 'history' }
    ]);
    return App.header('Meal', '') + tabs + (sub === 'history' ? Views.meal.history() : Views.meal.today());
  },

  current() {
    if (!App.ui.mealTab) {
      const h = new Date().getHours();
      App.ui.mealTab = h < 11 ? 'breakfast' : h < 16 ? 'lunch' : h < 22 ? 'dinner' : 'snacks';
    }
    App.ui.mealText = App.ui.mealText || {};
    App.ui.mealResult = App.ui.mealResult || {};
    App.ui.mealEditing = App.ui.mealEditing || {};
    return App.ui.mealTab;
  },

  /* ================= TODAY ================= */
  today() {
    const type = Views.meal.current();
    const meals = Store.todayMeals();
    const saved = meals[type];
    const editing = App.ui.mealEditing[type];
    const label = MEAL_TYPES.find(m => m.key === type).label;

    const tabs = `<div class="seg seg-4" role="tablist" aria-label="Meal of the day">${MEAL_TYPES.map(m => `
      <button role="tab" aria-selected="${m.key === type}" class="seg-item${m.key === type ? ' on' : ''}" data-action="mealTab" data-type="${m.key}">
        ${meals[m.key] ? '<span class="dot-lime"></span>' : ''}${m.label}</button>`).join('')}</div>`;

    let panel;
    if (App.ui.analysing === type) panel = Views.meal.thinking();
    else if (saved && !editing) panel = Views.meal.result(saved, type, true);
    else {
      panel = Views.meal.input(type, label, editing);
      if (App.ui.mealResult[type]) panel += Views.meal.result(App.ui.mealResult[type], type, false);
    }

    return `${Views.meal.targetsCard()}
    <div class="grid-main">
      <div class="stack">${tabs}<div id="meal-panel" class="stack">${panel}</div></div>
      ${Views.meal.dayList(meals)}
    </div>`;
  },

  targetsCard() {
    const u = Store.state.user, t = Calc.targets(u), d = Calc.dayTotals(Store.todayMeals());
    const left = t.kcal - d.kcal;
    const goal = { lose: 'Lose fat', maintain: 'Maintain', build: 'Build muscle' }[u.goal];
    const work = { sitting: 'Mostly sitting', feet: 'On my feet', physical: 'Physical work' }[u.work];
    const bar = (name, val, max, color) => `<div class="macro-row">
      <div class="macro-label"><span>${name}</span><span class="muted"><b>${Math.round(val)}</b> / ${max} g</span></div>
      <div class="progress"><span class="bg-${color}" style="width:${Math.min(100, Math.round(val / max * 100))}%"></span></div></div>`;
    return `<section class="card targets-card">
      <div class="ring-wrap">
        ${UI.ring(d.kcal / t.kcal, 132, 12, left < 0 ? 'var(--coral)' : 'var(--lime)')}
        <div class="ring-text"><b>${UI.num(Math.abs(left))}</b><small>${left < 0 ? 'kcal over' : 'kcal left'}</small></div>
      </div>
      <div class="macros">
        ${bar('Protein', d.p, t.protein, 'lime')}
        ${bar('Carbs', d.c, t.carbs, 'sky')}
        ${bar('Fat', d.f, t.fat, 'amber')}
        <p class="muted small target-line">Eaten <b>${UI.num(d.kcal)}</b> of <b>${UI.num(t.kcal)}</b> kcal · ${goal} · ${work} · ${u.gymDays} gym days <a href="#profile">Edit</a></p>
      </div>
    </section>`;
  },

  input(type, label, editing) {
    const text = App.ui.mealText[type] || '';
    return `<section class="card">
      <label for="meal-text" class="card-title">What did you have for ${label.toLowerCase()}?</label>
      <textarea id="meal-text" class="meal-text" rows="3" maxlength="300" placeholder="e.g. 2 chapati, dal tadka, 1 bowl rice, salad" data-input="mealText">${UI.esc(text)}</textarea>
      <div class="chip-wrap quick-foods" aria-label="Quick add">${QUICK_FOODS[type].map(f => `<button class="chip chip-sm" data-action="mealQuick" data-text="${UI.esc(f)}">+ ${UI.esc(f)}</button>`).join('')}</div>
      <div class="btn-row">
        <button class="icon-btn icon-btn-lg mic-btn" id="meal-mic" data-action="mealMic" aria-label="Say what you ate">${UI.icon('mic', 22)}</button>
        ${editing ? '<button class="btn btn-ghost" data-action="mealCancelEdit">Cancel</button>' : ''}
        <button class="btn btn-primary btn-lg grow" data-action="mealAnalyse">${UI.icon('sparkle', 20)}Analyze with AI</button>
      </div>
    </section>`;
  },

  thinking() {
    return `<section class="card thinking-card" aria-live="polite">
      <div class="think-head"><span class="spinner"></span><b>ECHO is reading your meal…</b></div>
      <ul class="think-steps"><li>Finding the foods and amounts</li><li>Adding up calories and macros</li><li>Scoring it against your targets</li></ul>
      <div class="shimmer"></div><div class="shimmer short"></div>
    </section>`;
  },

  result(r, type, saved) {
    const label = MEAL_TYPES.find(m => m.key === type).label;
    const col = UI.scoreColor(r.score);
    const parts = r.parts || {};
    const part = (name, v, max) => `<div class="part"><span>${name}</span><div class="progress thin"><span class="bg-${col}" style="width:${Math.round((v || 0) / max * 100)}%"></span></div><b>${v || 0}/${max}</b></div>`;
    return `<section class="card result-card ${saved ? 'saved' : 'fresh'}">
      <div class="result-head">
        <div><p class="eyebrow">${label} · ${saved ? 'saved' : 'AI estimate'}</p><p class="result-kcal">${UI.num(r.totals.kcal)} <em>kcal</em></p></div>
        <div class="score score-${col}">${UI.ring(r.score / 100, 84, 8, 'var(--' + col + ')')}<div class="score-text"><b>${r.score}</b><small>/100</small></div></div>
      </div>
      <div class="score-label c-${col}">${r.label} meal</div>
      <div class="chip-wrap">
        <span class="pill"><i class="bg-lime"></i>Protein ${Math.round(r.totals.p)} g</span>
        <span class="pill"><i class="bg-sky"></i>Carbs ${Math.round(r.totals.c)} g</span>
        <span class="pill"><i class="bg-amber"></i>Fat ${Math.round(r.totals.f)} g</span>
        <span class="pill"><i class="bg-soft"></i>Fibre ${Math.round(r.totals.fib)} g</span>
      </div>
      <p class="tip">${UI.icon('sparkle', 18)}<span>${UI.esc(r.tip)}</span></p>
      <details class="breakdown">
        <summary>How ECHO worked this out</summary>
        <table class="items">
          <thead><tr><th>Food</th><th>Amount</th><th class="r">kcal</th><th class="r">Protein</th></tr></thead>
          <tbody>${r.items.map(it => `<tr><td>${UI.esc(it.name)}${it.tags.includes('unknown') ? ' <span class="badge badge-amber">estimated</span>' : ''}</td><td class="muted">${UI.esc(it.qtyLabel)}</td><td class="r">${Math.round(it.kcal)}</td><td class="r">${Math.round(it.p)} g</td></tr>`).join('')}</tbody>
        </table>
        <div class="parts">${part('Calories fit', parts.kcal, 25)}${part('Protein', parts.protein, 25)}${part('Carb/fat balance', parts.balance, 15)}${part('Fibre & veg', parts.fibre, 15)}${part('Food quality', parts.quality, 20)}${parts.penalty ? `<div class="part"><span>Junk food penalty</span><span></span><b class="c-coral">−${parts.penalty}</b></div>` : ''}</div>
      </details>
      <div class="btn-row">
        ${saved
        ? `<button class="btn btn-ghost" data-action="mealEdit" data-type="${type}">${UI.icon('pencil', 16)}Edit</button><button class="btn btn-ghost" data-action="mealDelete" data-type="${type}">${UI.icon('trash', 16)}Delete</button>`
        : `<button class="btn btn-ghost" data-action="mealDiscard" data-type="${type}">Discard</button><button class="btn btn-primary grow" data-action="mealSave" data-type="${type}">${UI.icon('check', 18, 2.6)}Save ${label.toLowerCase()}</button>`}
      </div>
    </section>`;
  },

  dayList(meals) {
    const t = Calc.targets(Store.state.user);
    return `<section class="card">
      <div class="card-head"><h2 class="card-title">Today's meals</h2><span class="muted small">Plan: ${UI.num(t.kcal)} kcal</span></div>
      <ul class="meal-list">${MEAL_TYPES.map(m => {
      const r = meals[m.key];
      const plan = Math.round(t.kcal * Calc.MEAL_SHARE[m.key]);
      return `<li><button class="meal-row" data-action="mealTab" data-type="${m.key}">
          <span class="meal-ico">${UI.icon(m.key === 'snacks' ? 'bolt' : 'meal', 18)}</span>
          <span class="meal-row-text"><b>${m.label}</b><small class="muted">${r ? UI.esc(r.text) : 'Not logged · plan about ' + UI.num(plan) + ' kcal'}</small></span>
          ${r ? `<span class="meal-row-right"><b>${UI.num(r.totals.kcal)}</b><span class="score-pill sp-${UI.scoreColor(r.score)}">${r.score}</span></span>` : `<span class="add-mini">${UI.icon('plus', 16, 2.4)}</span>`}
        </button></li>`;
    }).join('')}</ul>
    </section>`;
  },

  /* ================= HISTORY ================= */
  history() {
    const s = Store.state, today = Dates.today(), t = Calc.targets(s.user);
    const days = [];
    for (let i = 13; i >= 0; i--) { const k = Dates.add(today, -i); days.push({ key: k, tot: Calc.dayTotals(s.meals[k]) }); }
    const last7 = days.slice(7).filter(d => d.tot.count);
    const full7 = days.slice(7).filter(d => d.tot.count && d.key !== today); // complete days only
    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const avgScore = avg(last7.map(d => d.tot.score));
    const good = last7.filter(d => d.tot.score >= 75).length;
    const avgP = avg(full7.map(d => d.tot.p));
    const avgK = avg(full7.map(d => d.tot.kcal));

    const vals = days.map(d => d.tot.count ? d.tot.score : null);
    const cols = days.map(d => UI.scoreColor(d.tot.score || 0));
    const labels = days.map((d, i) => i === 13 ? 'Today' : (i % 3 === 0 ? Dates.short(d.key) : ''));
    const open = App.ui.mealOpen;

    return `<div class="stat-grid">
      <div class="stat-tile"><small>Avg score · 7 days</small><b>${avgScore} <em>/100</em></b></div>
      <div class="stat-tile"><small>Good days (75+)</small><b>${good} <em>of ${last7.length || 7}</em></b></div>
      <div class="stat-tile"><small>Avg protein</small><b>${avgP} <em>/ ${t.protein} g</em></b></div>
      <div class="stat-tile"><small>Avg calories</small><b>${UI.num(avgK)} <em>/ ${UI.num(t.kcal)}</em></b></div>
    </div>
    <div class="grid-main">
      <section class="card chart-card">
        <div class="card-head"><h2 class="card-title">Daily meal score</h2><span class="muted small">Last 14 days</span></div>
        ${UI.barChart(vals, labels, cols, { width: UI.chartWidth('main'), max: 100, ticks: [0, 50, 75, 100], goal: 75, label: 'Daily meal score for the last 14 days' })}
        <div class="legend"><span><i class="bg-lime"></i>Good 75+</span><span><i class="bg-amber"></i>Okay 50–74</span><span><i class="bg-coral"></i>Poor under 50</span></div>
      </section>
      <section class="card">
        <h2 class="card-title">Day by day</h2>
        <ul class="hist-list">${days.slice().reverse().filter(d => d.tot.count).map(d => {
      const meals = s.meals[d.key];
      return `<li class="hist-item${open === d.key ? ' open' : ''}">
            <button class="hist-row" data-action="mealHistToggle" data-key="${d.key}" aria-expanded="${open === d.key}">
              <span class="hist-text"><b>${Dates.label(d.key)}</b><small class="muted">${UI.num(d.tot.kcal)} kcal · ${d.tot.p} g protein${d.key === today ? ' so far' : ''}</small></span>
              <span class="score-pill sp-${UI.scoreColor(d.tot.score)}">${d.tot.score}</span>
              ${UI.icon('chevronDown', 18)}
            </button>
            ${open === d.key ? `<ul class="hist-meals">${MEAL_TYPES.filter(m => meals[m.key]).map(m => `<li><span><b>${m.label}</b><small class="muted">${UI.esc(meals[m.key].text)}</small></span><span class="muted small">${UI.num(meals[m.key].totals.kcal)} kcal</span><span class="score-pill sp-${UI.scoreColor(meals[m.key].score)}">${meals[m.key].score}</span></li>`).join('')}</ul>` : ''}
          </li>`;
    }).join('') || '<li class="empty small">No meals logged yet.</li>'}</ul>
      </section>
    </div>`;
  }
};

/* ---------------- actions ---------------- */
Actions.mealTab = el => { App.ui.mealTab = el.dataset.type; if (App.parse().sub === 'history') App.go('#meal'); else App.refresh(); };
Inputs.mealText = el => { App.ui.mealText[Views.meal.current()] = el.value; };
Actions.mealQuick = el => {
  const type = Views.meal.current(), ta = document.getElementById('meal-text');
  const cur = (ta.value || '').trim();
  ta.value = cur ? cur.replace(/,\s*$/, '') + ', ' + el.dataset.text : el.dataset.text;
  App.ui.mealText[type] = ta.value;
  ta.focus();
};
Actions.mealMic = el => {
  const type = Views.meal.current(), ta = document.getElementById('meal-text');
  if (Voice.rec) { Voice.stop(); return; }
  const base = (ta.value || '').trim();
  el.classList.add('listening');
  Voice.listen((txt) => {
    ta.value = (base ? base + ', ' : '') + txt;
    App.ui.mealText[type] = ta.value;
  }, () => el.classList.remove('listening'));
};
Actions.mealAnalyse = () => {
  const type = Views.meal.current();
  const text = (App.ui.mealText[type] || '').trim();
  if (!text) { UI.toast('Type or say what you ate first', 'warn'); document.getElementById('meal-text').focus(); return; }
  Voice.stop();
  App.ui.analysing = type;
  App.ui.mealResult[type] = null;
  App.refresh();
  setTimeout(() => {
    App.ui.mealResult[type] = Calc.analyseMeal(text, type, Store.state.user);
    App.ui.analysing = null;
    App.refresh();
  }, 1300);
};
Actions.mealSave = el => {
  const type = el.dataset.type, r = App.ui.mealResult[type], s = Store.state, d = Dates.today();
  if (!r) return;
  s.meals[d] = s.meals[d] || {};
  s.meals[d][type] = Object.assign({}, r, { savedAt: d });
  Store.completeAuto('meal:' + type);
  App.ui.mealResult[type] = null; App.ui.mealText[type] = ''; App.ui.mealEditing[type] = false;
  Store.save();
  UI.toast(`${Calc.cap(type)} saved · ${r.score}/100`);
  App.refresh();
};
Actions.mealDiscard = el => { App.ui.mealResult[el.dataset.type] = null; App.refresh(); };
Actions.mealEdit = el => {
  const type = el.dataset.type, saved = Store.todayMeals()[type];
  App.ui.mealText[type] = saved ? saved.text : '';
  App.ui.mealResult[type] = null;
  App.ui.mealEditing[type] = true;
  App.refresh();
};
Actions.mealCancelEdit = () => { const t = Views.meal.current(); App.ui.mealEditing[t] = false; App.ui.mealResult[t] = null; App.refresh(); };
Actions.mealDelete = async el => {
  const ok = await UI.dialog({ title: 'Delete this meal?', ok: 'Delete', danger: true });
  if (!ok) return;
  delete Store.state.meals[Dates.today()][el.dataset.type];
  Store.save(); App.refresh();
};
Actions.mealHistToggle = el => { App.ui.mealOpen = App.ui.mealOpen === el.dataset.key ? null : el.dataset.key; App.refresh(); };

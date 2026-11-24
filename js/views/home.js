/* =========================================================
   ECHO — views/home.js
   Today's dashboard: tasks first, then one card per section
   and a "this week" summary.
   ========================================================= */

Views.home = {
  render() {
    const s = Store.state, u = s.user;
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const tasks = Store.todayTasks();
    const order = { open: 0, done: 1, skipped: 2 };
    const shown = tasks.slice().sort((a, b) => order[a.status] - order[b.status]).slice(0, 5);
    const done = tasks.filter(t => t.status === 'done').length;

    return `
    <header class="page-head">
      <div><p class="eyebrow">${Dates.long()}</p><h1>${hello}, ${UI.esc(u.name)}</h1></div>
      <a href="#profile" class="avatar avatar-lg" aria-label="Your profile">${UI.esc(u.name.charAt(0).toUpperCase())}</a>
    </header>

    <div class="home-grid">
      <section class="card tasks-card">
        <div class="card-head"><h2 class="card-title">Today's tasks</h2><span class="muted small">${done} of ${tasks.length} done</span></div>
        <div class="progress"><span style="width:${tasks.length ? Math.round(done / tasks.length * 100) : 0}%"></span></div>
        ${shown.length ? `<ul class="mini-tasks">${shown.map(Views.home.taskRow).join('')}</ul>` :
        `<div class="empty small">No tasks yet. <a href="#tasks">Add what you want to do today</a></div>`}
        <form class="quick-add" data-submit="homeAddTask">
          <input name="title" placeholder="Add a task for today…" aria-label="Add a task" maxlength="80">
          <button class="icon-btn icon-btn-lime" type="submit" aria-label="Add task">${UI.icon('plus', 20, 2.4)}</button>
        </form>
        <a href="#tasks" class="link-strong">See all tasks</a>
      </section>

      <div class="section-cards">
        ${Views.home.fitnessCard()}
        ${Views.home.mealCard()}
        ${Views.home.focusCard()}
        <a href="#echo" class="sec-card sec-card-lime">
          <div class="sec-top"><span class="sec-icon sec-icon-dark">${UI.icon('echo', 20)}</span><span class="sec-label">ECHO AI</span></div>
          <div><div class="sec-value">Ask anything</div><div class="sec-sub">Type or talk about meals, workouts and plans</div></div>
        </a>
      </div>
    </div>

    ${Views.home.week()}`;
  },

  taskRow(t) {
    const done = t.status === 'done', skipped = t.status === 'skipped';
    return `<li class="mini-task${done ? ' is-done' : ''}${skipped ? ' is-skipped' : ''}">
      <button class="check-btn" data-action="homeToggleTask" data-id="${t.id}" aria-label="${done ? 'Mark ' + UI.esc(t.title) + ' not done' : 'Mark ' + UI.esc(t.title) + ' done'}">
        <span class="check-box">${done ? UI.icon('check', 14, 3.2) : skipped ? UI.icon('x', 12, 3) : ''}</span>
      </button>
      <span class="mini-task-title">${UI.esc(t.title)}</span>
      <span class="tag">${UI.esc(t.tag)}</span>
    </li>`;
  },

  fitnessCard() {
    const w = Store.todayWorkout(), d = Store.state.draft;
    let value, sub;
    if (w && w.rest) { value = 'Rest day'; sub = 'Recovery logged'; }
    else if (w) { value = w.split; sub = `Done · ${Calc.workoutSets(w)} sets · ${UI.num(Calc.workoutVolume(w))} kg`; }
    else if (d && d.date === Dates.today() && d.split) { value = d.split; sub = `In progress · ${d.exercises.length} exercises`; }
    else { value = Store.suggestedSplit() || 'Pick a workout'; sub = 'Suggested for today · not started'; }
    return `<a href="#fitness" class="sec-card">
      <div class="sec-top"><span class="sec-icon">${UI.icon('dumbbell', 20)}</span><span class="sec-label">Fitness</span></div>
      <div><div class="sec-value">${UI.esc(value)}</div><div class="sec-sub">${sub}</div></div>
    </a>`;
  },
  mealCard() {
    const t = Calc.targets(Store.state.user), d = Calc.dayTotals(Store.todayMeals());
    const meals = Store.todayMeals();
    const last = ['snacks', 'dinner', 'lunch', 'breakfast'].find(k => meals[k]);
    const pct = v => Math.max(4, Math.round(v * 100));
    return `<a href="#meal" class="sec-card">
      <div class="sec-top"><span class="sec-icon">${UI.icon('meal', 20)}</span><span class="sec-label">Meal</span></div>
      <div>
        <div class="sec-value">${UI.num(d.kcal)} <em>/ ${UI.num(t.kcal)} kcal</em></div>
        <div class="macro-mini"><span class="bg-lime" style="flex:${pct(d.p / t.protein)}"></span><span class="bg-sky" style="flex:${pct(d.c / t.carbs)}"></span><span class="bg-amber" style="flex:${pct(d.f / t.fat)}"></span></div>
        <div class="sec-sub">${last ? Calc.cap(last) + ' score ' + meals[last].score + '/100' : 'Nothing logged yet'}</div>
      </div>
    </a>`;
  },
  focusCard() {
    const m = Store.todayFocusMinutes();
    const n = Store.state.focus.filter(f => f.date === Dates.today()).length;
    return `<a href="#tasks-focus" class="sec-card">
      <div class="sec-top"><span class="sec-icon">${UI.icon('clock', 20)}</span><span class="sec-label">Focus</span></div>
      <div><div class="sec-value">${m ? UI.mins(m) : '0m'}</div><div class="sec-sub">Focused today · ${n} session${n === 1 ? '' : 's'}</div></div>
    </a>`;
  },

  week() {
    const s = Store.state, today = Dates.today(), start = Dates.add(today, -6);
    const ws = s.workouts.filter(w => !w.rest && w.date >= start);
    const vol = ws.reduce((a, w) => a + Calc.workoutVolume(w), 0);
    const scores = [];
    for (let i = 0; i < 7; i++) { const d = Calc.dayTotals(s.meals[Dates.add(today, -i)]); if (d.score != null) scores.push(d.score); }
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const focus = s.focus.filter(f => f.date >= start).reduce((a, f) => a + f.minutes, 0);
    const tile = (icon, label, value, sub) => `<div class="stat-tile"><span class="stat-icon">${UI.icon(icon, 18)}</span><small>${label}</small><b>${value}</b><span class="muted small">${sub}</span></div>`;
    return `<section class="week-strip">
      <h2 class="section-title">Last 7 days</h2>
      <div class="stat-grid">
        ${tile('dumbbell', 'Workouts', ws.length + ' <em>/ ' + s.user.gymDays + '</em>', 'planned per week')}
        ${tile('bolt', 'Weight lifted', UI.num(vol) + ' <em>kg</em>', 'total volume')}
        ${tile('meal', 'Avg meal score', avg + ' <em>/100</em>', avg >= 75 ? 'Good' : avg >= 50 ? 'Okay' : 'Needs work')}
        ${tile('clock', 'Focus time', UI.mins(focus), 'deep work')}
      </div>
    </section>`;
  }
};

Actions.homeToggleTask = el => {
  const t = Store.state.tasks.find(x => x.id === el.dataset.id);
  if (!t) return;
  t.status = t.status === 'done' ? 'open' : 'done';
  Store.save();
  App.refresh();
};
Actions.homeAddTask = form => {
  const title = form.elements.title.value.trim();
  if (!title) return;
  Store.state.tasks.push({ id: uid(), date: Dates.today(), title, tag: 'Personal', status: 'open', auto: null, created: Date.now() });
  Store.save();
  UI.toast('Task added');
  App.refresh();
};

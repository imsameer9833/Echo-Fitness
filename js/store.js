/* =========================================================
   ECHO — store.js
   One profile, one place: everything is saved in the browser
   (localStorage), so the site works without a server.
   Also creates realistic sample history for the demo.
   ========================================================= */

const Dates = {
  key(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },
  today() { return Dates.key(new Date()); },
  toDate(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); },
  add(key, n) { const d = Dates.toDate(key); d.setDate(d.getDate() + n); return Dates.key(d); },
  diff(a, b) { return Math.round((Dates.toDate(a) - Dates.toDate(b)) / 86400000); },
  label(key, opts) {
    const t = Dates.today();
    if (key === t) return 'Today';
    if (key === Dates.add(t, -1)) return 'Yesterday';
    return Dates.toDate(key).toLocaleDateString('en-IN', opts || { weekday: 'short', day: 'numeric', month: 'short' });
  },
  short(key) { return Dates.toDate(key).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); },
  weekday(key) { return Dates.toDate(key).toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(); },
  dayNum(key) { return Dates.toDate(key).getDate(); },
  long(d) { return (d || new Date()).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }); },
  time(d) { return (d || new Date()).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }); }
};

const uid = () => Math.random().toString(36).slice(2, 10);

const Store = {
  KEY: 'echo-life-os-v1',
  state: null,
  memoryOnly: false,

  load() {
    try {
      const raw = window.localStorage.getItem(Store.KEY);
      Store.state = raw ? JSON.parse(raw) : Store.blank();
    } catch (e) {
      Store.memoryOnly = true;
      Store.state = Store.blank();
    }
    if (Store.state.demo && Store.state.seedDay && Store.state.seedDay !== Dates.today()) Store.shiftDemo();
    return Store.state;
  },
  save() {
    if (Store.memoryOnly) return;
    try { window.localStorage.setItem(Store.KEY, JSON.stringify(Store.state)); } catch (e) { Store.memoryOnly = true; }
  },
  blank() {
    return { user: null, workouts: [], draft: null, meals: {}, tasks: [], focus: [], chat: [], timer: null, demo: false, seedDay: null };
  },

  /* Default profile for "continue as guest" */
  guestUser(name, email) {
    return { name: name || 'Guest', email: email || '', gender: 'male', age: 24, height: 175, weight: 72, goal: 'maintain', work: 'sitting', gymDays: 4, split: ['Chest + Back', 'Legs + Abs', 'Arms', 'Shoulders'] };
  },

  /* ---------- Sample history so every screen has data ---------- */
  seedDemo() {
    const s = Store.state;
    const today = Dates.today();
    const rnd = Store.rng(7);
    s.workouts = []; s.meals = {}; s.tasks = []; s.focus = []; s.chat = []; s.draft = null; s.timer = null;
    const splits = Object.keys(DEMO_TEMPLATES);

    // 8 weeks of training, 4 days a week, weights slowly going up
    const trainDays = [];
    for (let ago = 56; ago >= 1; ago--) { if ([1, 3, 4, 6].includes(ago % 7)) trainDays.push(ago); }
    trainDays.forEach((ago, k) => {
      const split = splits[(k + (4 - (trainDays.length % 4))) % 4];
      const week = Math.floor((56 - ago) / 7);
      const ex = DEMO_TEMPLATES[split].map(([name, kg, reps]) => {
        const grow = 1 + week * 0.016 + (rnd() - 0.5) * 0.03;
        const top = Store.round25(kg * grow);
        const nSets = week >= 5 ? 4 : 3;
        const sets = [];
        for (let i = 0; i < nSets; i++) {
          const w = i === nSets - 1 ? top : Store.round25(top * (0.88 + i * 0.05));
          sets.push({ kg: w, reps: Math.max(4, reps + (i === 0 ? 2 : 0) - (i === nSets - 1 ? 1 : 0)), done: true });
        }
        return { id: uid(), name, sets };
      });
      s.workouts.push({ id: uid(), date: Dates.add(today, -ago), split, rest: false, exercises: ex });
    });
    // Mark the rest days of the last week so history looks complete
    [2, 5, 7].forEach(ago => s.workouts.push({ id: uid(), date: Dates.add(today, -ago), split: 'Rest day', rest: true, exercises: [] }));

    // 13 days of meals + today's breakfast, analysed by the real engine
    const near = { good: 'okay', okay: rnd() < 0.5 ? 'good' : 'poor', poor: 'okay' };
    for (let ago = 13; ago >= 1; ago--) {
      const day = Dates.add(today, -ago), quality = DEMO_DAYS[13 - ago];
      s.meals[day] = {};
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(type => {
        if (type === 'snacks' && rnd() < 0.2) return;
        const q = rnd() < 0.75 ? quality : near[quality];
        const opts = DEMO_MEALS[q][type];
        const text = opts[Math.floor(rnd() * opts.length)];
        s.meals[day][type] = Object.assign(Calc.analyseMeal(text, type, s.user), { savedAt: day });
      });
    }
    s.meals[today] = { breakfast: Object.assign(Calc.analyseMeal('poha and 1 cup tea', 'breakfast', s.user), { savedAt: today }) };

    // Today's tasks
    const t = (title, tag, status, auto) => ({ id: uid(), date: today, title, tag, status, auto: auto || null, created: Date.now() });
    s.tasks = [
      t('Revise DBMS notes', 'Study', 'open'),
      t((s.user.split && s.user.split[0]) ? s.user.split[0] + ' workout' : 'Workout', 'Fitness', 'open', 'workout'),
      t('Read 20 pages', 'Personal', 'open'),
      t('Log lunch', 'Meal', 'open', 'meal:lunch'),
      t('Attend class', 'Study', 'done'),
      t('Log breakfast', 'Meal', 'done', 'meal:breakfast'),
      t('Morning run', 'Fitness', 'skipped')
    ];

    // Focus sessions: today + the last week
    s.focus.push({ id: uid(), date: today, time: '9:30 am', minutes: 45, title: 'Assignment draft', note: 'Finished intro and outline' });
    s.focus.push({ id: uid(), date: today, time: '11:15 am', minutes: 30, title: 'Revise DBMS notes', note: 'Units 1 and 2 done, unit 3 left' });
    const topics = ['DBMS revision', 'Project report', 'Maths practice', 'Coding practice', 'Reading'];
    for (let ago = 1; ago <= 6; ago++) {
      const n = Math.floor(rnd() * 3) + 1;
      for (let i = 0; i < n; i++) s.focus.push({ id: uid(), date: Dates.add(today, -ago), time: (9 + i * 2) + ':00 am', minutes: [25, 45, 30][Math.floor(rnd() * 3)], title: topics[Math.floor(rnd() * topics.length)], note: '' });
    }

    s.demo = true;
    s.seedDay = today;
    Store.save();
  },

  /* Keep the demo looking "live": move every date forward to today */
  shiftDemo() {
    const s = Store.state;
    const n = Dates.diff(Dates.today(), s.seedDay);
    if (n <= 0) return;
    s.workouts.forEach(w => { w.date = Dates.add(w.date, n); });
    const meals = {};
    Object.keys(s.meals).forEach(k => { meals[Dates.add(k, n)] = s.meals[k]; });
    s.meals = meals;
    s.tasks.forEach(t => { t.date = Dates.add(t.date, n); });
    s.focus.forEach(f => { f.date = Dates.add(f.date, n); });
    if (s.draft) s.draft.date = Dates.add(s.draft.date, n);
    s.seedDay = Dates.today();
    Store.save();
  },

  clearHistory() {
    const s = Store.state;
    s.workouts = []; s.meals = {}; s.tasks = []; s.focus = []; s.chat = []; s.draft = null; s.timer = null;
    s.demo = false; s.seedDay = null;
    Store.save();
  },
  logout() { Store.state = Store.blank(); Store.save(); },

  /* ---------- helpers ---------- */
  todayTasks() { const d = Dates.today(); return Store.state.tasks.filter(t => t.date === d); },
  todayMeals() { return Store.state.meals[Dates.today()] || {}; },
  todayWorkout() { const d = Dates.today(); return Store.state.workouts.find(w => w.date === d); },
  todayFocusMinutes() { const d = Dates.today(); return Store.state.focus.filter(f => f.date === d).reduce((a, f) => a + f.minutes, 0); },
  completeAuto(key) {
    Store.todayTasks().forEach(t => { if (t.auto === key && t.status !== 'done') t.status = 'done'; });
  },
  /* Next split in the user's rotation, after the last one trained */
  suggestedSplit() {
    const split = Store.state.user.split || [];
    if (!split.length) return null;
    const last = Store.state.workouts.filter(w => !w.rest && w.date < Dates.today()).sort((a, b) => b.date.localeCompare(a.date))[0];
    const i = last ? split.indexOf(last.split) : -1;
    return split[(i + 1) % split.length];
  },
  rng(seed) { let a = seed; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  round25(x) { return Math.round(x / 2.5) * 2.5; }
};

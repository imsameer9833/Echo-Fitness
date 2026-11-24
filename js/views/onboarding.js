/* =========================================================
   ECHO — views/onboarding.js
   Welcome (login), profile setup and the profile page.
   ========================================================= */

const Profile = {
  /* The form is shared by first-time setup and the profile page */
  form(pf) {
    const seg = (field, opts) => `<div class="seg seg-3" role="group">${opts.map(([v, l]) =>
      `<button type="button" class="seg-item${pf[field] === v ? ' on' : ''}" aria-pressed="${pf[field] === v}" data-action="pfSet" data-field="${field}" data-value="${v}">${l}</button>`).join('')}</div>`;
    const work = [['sitting', 'Mostly sitting', 'Desk job, student, driver'], ['feet', 'On my feet', 'Teacher, retail, nurse'], ['physical', 'Physical work', 'Labour, delivery, farming']];
    const num = (name, label, unit, min, max) => `<label class="field"><span>${label}</span>
      <span class="input-unit"><input type="number" inputmode="decimal" name="${name}" value="${UI.esc(pf[name])}" min="${min}" max="${max}" data-input="pfNum" required><em>${unit}</em></span></label>`;
    return `
      <div class="field"><span>Gender</span>${seg('gender', [['male', 'Male'], ['female', 'Female'], ['other', 'Other']])}</div>
      <div class="grid-3">${num('age', 'Age', 'yrs', 10, 100)}${num('height', 'Height', 'cm', 100, 250)}${num('weight', 'Weight', 'kg', 25, 300)}</div>
      <div class="field"><span>Goal</span>${seg('goal', [['lose', 'Lose fat'], ['maintain', 'Maintain'], ['build', 'Build muscle']])}</div>
      <div class="field"><span>What does your day look like?</span>
        <div class="radio-cards">${work.map(([v, t, d]) => `
          <button type="button" class="radio-card${pf.work === v ? ' on' : ''}" aria-pressed="${pf.work === v}" data-action="pfSet" data-field="work" data-value="${v}">
            <span class="radio-dot"></span><span><b>${t}</b><small>${d}</small></span>
          </button>`).join('')}</div>
      </div>
      <div class="stepper-row">
        <span>Gym days per week</span>
        <div class="stepper">
          <button type="button" class="icon-btn" aria-label="Fewer gym days" data-action="pfDays" data-step="-1">−</button>
          <b id="pf-days">${pf.gymDays}</b>
          <button type="button" class="icon-btn" aria-label="More gym days" data-action="pfDays" data-step="1">+</button>
        </div>
      </div>
      <div id="pf-target">${Profile.preview(pf)}</div>`;
  },
  preview(pf) {
    const t = Calc.targets(pf);
    return `<div class="target-card">
      <div><small>Your daily target</small><div class="target-kcal">${UI.num(t.kcal)} <em>kcal</em></div></div>
      <div class="target-macros">
        <span><b class="c-lime">${t.protein}g</b><small>Protein</small></span>
        <span><b class="c-sky">${t.carbs}g</b><small>Carbs</small></span>
        <span><b class="c-amber">${t.fat}g</b><small>Fat</small></span>
      </div>
    </div>`;
  },
  draft() {
    if (!App.ui.pf) {
      const u = Store.state.user || Store.guestUser(App.ui.newName, App.ui.newEmail);
      App.ui.pf = { gender: u.gender, age: u.age, height: u.height, weight: u.weight, goal: u.goal, work: u.work, gymDays: u.gymDays };
    }
    return App.ui.pf;
  },
  valid(pf) {
    if (!(pf.age >= 10 && pf.age <= 100)) return 'Enter an age between 10 and 100';
    if (!(pf.height >= 100 && pf.height <= 250)) return 'Enter a height between 100 and 250 cm';
    if (!(pf.weight >= 25 && pf.weight <= 300)) return 'Enter a weight between 25 and 300 kg';
    return null;
  }
};

/* ---------- Welcome / login ---------- */
Views.welcome = {
  render() {
    return `<div class="onboard">
      ${Views.welcome.hero()}
      <section class="onboard-panel">
        <form class="panel-card" data-submit="welcome" novalidate>
          <h2>Welcome to ECHO</h2>
          <p class="muted">No password needed. Just tell us your name.</p>
          <label class="field"><span>Your name</span><input name="name" type="text" placeholder="e.g. Rohan" autocomplete="given-name" required></label>
          <label class="field"><span>Email (optional)</span><input name="email" type="email" placeholder="you@example.com" autocomplete="email"></label>
          <button class="btn btn-primary btn-lg" type="submit">Get started ${UI.icon('arrowRight', 20, 2.2)}</button>
          <button class="btn btn-text" type="button" data-action="guest">Skip and continue as guest</button>
        </form>
      </section>
    </div>`;
  },
  hero() {
    return `<section class="onboard-hero">
      <div class="brand brand-lg"><span class="logo">${UI.icon('echo', 26, 2.4)}</span><span class="wordmark">ECHO</span></div>
      <h1 class="hero-title">One place.<br><span class="c-lime">Your entire life.</span></h1>
      <p class="hero-sub">Workouts, meals, tasks and an AI coach, all connected through one profile.</p>
      <ul class="chip-row">
        <li class="chip-static">${UI.icon('dumbbell', 16)}Fitness</li>
        <li class="chip-static">${UI.icon('meal', 16)}Meal</li>
        <li class="chip-static">${UI.icon('echo', 16)}ECHO AI</li>
        <li class="chip-static">${UI.icon('tasks', 16)}Tasks</li>
      </ul>
      <div class="float-cards" aria-hidden="true">
        <div class="float-card f1">${UI.icon('trophy', 18)}<div><small>New best</small><b>Bench Press 65 kg</b></div></div>
        <div class="float-card f2">${UI.icon('meal', 18)}<div><small>Lunch score</small><b>74 / 100</b></div></div>
        <div class="float-card f3">${UI.icon('clock', 18)}<div><small>Focused today</small><b>1h 15m</b></div></div>
      </div>
    </section>`;
  }
};

Actions.welcome = form => {
  const name = form.elements.name.value.trim();
  if (!name) { UI.toast('Please enter your name', 'warn'); form.elements.name.focus(); return; }
  App.ui.newName = name.slice(0, 30);
  App.ui.newEmail = form.elements.email.value.trim();
  App.ui.pf = null;
  App.go('#setup');
};
Actions.guest = () => {
  Store.state.user = Store.guestUser('Guest');
  Store.seedDemo();
  UI.toast('Welcome! Sample data is loaded so you can explore');
  App.go('#home');
};

/* ---------- First-time profile setup ---------- */
Views.setup = {
  render() {
    if (!App.ui.newName) App.ui.newName = 'Guest';
    const pf = Profile.draft();
    return `<div class="onboard">
      <section class="onboard-hero">
        <div class="brand brand-lg"><span class="logo">${UI.icon('echo', 26, 2.4)}</span><span class="wordmark">ECHO</span></div>
        <h1 class="hero-title">Hi ${UI.esc(App.ui.newName)},<br><span class="c-lime">let's set you up.</span></h1>
        <p class="hero-sub">ECHO uses these details to work out how much you should eat each day.</p>
        <ol class="how-list">
          <li><b>1</b><span>Your body uses energy even at rest (BMR), from gender, age, height and weight</span></li>
          <li><b>2</b><span>Your type of work and gym days raise it</span></li>
          <li><b>3</b><span>Your goal adds or removes a little</span></li>
          <li><b>4</b><span>Protein 2 g per kg, fat 25%, the rest from carbs</span></li>
        </ol>
      </section>
      <section class="onboard-panel">
        <form class="panel-card" data-submit="setupSave" novalidate>
          <div class="steps"><a href="#welcome" class="icon-btn" aria-label="Back" data-action="backToWelcome">${UI.icon('chevronLeft', 20)}</a><span class="step-bar on"></span><span class="step-bar on"></span><small>Step 2 of 2</small></div>
          <h2>Tell ECHO about you</h2>
          <div id="pf-form">${Profile.form(pf)}</div>
          <button class="btn btn-primary btn-lg" type="submit">Save and continue</button>
        </form>
      </section>
    </div>`;
  }
};
Actions.backToWelcome = () => { Store.state.user = null; App.go('#welcome'); };

Actions.setupSave = () => {
  const pf = Profile.draft();
  const err = Profile.valid(pf);
  if (err) { UI.toast(err, 'warn'); return; }
  Store.state.user = Object.assign(Store.guestUser(App.ui.newName, App.ui.newEmail), pf);
  App.ui.pf = null;
  Store.seedDemo();
  UI.toast('Welcome to ECHO, ' + Store.state.user.name + '!');
  App.go('#home');
};

/* Profile form controls */
Actions.pfSet = el => {
  const pf = Profile.draft();
  pf[el.dataset.field] = el.dataset.value;
  document.getElementById('pf-form').innerHTML = Profile.form(pf);
};
Actions.pfDays = el => {
  const pf = Profile.draft();
  pf.gymDays = Math.max(0, Math.min(7, Number(pf.gymDays) + Number(el.dataset.step)));
  document.getElementById('pf-days').textContent = pf.gymDays;
  document.getElementById('pf-target').innerHTML = Profile.preview(pf);
};
Inputs.pfNum = el => {
  const pf = Profile.draft();
  pf[el.name] = el.value === '' ? '' : Number(el.value);
  if (!Profile.valid(pf)) document.getElementById('pf-target').innerHTML = Profile.preview(pf);
};

/* ---------- Profile page (inside the app) ---------- */
Views.profile = {
  render() {
    const u = Store.state.user;
    const pf = Profile.draft();
    return `${App.header('Your profile', '')}
    <div class="grid-main">
      <form class="card form-card" data-submit="profileSave" novalidate>
        <div class="field"><span>Name</span><input name="name" value="${UI.esc(u.name)}" maxlength="30" data-input="pfName"></div>
        <div id="pf-form">${Profile.form(pf)}</div>
        <button class="btn btn-primary btn-lg" type="submit">Save changes</button>
      </form>
      <div class="stack">
        <section class="card">
          <h2 class="card-title">How your target is worked out</h2>
          ${Views.profile.explain(pf)}
        </section>
        <section class="card">
          <h2 class="card-title">Your data</h2>
          <p class="muted small">Everything is saved in this browser on this device. ${Store.state.demo ? 'Sample history is loaded for the demo.' : ''}</p>
          <div class="btn-col">
            <button class="btn btn-ghost" type="button" data-action="reloadDemo">${UI.icon('repeat', 18)}Reload sample data</button>
            <button class="btn btn-ghost" type="button" data-action="clearData">${UI.icon('trash', 18)}Start fresh (clear history)</button>
            <button class="btn btn-ghost" type="button" data-action="logout">${UI.icon('logout', 18)}Log out</button>
          </div>
        </section>
      </div>
    </div>`;
  },
  explain(pf) {
    const t = Calc.targets(pf);
    const goal = { lose: '− 400', maintain: '+ 0', build: '+ 250' }[pf.goal];
    return `<ol class="calc-steps">
      <li><span>Energy at rest (BMR)</span><b>${UI.num(t.bmr)} kcal</b></li>
      <li><span>× activity (${pf.work === 'sitting' ? 'sitting' : pf.work === 'feet' ? 'on feet' : 'physical'} + ${pf.gymDays} gym days)</span><b>× ${t.factor.toFixed(2)}</b></li>
      <li><span>Goal adjustment</span><b>${goal} kcal</b></li>
      <li class="total"><span>Daily target</span><b>${UI.num(t.kcal)} kcal</b></li>
      <li><span>Protein · Carbs · Fat</span><b>${t.protein} · ${t.carbs} · ${t.fat} g</b></li>
    </ol>`;
  }
};
Inputs.pfName = () => { };
Actions.profileSave = form => {
  const pf = Profile.draft();
  const err = Profile.valid(pf);
  if (err) { UI.toast(err, 'warn'); return; }
  const name = form.elements.name.value.trim() || Store.state.user.name;
  Object.assign(Store.state.user, pf, { name: name.slice(0, 30) });
  App.ui.pf = null;
  Store.save();
  UI.toast('Profile saved. Targets updated');
  App.refresh();
};
Actions.reloadDemo = async () => {
  const ok = await UI.dialog({ title: 'Reload sample data?', text: 'This replaces your workouts, meals, tasks and focus history with fresh sample data.', ok: 'Reload', danger: true });
  if (!ok) return;
  Store.seedDemo(); App.ui = {}; UI.toast('Sample data reloaded'); App.go('#home');
};
Actions.clearData = async () => {
  const ok = await UI.dialog({ title: 'Start fresh?', text: 'All workouts, meals, tasks, focus sessions and chat will be deleted. Your profile stays.', ok: 'Delete history', danger: true });
  if (!ok) return;
  Store.clearHistory(); App.ui = {}; UI.toast('History cleared'); App.go('#home');
};
Actions.logout = async () => {
  const ok = await UI.dialog({ title: 'Log out?', text: 'This removes your profile and data from this browser.', ok: 'Log out', danger: true });
  if (!ok) return;
  Store.logout(); App.ui = {}; App.go('#welcome');
};

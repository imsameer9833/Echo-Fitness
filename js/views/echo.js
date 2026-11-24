/* =========================================================
   ECHO — views/echo.js
   ECHO AI: chat + voice assistant. It reads your own data
   (meals, workouts, tasks, focus) and answers with numbers
   about YOU. Voice uses the browser's speech recognition
   and replies are read out loud.
   (Real AI model can be plugged into Brain.reply later.)
   ========================================================= */

const Brain = {
  ctx() {
    const s = Store.state, u = s.user, t = Calc.targets(u), d = Calc.dayTotals(Store.todayMeals());
    return { s, u, t, d, leftK: t.kcal - d.kcal, leftP: Math.max(0, t.protein - d.p) };
  },

  reply(raw) {
    const q = ' ' + raw.toLowerCase().replace(/[?!.]/g, ' ') + ' ';
    const has = re => re.test(q);
    if (has(/\b(hi|hello|hey|namaste|hola|yo|good (morning|evening|afternoon))\b/) && q.trim().split(/\s+/).length <= 4) return Brain.greet();
    if (has(/\b(thank|thanks|thx|great|awesome|nice)\b/) && q.trim().split(/\s+/).length <= 4) return Brain.out('<p>Anytime! Keep showing up. The small days add up.</p>');
    if (has(/\b(what can you do|help|who are you|features)\b/)) return Brain.help();
    if (has(/\b(rate|score)\b|\b(calories?|kcal) in\b/) || (has(/\b(healthy|good|bad)\b/) && has(/\b(breakfast|lunch|dinner|meal|snack|food)\b/))) return Brain.rate(raw);
    if (has(/\b(split|routine|program|programme)\b/) || has(/\d\s*-?\s*days?\b/) || (has(/\bplan\b/) && has(/\b(workout|gym|training|exercise)/))) return Brain.splitPlan(q);
    if (has(/\b(stuck|plateau|not (progress|improv|increas)|stall|can'?t increase|improve my|increase my)\b/)) return Brain.plateau(q);
    if (has(/\b(progress|how am i doing|this week|report|summary|overview|stats)\b/)) return Brain.progress();
    if (has(/\b(plan my day|to ?do|tasks?|what('?s| is) left|pending)\b/)) return Brain.tasks();
    if (has(/\b(focus|study|concentrat|pomodoro|distract|procrastinat)\b/)) return Brain.focus();
    if (has(/\b(calorie|calories|kcal|macro|macros|remaining|left today|how much (more|should))\b/)) return Brain.calories();
    if (has(/\b(eat|food|hungry|dinner|lunch|breakfast|snack|protein|post[- ]?workout|pre[- ]?workout|diet|meal)\b/)) return Brain.food(q);
    if (has(/\b(lose|loss|fat|cut|slim|weight|gain|bulk)\b/)) return Brain.weight(q);
    if (has(/\b(water|hydrat|drink)\b/)) return Brain.water();
    if (has(/\b(sleep|tired|rest|recover)\b/)) return Brain.sleep();
    if (has(/\bbmi\b/)) return Brain.bmi();
    return Brain.fallback();
  },

  out(html, extra) { return { html, speech: (extra && extra.speech) || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }; },
  btn(label, action, data) { return `<button class="btn btn-soft btn-sm" data-action="${action}" ${Object.entries(data || {}).map(([k, v]) => `data-${k}="${UI.esc(v)}"`).join(' ')}>${label}</button>`; },

  greet() {
    const { s, u, t, d } = Brain.ctx();
    const tasks = Store.todayTasks(), done = tasks.filter(x => x.status === 'done').length;
    const w = Store.todayWorkout();
    return Brain.out(`<p>Hi ${UI.esc(u.name)}! Here's your day so far:</p>
      <ul class="echo-list"><li><b>${done} of ${tasks.length}</b> tasks done</li>
      <li><b>${UI.num(d.kcal)}</b> of ${UI.num(t.kcal)} kcal eaten, <b>${d.p} g</b> protein</li>
      <li>Workout: <b>${w ? (w.rest ? 'rest day' : UI.esc(w.split) + ' done') : UI.esc(Store.suggestedSplit() || 'not planned') + ' (not started)'}</b></li></ul>
      <p>What do you want help with?</p>`);
  },

  help() {
    return Brain.out(`<p>I'm ECHO, your personal coach. I can see your workouts, meals and tasks, so my answers are about <b>you</b>. Try:</p>
      <ul class="echo-list"><li>"What should I eat after my workout?"</li><li>"Rate 2 samosa and a coke"</li><li>"Plan a 4-day split"</li><li>"Why is my bench stuck?"</li><li>"How am I doing this week?"</li><li>"Plan my day"</li></ul>`);
  },

  food(q) {
    const { t, d, leftK, leftP } = Brain.ctx();
    const post = /workout|gym|training|post/.test(q);
    const combos = ['Paneer bhurji and 2 chapati', 'Whey protein and 1 banana', '3 eggs omelette and 1 bowl rice', 'grilled chicken 150g and salad', 'soya chunks and 1 bowl curd', 'dal, 2 chapati and curd', 'greek yogurt and handful almonds', 'sprouts chaat and 1 glass milk'];
    const opts = combos.map(c => { const r = Calc.analyseMeal(c, 'dinner', Store.state.user); return { text: c, k: r.totals.kcal, p: Math.round(r.totals.p) }; })
      .filter(o => leftK <= 0 ? o.k < 350 : o.k <= Math.max(400, leftK + 150))
      .sort((a, b) => (b.p / b.k) - (a.p / a.k)).slice(0, 3);
    const intro = leftK > 0
      ? `You've eaten <b>${UI.num(d.kcal)} kcal</b> and <b>${d.p} g protein</b> today. That leaves about <b>${UI.num(leftK)} kcal</b> and <b>${leftP} g protein</b>.`
      : `You're already at <b>${UI.num(d.kcal)} kcal</b> (target ${UI.num(t.kcal)}), so keep it light.`;
    return Brain.out(`<p>${intro} ${post ? 'After training, aim for 25–40 g protein plus some carbs:' : 'Good options for you right now:'}</p>
      <ul class="echo-options">${opts.map(o => `<li><span>${UI.esc(Calc.cap(o.text))}</span><b>${o.p} g protein · ${o.k} kcal</b></li>`).join('')}</ul>
      <div class="bubble-actions">${Brain.btn('Log a meal', 'echoGo', { to: '#meal' })}</div>`);
  },

  rate(raw) {
    const s = Store.state, meals = Store.todayMeals();
    const typeWord = (raw.toLowerCase().match(/breakfast|lunch|dinner|snack/) || [])[0];
    const cleaned = raw.replace(/\b(rate|score|my|how|healthy|good|bad|is|was|it|this|meal|please|can you|the|of|for me|calories|calorie|kcal|in|many|much)\b/gi, ' ');
    const foods = Calc.findFoods(' ' + cleaned.toLowerCase() + ' ');
    let r, label;
    if (foods.length) {
      const type = typeWord ? (typeWord === 'snack' ? 'snacks' : typeWord) : Views.meal.current();
      r = Calc.analyseMeal(cleaned, type, s.user); label = 'That meal';
    } else {
      const key = typeWord ? (typeWord === 'snack' ? 'snacks' : typeWord) : ['snacks', 'dinner', 'lunch', 'breakfast'].find(k => meals[k]);
      r = key && meals[key];
      label = key ? 'Your ' + key : '';
      if (!r) return Brain.out(`<p>I don't see that meal logged today. Tell me what you ate, like <i>"rate 2 chapati, dal and rice"</i>, or log it in Meal.</p><div class="bubble-actions">${Brain.btn('Open Meal', 'echoGo', { to: '#meal' })}</div>`);
    }
    const col = UI.scoreColor(r.score);
    return Brain.out(`<p>${label} scores <b class="c-${col}">${r.score}/100 (${r.label})</b>: ${UI.num(r.totals.kcal)} kcal, ${Math.round(r.totals.p)} g protein, ${Math.round(r.totals.c)} g carbs, ${Math.round(r.totals.f)} g fat.</p><p>${UI.esc(r.tip)}</p>`);
  },

  splitPlan(q) {
    const u = Store.state.user;
    const m = q.match(/(\d)\s*-?\s*(day|days)/);
    const n = Math.max(1, Math.min(6, m ? Number(m[1]) : (Number(u.gymDays) || 4)));
    const plans = {
      1: ['Full Body'], 2: ['Upper Body', 'Lower Body + Abs'], 3: ['Push', 'Pull', 'Legs + Abs'],
      4: ['Chest + Back', 'Legs + Abs', 'Arms', 'Shoulders'], 5: ['Chest', 'Back', 'Legs + Abs', 'Shoulders', 'Arms'],
      6: ['Push', 'Pull', 'Legs + Abs', 'Push', 'Pull', 'Legs + Abs']
    };
    const days = plans[n];
    const unique = [...new Set(days)];
    return Brain.out(`<p>Here's a <b>${n}-day split</b> built for your goal (${{ lose: 'losing fat', maintain: 'staying fit', build: 'building muscle' }[u.goal]}). Do 3 sets of 8–12 reps and add weight when you hit 12 easily.</p>
      <ol class="echo-plan">${days.map((d, i) => `<li><b>Day ${i + 1} · ${d}</b><span>${Calc.suggestions(d).slice(0, 4).join(', ')}</span></li>`).join('')}</ol>
      <div class="bubble-actions">${Brain.btn('Use this as my split', 'echoUseSplit', { split: unique.join('|') })}</div>`,
      { speech: `Here's a ${n} day split: ${days.join(', ')}. Three sets of 8 to 12 reps.` });
  },

  plateau(q) {
    const s = Store.state;
    const names = [...new Set(s.workouts.flatMap(w => w.exercises.map(e => e.name)))];
    let name = names.find(n => q.includes(n.toLowerCase())) || names.find(n => n.toLowerCase().split(' ').some(w => w.length > 3 && q.includes(w))) || 'Bench Press';
    const hist = s.workouts.filter(w => !w.rest && w.exercises.some(e => e.name === name)).sort((a, b) => a.date.localeCompare(b.date)).slice(-4)
      .map(w => { const ex = w.exercises.find(e => e.name === name); return { date: w.date, kg: Math.max(...ex.sets.map(x => Number(x.kg) || 0)) }; });
    const line = hist.length ? hist.map(h => `${Dates.short(h.date)}: <b>${UI.kg(h.kg)} kg</b>`).join(' → ') : 'No sessions logged yet.';
    const flat = hist.length >= 3 && hist[hist.length - 1].kg <= hist[0].kg;
    const { t, d } = Brain.ctx();
    return Brain.out(`<p>Your last ${hist.length || ''} ${UI.esc(name)} sessions: ${line}</p>
      <p>${flat ? "It's been flat, so let's break through:" : "You're still moving up. To keep it going:"}</p>
      <ul class="echo-list"><li><b>Add reps first</b>: when you get 3×10, add 2.5 kg and drop back to 3×6–8.</li>
      <li><b>Rest 2–3 min</b> between heavy sets.</li>
      <li><b>Eat enough protein</b>: aim for ${t.protein} g a day (today ${d.p} g).</li>
      <li><b>Sleep 7–8 hours</b>. Strength is built while you recover.</li>
      ${flat ? '<li><b>Deload one week</b>: use 10% less weight, then build back up.</li>' : ''}</ul>`);
  },

  progress() {
    const s = Store.state, today = Dates.today();
    const vol = (from, to) => s.workouts.filter(w => !w.rest && w.date >= from && w.date <= to).reduce((a, w) => a + Calc.workoutVolume(w), 0);
    const thisW = vol(Dates.add(today, -6), today), lastW = vol(Dates.add(today, -13), Dates.add(today, -7));
    const count = s.workouts.filter(w => !w.rest && w.date >= Dates.add(today, -6)).length;
    const pct = lastW ? Math.round((thisW - lastW) / lastW * 100) : 0;
    const scores = []; for (let i = 0; i < 7; i++) { const dt = Calc.dayTotals(s.meals[Dates.add(today, -i)]); if (dt.score != null) scores.push(dt.score); }
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const focus = s.focus.filter(f => f.date >= Dates.add(today, -6)).reduce((a, f) => a + f.minutes, 0);
    return Brain.out(`<p>Your last 7 days:</p>
      <ul class="echo-list"><li><b>${count}</b> workouts (plan: ${s.user.gymDays})</li>
      <li><b>${UI.num(thisW)} kg</b> lifted, <b class="${pct >= 0 ? 'c-lime' : 'c-coral'}">${pct >= 0 ? '+' : ''}${pct}%</b> vs the week before</li>
      <li>Average meal score <b>${avg}/100</b></li><li><b>${UI.mins(focus)}</b> of focused work</li></ul>
      <p>${pct >= 0 && avg >= 70 ? 'Strong week. Keep the same rhythm.' : avg < 70 ? 'Training is fine. Food is the easy win: more protein, less fried stuff.' : 'Volume dipped a little. Try to hit all planned sessions this week.'}</p>
      <div class="bubble-actions">${Brain.btn('See fitness graph', 'echoGo', { to: '#fitness-progress' })}${Brain.btn('Meal history', 'echoGo', { to: '#meal-history' })}</div>`);
  },

  tasks() {
    const open = Store.todayTasks().filter(t => t.status === 'open');
    if (!open.length) return Brain.out('<p>Everything on today\'s list is done or skipped. Nice work! Want to add something for tomorrow?</p>');
    const study = open.find(t => /study|work/i.test(t.tag)) || open[0];
    return Brain.out(`<p>You have <b>${open.length}</b> things left today. Suggested order:</p>
      <ol class="echo-plan">${open.map(t => `<li><b>${UI.esc(t.title)}</b><span>${UI.esc(t.tag)}</span></li>`).join('')}</ol>
      <p>Start with a 25-minute focus session on <b>${UI.esc(study.title)}</b>. It's easier once you've started.</p>
      <div class="bubble-actions">${Brain.btn('Start focus timer', 'echoGo', { to: '#tasks-focus' })}</div>`);
  },

  focus() {
    const m = Store.todayFocusMinutes();
    return Brain.out(`<p>You've focused for <b>${UI.mins(m)}</b> today. Try the 25/5 method: 25 minutes on one task with your phone away, then a 5-minute break. After 4 rounds, take a longer break.</p>
      <div class="bubble-actions">${Brain.btn('Open focus timer', 'echoGo', { to: '#tasks-focus' })}</div>`);
  },

  calories() {
    const { t, d, leftK } = Brain.ctx();
    return Brain.out(`<p>Today vs your target:</p>
      <ul class="echo-options"><li><span>Calories</span><b>${UI.num(d.kcal)} / ${UI.num(t.kcal)} kcal</b></li>
      <li><span>Protein</span><b>${d.p} / ${t.protein} g</b></li><li><span>Carbs</span><b>${d.c} / ${t.carbs} g</b></li><li><span>Fat</span><b>${d.f} / ${t.fat} g</b></li></ul>
      <p>${leftK > 0 ? `You can still eat about <b>${UI.num(leftK)} kcal</b>. Make protein the priority.` : `You're ${UI.num(-leftK)} kcal over. A walk and a lighter next meal will balance it.`}</p>`);
  },

  weight(q) {
    const u = Store.state.user;
    const base = Calc.targets(Object.assign({}, u, { goal: 'maintain' })).kcal;
    const gain = /gain|bulk|muscle/.test(q);
    return Brain.out(`<p>Your body needs about <b>${UI.num(base)} kcal</b> a day to stay at ${u.weight} kg.</p>
      <ul class="echo-list">${gain
        ? `<li>To <b>build muscle</b>, eat ~<b>${UI.num(base + 250)} kcal</b> with ${Math.round(u.weight * 2)} g protein</li><li>Expect about 0.25–0.5 kg gain a month. Faster is mostly fat.</li>`
        : `<li>To <b>lose fat</b>, eat ~<b>${UI.num(base - 400)} kcal</b> with ${Math.round(u.weight * 2.2)} g protein</li><li>That's roughly 0.3–0.5 kg a week, slow enough to keep your muscle</li>`}
      <li>Keep lifting so the weight you change is fat, not muscle</li></ul>
      <div class="bubble-actions">${Brain.btn('Change my goal', 'echoGo', { to: '#profile' })}</div>`);
  },

  water() {
    const w = Store.state.user.weight, l = (w * 0.035).toFixed(1);
    return Brain.out(`<p>At ${w} kg, aim for about <b>${l} litres</b> of water a day, plus 0.5 L for each hour of training. Pale yellow urine means you're doing fine.</p>`);
  },
  sleep() {
    return Brain.out('<p>Aim for <b>7–9 hours</b>, at about the same time every night. Sleep is when muscles repair and memory sets, so it helps your lifts <i>and</i> your exams. Avoid screens for 30 minutes before bed.</p>');
  },
  bmi() {
    const u = Store.state.user, bmi = u.weight / Math.pow(u.height / 100, 2);
    const cat = bmi < 18.5 ? 'underweight' : bmi < 23 ? 'in the healthy range for Asian adults' : bmi < 25 ? 'slightly above the Asian healthy range' : 'above the healthy range';
    return Brain.out(`<p>Your BMI is <b>${bmi.toFixed(1)}</b> (${u.weight} kg, ${u.height} cm), which is ${cat}. BMI doesn't know about muscle, so track your waist and strength too.</p>`);
  },
  fallback() {
    return Brain.out(`<p>I'm best at your meals, workouts, plans and tasks. Try one of these:</p>
      <ul class="echo-list"><li>"What should I eat now?"</li><li>"How am I doing this week?"</li><li>"Plan a 3-day split"</li><li>"Rate my lunch"</li></ul>`);
  }
};

const SUGGESTIONS = ['What should I eat after my workout?', 'How am I doing this week?', 'Rate my lunch', 'Plan a 4-day split', 'Why is my bench stuck?', 'Plan my day'];

Views.echo = {
  render() {
    const s = Store.state;
    if (!s.chat.length) s.chat.push({ role: 'echo', html: Views.echo.welcome(), time: Dates.time() });
    const mode = App.ui.echoMode || 'chat';
    const toggle = `<div class="seg seg-sm" role="tablist" aria-label="Input mode">
      <button role="tab" aria-selected="${mode === 'chat'}" class="seg-item${mode === 'chat' ? ' on' : ''}" data-action="echoMode" data-mode="chat">Chat</button>
      <button role="tab" aria-selected="${mode === 'voice'}" class="seg-item${mode === 'voice' ? ' on' : ''}" data-action="echoMode" data-mode="voice">Voice</button></div>`;
    return `${App.header('ECHO AI', toggle)}
    <div class="grid-main echo-grid">
      ${mode === 'voice' ? Views.echo.voice() : Views.echo.chat()}
      ${Views.echo.aside()}
    </div>`;
  },
  welcome() {
    const u = Store.state.user;
    return `<p>Hi ${UI.esc(u.name)}, I'm <b>ECHO</b>. I can see your workouts, meals and tasks, so ask me anything about your day, your training or your food.</p>`;
  },
  chat() {
    const s = Store.state;
    const msgs = s.chat.map(m => `<div class="msg msg-${m.role}">
        ${m.role === 'echo' ? `<span class="msg-avatar">${UI.icon('echo', 16, 2.4)}</span>` : ''}
        <div class="bubble">${m.role === 'user' ? UI.esc(m.text) : m.html}</div>
      </div>`).join('');
    return `<section class="card chat-card">
      <div class="chat-scroll" id="chat-scroll" aria-live="polite">
        ${msgs}
        ${App.ui.typing ? `<div class="msg msg-echo"><span class="msg-avatar">${UI.icon('echo', 16, 2.4)}</span><div class="bubble typing" aria-label="ECHO is typing"><i></i><i></i><i></i></div></div>` : ''}
      </div>
      <div class="suggest-row">${SUGGESTIONS.map(q => `<button class="chip chip-sm" data-action="echoAsk" data-q="${UI.esc(q)}">${UI.esc(q)}</button>`).join('')}</div>
      <form class="composer" data-submit="echoSend">
        <input id="echo-input" name="q" autocomplete="off" placeholder="Ask about meals, workouts, plans…" aria-label="Ask ECHO" maxlength="200">
        <button type="button" class="icon-btn icon-btn-round mic-btn" id="echo-mic" data-action="echoMic" aria-label="Speak your question">${UI.icon('mic', 20)}</button>
        <button type="submit" class="icon-btn icon-btn-round icon-btn-lime" aria-label="Send">${UI.icon('send', 20, 2.4)}</button>
      </form>
    </section>`;
  },
  voice() {
    const v = App.ui.voice || {};
    const last = Store.state.chat.filter(m => m.role === 'echo').slice(-1)[0];
    return `<section class="card voice-card">
      <p class="muted">${v.listening ? 'Listening… speak now' : 'Tap the orb and ask your question'}</p>
      <button class="orb${v.listening ? ' listening' : ''}" data-action="echoVoice" aria-label="${v.listening ? 'Stop listening' : 'Start talking to ECHO'}">
        <span class="orb-ring r1"></span><span class="orb-ring r2"></span><span class="orb-core">${UI.icon('mic', 40, 2)}</span>
      </button>
      <p class="voice-heard">${v.heard ? '“' + UI.esc(v.heard) + '”' : '&nbsp;'}</p>
      ${last ? `<div class="voice-reply"><span class="msg-avatar">${UI.icon('echo', 16, 2.4)}</span><div>${last.html}</div></div>` : ''}
      <label class="switch"><input type="checkbox" data-change="echoSpeak" ${App.ui.speak !== false ? 'checked' : ''}><span></span>Read replies out loud</label>
    </section>`;
  },
  aside() {
    const { t, d } = Brain.ctx();
    const tasks = Store.todayTasks(), w = Store.todayWorkout();
    return `<aside class="stack echo-aside">
      <section class="card">
        <h2 class="card-title">What ECHO can see</h2>
        <ul class="know-list">
          <li>${UI.icon('meal', 18)}<span>Eaten <b>${UI.num(d.kcal)}</b> / ${UI.num(t.kcal)} kcal · ${d.p} g protein</span></li>
          <li>${UI.icon('dumbbell', 18)}<span>${w ? (w.rest ? 'Rest day' : '<b>' + UI.esc(w.split) + '</b> done') : 'Workout not started'}</span></li>
          <li>${UI.icon('tasks', 18)}<span><b>${tasks.filter(x => x.status === 'done').length}</b> of ${tasks.length} tasks done</span></li>
          <li>${UI.icon('clock', 18)}<span><b>${UI.mins(Store.todayFocusMinutes())}</b> focused today</span></li>
        </ul>
      </section>
      <section class="card">
        <h2 class="card-title">Tips</h2>
        <p class="muted small">Use the mic to speak. In Voice mode ECHO answers out loud. Works best in Chrome.</p>
        <button class="btn btn-ghost btn-sm" data-action="echoClear">${UI.icon('trash', 15)}Clear chat</button>
      </section>
    </aside>`;
  },
  after() {
    const el = document.getElementById('chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }
};

/* ---------------- actions ---------------- */
const EchoChat = {
  send(text) {
    text = String(text || '').trim();
    if (!text || App.ui.typing) return;
    const s = Store.state;
    s.chat.push({ role: 'user', text: text.slice(0, 200), time: Dates.time() });
    App.ui.typing = true;
    Store.save(); App.refresh();
    const r = Brain.reply(text);
    setTimeout(() => {
      s.chat.push({ role: 'echo', html: r.html, time: Dates.time() });
      if (s.chat.length > 40) s.chat = s.chat.slice(-40);
      App.ui.typing = false;
      Store.save();
      if (App.parse().route === 'echo') App.refresh();
      if ((App.ui.echoMode === 'voice' && App.ui.speak !== false) || App.ui.speakOnce) Voice.speak(r.speech);
      App.ui.speakOnce = false;
    }, 650 + Math.min(900, r.html.length));
  }
};
Actions.echoSend = form => { const v = form.elements.q.value; form.elements.q.value = ''; EchoChat.send(v); };
Actions.echoAsk = el => EchoChat.send(el.dataset.q);
Actions.echoGo = el => App.go(el.dataset.to);
Actions.echoMode = el => { App.ui.echoMode = el.dataset.mode; Voice.stop(); App.ui.voice = {}; App.refresh(); };
Changes.echoSpeak = el => { App.ui.speak = el.checked; };
Actions.echoUseSplit = el => {
  Store.state.user.split = el.dataset.split.split('|');
  Store.save(); UI.toast('Split saved. Check it in Fitness');
};
Actions.echoClear = () => { Store.state.chat = []; Store.save(); App.refresh(); };
Actions.echoMic = el => {
  const input = document.getElementById('echo-input');
  if (Voice.rec) { Voice.stop(); return; }
  el.classList.add('listening');
  Voice.listen((txt, final) => {
    input.value = txt;
    if (final) { App.ui.speakOnce = true; Voice.stop(); EchoChat.send(txt); input.value = ''; }
  }, () => el.classList.remove('listening'));
};
Actions.echoVoice = () => {
  App.ui.voice = App.ui.voice || {};
  if (Voice.rec) { Voice.stop(); App.ui.voice.listening = false; App.refresh(); return; }
  if (!Voice.supported()) { UI.toast('Voice works in Google Chrome or Edge', 'warn'); return; }
  App.ui.voice = { listening: true, heard: '' };
  App.refresh();
  Voice.listen((txt, final) => {
    App.ui.voice.heard = txt;
    const h = document.querySelector('.voice-heard');
    if (h) h.textContent = '“' + txt + '”';
    if (final) { App.ui.voice.listening = false; Voice.stop(); EchoChat.send(txt); }
  }, () => { App.ui.voice.listening = false; if (App.parse().route === 'echo' && !App.ui.typing) App.refresh(); });
};

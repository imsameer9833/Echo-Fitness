/* =========================================================
   ECHO — calc.js
   All the "smart" maths: calorie & macro targets, the meal
   analyser + meal score, workout volume and best lifts.
   ========================================================= */

const Calc = {
  /* ---------- Daily targets from the profile ----------
     1. BMR (Mifflin-St Jeor): energy the body burns at rest
     2. x activity factor (type of work + gym days)
     3. +/- goal adjustment
     4. Protein 2 g per kg, fat 25% of calories, rest = carbs  */
  targets(user) {
    const w = Number(user.weight) || 70;
    const h = Number(user.height) || 170;
    const a = Number(user.age) || 25;
    const genderAdj = user.gender === 'female' ? -161 : user.gender === 'other' ? -78 : 5;
    const bmr = 10 * w + 6.25 * h - 5 * a + genderAdj;
    const workBase = { sitting: 1.3, feet: 1.45, physical: 1.6 }[user.work] || 1.3;
    const factor = workBase + (Number(user.gymDays) || 0) * 0.0625;
    const goalAdj = { lose: -400, maintain: 0, build: 250 }[user.goal] || 0;
    const kcal = Math.round((bmr * factor + goalAdj) / 10) * 10;
    const protein = Math.round(w * (user.goal === 'lose' ? 2.2 : 2));
    const fat = Math.round((kcal * 0.25) / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carbs, fat, bmr: Math.round(bmr), factor };
  },

  /* Share of the day's calories each meal should roughly cover */
  MEAL_SHARE: { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snacks: 0.1 },

  /* ---------- Meal analyser ----------
     Reads free text like "2 chapati, dal, 200g paneer and salad",
     finds the foods, the quantities and adds up the nutrients. */
  analyseMeal(text, mealType, user) {
    const clean = ' ' + String(text || '').toLowerCase()
      .replace(/[()!?"]/g, ' ')
      .replace(/(\d)\s*(gms?|grams?|g)\b/g, '$1g ')
      .replace(/\s+/g, ' ') + ' ';
    const segments = clean.split(/,|;|\n|\+|&|\band\b|\bwith\b|\balong with\b/).map(s => s.trim()).filter(Boolean);
    const items = [];
    const unknown = [];

    segments.forEach(seg => {
      const found = Calc.findFoods(seg);
      if (!found.length) {
        if (seg.replace(/[^a-z]/g, '').length > 2) unknown.push(seg);
        return;
      }
      found.forEach((m, i) => {
        const before = seg.slice(i === 0 ? 0 : found[i - 1].end, m.start);
        const after = i === found.length - 1 ? seg.slice(m.end) : '';
        const qty = Calc.readQuantity(before + ' ' + after, m.food);
        const k = qty.factor;
        items.push({
          name: m.food.name,
          qtyLabel: qty.label,
          kcal: m.food.kcal * k, p: m.food.p * k, c: m.food.c * k, f: m.food.f * k, fib: m.food.fib * k,
          tags: m.food.tags
        });
      });
    });

    // Anything we could not recognise is estimated as a mixed home-cooked dish
    unknown.forEach(u => {
      items.push({ name: Calc.titleCase(u), qtyLabel: 'estimate', kcal: 180, p: 5, c: 22, f: 8, fib: 2, tags: ['unknown'] });
    });

    const totals = items.reduce((t, it) => {
      t.kcal += it.kcal; t.p += it.p; t.c += it.c; t.f += it.f; t.fib += it.fib; return t;
    }, { kcal: 0, p: 0, c: 0, f: 0, fib: 0 });
    Object.keys(totals).forEach(k => { totals[k] = Math.round(totals[k] * 10) / 10; });
    totals.kcal = Math.round(totals.kcal);

    const result = Calc.scoreMeal(totals, items, mealType, user);
    return { text: String(text || '').trim(), items, unknown, totals, score: result.score, label: result.label, tip: result.tip, parts: result.parts };
  },

  /* Find every food mentioned in a piece of text (longest name wins) */
  findFoods(seg) {
    const hits = [];
    FOODS.forEach(food => {
      food.aliases.forEach(alias => {
        const re = new RegExp('(^|[^a-z])(' + alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(es|s)?(?=[^a-z]|$)', 'g');
        let m;
        while ((m = re.exec(seg)) !== null) {
          const start = m.index + m[1].length;
          hits.push({ food, start, end: start + m[2].length + (m[3] ? m[3].length : 0), len: alias.length });
        }
      });
    });
    hits.sort((a, b) => b.len - a.len || a.start - b.start);
    const chosen = [];
    hits.forEach(h => {
      if (!chosen.some(c => h.start < c.end && h.end > c.start)) chosen.push(h);
    });
    chosen.sort((a, b) => a.start - b.start);
    // "whey protein shake" = one food, not two: merge neighbours that are the same food
    const merged = [];
    chosen.forEach(h => {
      const prev = merged[merged.length - 1];
      if (prev && prev.food === h.food && !seg.slice(prev.end, h.start).trim()) prev.end = h.end;
      else merged.push(Object.assign({}, h));
    });
    return merged;
  },

  /* Turn "2", "half plate", "200g", "a bowl of" into a multiplier */
  readQuantity(text, food) {
    const t = ' ' + text + ' ';
    const grams = t.match(/(\d+(?:\.\d+)?)\s*(g|ml)\b/);
    if (grams) {
      const g = parseFloat(grams[1]);
      return { factor: g / food.grams, label: g + (grams[2] === 'ml' ? ' ml' : ' g') };
    }
    const kg = t.match(/(\d+(?:\.\d+)?)\s*kg\b/);
    if (kg) {
      const g = parseFloat(kg[1]) * 1000;
      return { factor: g / food.grams, label: g + ' g' };
    }
    let n = null;
    const num = t.match(/(\d+(?:\.\d+)?)/);
    if (num) n = parseFloat(num[1]);
    if (n === null) {
      const words = t.trim().split(/\s+/);
      for (const w of words) { if (NUMBER_WORDS[w] !== undefined) { n = NUMBER_WORDS[w]; break; } }
    }
    if (/\bhalf\b/.test(t) && n !== null && n !== 0.5 && !num) n = 0.5;
    if (n === null || n <= 0) n = food.defaultQty || 1;
    n = Math.min(n, 20);
    const unit = n === 1 ? food.unit : Calc.plural(food.unit);
    return { factor: n, label: Calc.niceNum(n) + ' ' + unit };
  },

  /* ---------- Meal score out of 100 ----------
     Calories fit for this meal ...... 25
     Protein (vs. this meal's share) . 25
     Carb / fat balance .............. 15
     Fibre & vegetables .............. 15
     Food quality .................... 20
     minus a junk-food penalty for the share of
     calories that come from fried / packaged food */
  scoreMeal(t, items, mealType, user) {
    const target = Calc.targets(user);
    const share = Calc.MEAL_SHARE[mealType] || 0.3;
    const kcalGoal = target.kcal * share;
    const protGoal = target.protein * share;
    if (!t.kcal) return { score: 0, label: 'Poor', tip: 'Add what you ate so ECHO can check it.', parts: {} };

    const ratio = t.kcal / kcalGoal;
    const kcalPts = 25 * Math.max(0, 1 - Math.abs(ratio - 1) * 0.8);
    const protPts = 25 * Math.min(1, t.p / (protGoal * 0.9));
    const carbPct = (t.c * 4) / t.kcal * 100;
    const fatPct = (t.f * 9) / t.kcal * 100;
    const inRange = (v, lo, hi, soft) => v >= lo && v <= hi ? 1 : Math.max(0, 1 - (v < lo ? lo - v : v - hi) / soft);
    const balPts = 7.5 * inRange(carbPct, 40, 60, 20) + 7.5 * inRange(fatPct, 20, 35, 20);
    const fibGoal = mealType === 'snacks' ? 3 : 8;
    const hasVeg = items.some(i => i.tags.includes('veg') || i.tags.includes('fruit'));
    const fibPts = 15 * Math.min(1, t.fib / fibGoal) * (hasVeg ? 1 : 0.75);
    const junk = items.filter(i => i.tags.includes('fried') || i.tags.includes('processed'));
    const oily = items.filter(i => i.tags.includes('oily')).length;
    const badCount = junk.length;
    const qualPts = Math.max(0, 20 - badCount * 10 - oily * 4);
    const penalty = Math.round(25 * Math.min(1, junk.reduce((a, i) => a + i.kcal, 0) / t.kcal));

    const score = Math.max(5, Math.min(100, Math.round(kcalPts + protPts + balPts + fibPts + qualPts - penalty)));
    const label = score >= 75 ? 'Good' : score >= 50 ? 'Okay' : 'Poor';

    // Build a short, specific tip from the weakest area
    const tips = [];
    if (penalty >= 10) tips.push('mostly fried or packaged food, which pulls the score down. Swap one item for something home-made, like dal, roti, eggs or fruit');
    if (t.p < protGoal * 0.6) tips.push(`low on protein (${Math.round(t.p)} g). Add curd, paneer, eggs, dal or chicken to stay on track for ${target.protein} g today`);
    if (ratio > 1.4) tips.push(`a heavy ${mealType === 'snacks' ? 'snack' : 'meal'} (${t.kcal} kcal vs about ${Math.round(kcalGoal)} kcal planned). Keep the next meal lighter`);
    else if (ratio < 0.5 && mealType !== 'snacks') tips.push(`quite light (${t.kcal} kcal). Add a roti, rice or fruit so you don't get hungry`);
    if (badCount && penalty < 10) tips.push('a fried or packaged item pulls the score down. Try a roasted or home-made swap');
    if (fatPct > 40) tips.push('high in fat. Go easy on butter, cream and oil');
    if (t.fib < fibGoal * 0.5 && mealType !== 'snacks') tips.push('low in fibre. Add salad, sabzi or fruit');

    let tip;
    if (!tips.length) tip = label === 'Good' ? 'Well balanced. Good protein, sensible portion and enough fibre.' : 'Decent meal. Small tweaks like more protein or veggies will push it higher.';
    else {
      const good = [];
      if (t.p >= protGoal * 0.9) good.push('good protein');
      if (t.fib >= fibGoal) good.push('good fibre');
      if (ratio >= 0.8 && ratio <= 1.2) good.push('right portion');
      tip = (good.length ? Calc.cap(good.join(' and ')) + ', but ' : 'This meal is ') + tips[0] + '.';
    }
    return { score, label, tip, parts: { kcal: Math.round(kcalPts), protein: Math.round(protPts), balance: Math.round(balPts), fibre: Math.round(fibPts), quality: Math.round(qualPts), penalty } };
  },

  /* Sum of today's (or any day's) meals */
  dayTotals(dayMeals) {
    const t = { kcal: 0, p: 0, c: 0, f: 0, fib: 0, count: 0, scoreSum: 0 };
    Object.values(dayMeals || {}).forEach(m => {
      if (!m || !m.totals) return;
      t.kcal += m.totals.kcal; t.p += m.totals.p; t.c += m.totals.c; t.f += m.totals.f; t.fib += m.totals.fib;
      t.count++; t.scoreSum += m.score * Math.max(1, m.totals.kcal);
    });
    t.score = t.count ? Math.round(t.scoreSum / Math.max(1, t.kcal)) : null;
    t.p = Math.round(t.p); t.c = Math.round(t.c); t.f = Math.round(t.f); t.kcal = Math.round(t.kcal);
    return t;
  },

  /* ---------- Workouts ---------- */
  setVolume(s) { return (Number(s.kg) || 0) * (Number(s.reps) || 0); },
  workoutVolume(w) {
    if (!w || w.rest) return 0;
    return Math.round(w.exercises.reduce((sum, ex) => sum + ex.sets.reduce((a, s) => a + Calc.setVolume(s), 0), 0));
  },
  workoutSets(w) {
    if (!w || w.rest) return 0;
    return w.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => Number(s.reps) > 0).length, 0);
  },

  /* Muscle groups for a workout name like "Chest + Back" */
  groupsFor(split) {
    const s = String(split || '').toLowerCase();
    const groups = [];
    SPLIT_KEYWORDS.forEach(k => {
      if (k.words.some(w => new RegExp('\\b' + w).test(s))) k.groups.forEach(g => { if (!groups.includes(g)) groups.push(g); });
    });
    return groups.length ? groups : ['chest', 'back', 'legs', 'shoulders'];
  },
  suggestions(split) {
    const groups = Calc.groupsFor(split);
    const list = [];
    // Take exercises round-robin so every muscle group shows up early
    for (let i = 0; i < 7; i++) groups.forEach(g => { const e = EXERCISES[g][i]; if (e && !list.includes(e)) list.push(e); });
    return list;
  },

  /* Best weight ever lifted per exercise */
  bestLifts(workouts, excludeId) {
    const best = {};
    workouts.forEach(w => {
      if (w.rest || w.id === excludeId) return;
      w.exercises.forEach(ex => ex.sets.forEach(s => {
        const kg = Number(s.kg) || 0, reps = Number(s.reps) || 0;
        if (!reps || !kg) return;
        const b = best[ex.name];
        if (!b || kg > b.kg || (kg === b.kg && reps > b.reps)) best[ex.name] = { name: ex.name, kg, reps, date: w.date };
      }));
    });
    return best;
  },

  /* Last time an exercise was done (for "last time" hints) */
  lastSet(workouts, name, excludeId) {
    const sorted = workouts.filter(w => !w.rest && w.id !== excludeId).sort((a, b) => b.date.localeCompare(a.date));
    for (const w of sorted) {
      const ex = w.exercises.find(e => e.name === name);
      if (ex && ex.sets.length) {
        const top = ex.sets.reduce((a, s) => (Number(s.kg) > Number(a.kg) ? s : a), ex.sets[0]);
        return { kg: top.kg, reps: top.reps, date: w.date, sets: ex.sets.length };
      }
    }
    return null;
  },

  /* Total kg lifted per 7-day block, oldest first (for the intensity graph) */
  weeklyVolume(workouts, weeks, splitFilter) {
    const today = Dates.today();
    const out = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const end = Dates.add(today, -7 * i);
      const start = Dates.add(end, -6);
      const vol = workouts
        .filter(w => !w.rest && w.date >= start && w.date <= end && (!splitFilter || w.split === splitFilter))
        .reduce((a, w) => a + Calc.workoutVolume(w), 0);
      out.push({ start, end, vol });
    }
    return out;
  },

  /* ---------- small helpers ---------- */
  niceNum(n) { return n === 0.5 ? '½' : n === 0.25 ? '¼' : String(Math.round(n * 10) / 10); },
  plural(u) { return { piece: 'pieces', bowl: 'bowls', plate: 'plates', slice: 'slices', cup: 'cups', glass: 'glasses', scoop: 'scoops', handful: 'handfuls', packet: 'packets', can: 'cans', serving: 'servings', tbsp: 'tbsp' }[u] || u + 's'; },
  cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  titleCase(s) { return s.replace(/\b\w/g, ch => ch.toUpperCase()).slice(0, 40); }
};

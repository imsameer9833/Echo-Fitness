# ECHO — Your Personal Life Operating System

**One place. Your entire life.**

ECHO is a web app that brings fitness tracking, meal tracking, daily tasks, a focus timer and an AI coach together under **one personal profile**. Instead of switching between five different apps, the user gets one dashboard that understands their body, goals and daily routine.

---

## How to run

1. Unzip the folder.
2. Double-click **`index.html`**. It opens in your browser.
3. Type your name (email is optional), fill in your profile and click **Save and continue**.

No installation, no internet and no server are needed. Use **Google Chrome** to try the voice features.

> Sample history (8 weeks of workouts, 2 weeks of meals, focus sessions) is loaded automatically so every graph has data. You can clear it from **Profile → Start fresh**.

---

## Features

| Section | What it does |
|---|---|
| **Login** | Name and optional email. No password. "Continue as guest" option. |
| **Profile** | Gender, age, height, weight, goal (lose fat / maintain / build muscle), type of daily work and gym days per week. Calculates daily calories and macros. |
| **Home** | Today's tasks at the top, cards for Fitness, Meal, Focus and ECHO AI, and a 7-day summary. |
| **Fitness: Today** | Pick today's split (Chest + Back, Legs + Abs, Arms, Shoulders, custom) or **Rest day**. Suggested exercises for that muscle group. Log each set (kg × reps), tick sets done, **Finish workout** to save. Shows last time's weight and a **New best** badge. Edit any saved workout. |
| **Fitness: Progress** | **Intensity graph** (total kg lifted per week, filter by split), trend vs the previous 4 weeks, **best lifts**, day-by-day **history** with edit and delete. |
| **Meal: Today** | Calorie ring and protein, carbs and fat bars from the profile targets. Breakfast, lunch, dinner and snacks tabs. Type or **speak** what you ate, then **Analyze with AI**. ECHO estimates calories and macros, gives a **score out of 100** (Good, Okay or Poor) and a tip. |
| **Meal: History** | 14-day meal-score chart, 7-day averages and day-by-day meals. |
| **ECHO AI** | Chat and **Voice** mode (speech-to-text, reads replies out loud). Answers from your own data: what to eat now, rate a meal, plan a workout split, why a lift is stuck, weekly progress, plan my day, BMI, water. |
| **Tasks** | Add tasks with a category, mark **✓ done** or **✗ skipped**. Workout and meal tasks tick themselves. |
| **Focus timer** | 25 min, 45 min or custom. Pause, resume, finish early. Shows focused time today, a note for each session and a 7-day chart. |

---

## How the smart parts work

**Daily calories (Mifflin-St Jeor)**
1. BMR = 10 × weight + 6.25 × height − 5 × age + (5 for men, −161 for women)
2. × activity factor (type of work + 0.0625 per gym day)
3. Goal: −400 kcal (lose fat), +0 (maintain), +250 (build muscle)
4. Protein 2 g per kg · Fat 25% of calories · Carbs = the rest

**Meal analyser:** reads text like *"2 chapati, dal, 200g paneer and salad"*, finds each food in a built-in table of 80+ common Indian and everyday foods, reads the amount (numbers, "half", grams, bowls, plates) and adds up the nutrients.

**Meal score (out of 100):** calories fit for that meal (25) + protein (25) + carb/fat balance (15) + fibre and vegetables (15) + food quality (20), minus a junk-food penalty for fried or packaged food.

**Workout intensity:** volume = weight × reps, summed per workout and per week.

---

## Technology

- **HTML5, CSS3, JavaScript (ES6)**. No frameworks, so it runs by double-clicking.
- **localStorage**: saves all data in the browser (works offline).
- **SVG**: all charts and progress rings are drawn from the data.
- **Web Speech API**: voice input (speech recognition) and spoken replies (speech synthesis).
- **Web Audio API**: a sound when a focus session ends.
- **Responsive design**: sidebar on laptops, bottom bar on phones.

## Project structure

```
echo/
├── index.html            Page shell, loads everything
├── css/style.css         Design: colours, layout, animations, phone layout
├── assets/fonts/         Inter + Space Grotesk (offline)
└── js/
    ├── data.js           Food table, exercise library, sample data
    ├── store.js          Saving and loading (localStorage), dates, sample history
    ├── calc.js           Calorie targets, meal analyser, meal score, workout maths
    ├── ui.js             Icons, charts, pop-ups, toasts, voice
    ├── app.js            Router (#/home, #/fitness …), layout, click handling
    └── views/
        ├── onboarding.js Login, profile setup, profile page
        ├── home.js       Dashboard
        ├── fitness.js    Workout logger, progress graph, best lifts, history
        ├── meal.js       Meal analyser, targets, meal history
        ├── echo.js       ECHO AI chat + voice
        └── tasks.js      To-do list + focus timer
```

## Future scope

- Accounts and cloud sync (backend database) so data follows the user on every device
- A real AI model (LLM API) for ECHO chat and photo-based meal recognition
- Barcode scanning and a bigger food database
- Wearable sync (steps, heart rate, sleep) and reminders/notifications
- Installable mobile app (PWA) and a social/challenges section

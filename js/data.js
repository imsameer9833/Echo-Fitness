/* =========================================================
   ECHO — data.js
   Built-in food table (common Indian + everyday foods) and
   exercise library. Values are per one serving ("unit").
   kcal = calories, p = protein (g), c = carbs (g), f = fat (g),
   fib = fibre (g). grams = weight of one serving (for "200g" input).
   ========================================================= */

const FOODS = [
  // ---- Breads & grains ----
  { name: 'Chapati', aliases: ['chapati', 'chapatti', 'chapathi', 'roti', 'phulka', 'fulka'], unit: 'piece', grams: 40, kcal: 120, p: 3.1, c: 18, f: 3.7, fib: 2.7, tags: ['grain'] },
  { name: 'Plain paratha', aliases: ['paratha', 'parantha', 'plain paratha'], unit: 'piece', grams: 80, kcal: 200, p: 4, c: 28, f: 8, fib: 3, tags: ['grain', 'oily'] },
  { name: 'Aloo paratha', aliases: ['aloo paratha', 'alu paratha', 'potato paratha'], unit: 'piece', grams: 120, kcal: 290, p: 6, c: 40, f: 12, fib: 4, tags: ['grain', 'oily'] },
  { name: 'Naan', aliases: ['naan', 'nan', 'butter naan'], unit: 'piece', grams: 90, kcal: 260, p: 8, c: 45, f: 5, fib: 2, tags: ['grain'] },
  { name: 'Rice', aliases: ['rice', 'chawal', 'steamed rice', 'plain rice', 'white rice'], unit: 'bowl', grams: 150, kcal: 195, p: 4, c: 43, f: 0.4, fib: 0.6, tags: ['grain'] },
  { name: 'Brown rice', aliases: ['brown rice'], unit: 'bowl', grams: 150, kcal: 170, p: 4, c: 36, f: 1.4, fib: 2.7, tags: ['grain'] },
  { name: 'Jeera rice', aliases: ['jeera rice', 'pulao', 'veg pulao'], unit: 'bowl', grams: 150, kcal: 230, p: 4, c: 44, f: 4.5, fib: 1.5, tags: ['grain'] },
  { name: 'Brown bread', aliases: ['brown bread', 'whole wheat bread', 'multigrain bread'], unit: 'slice', grams: 30, kcal: 70, p: 3.5, c: 12, f: 1, fib: 2, tags: ['grain'] },
  { name: 'White bread', aliases: ['bread', 'white bread', 'toast'], unit: 'slice', grams: 30, kcal: 75, p: 2.5, c: 14, f: 1, fib: 0.7, tags: ['grain', 'processed'] },
  { name: 'Poha', aliases: ['poha', 'pohe', 'kanda poha'], unit: 'plate', grams: 200, kcal: 270, p: 5, c: 48, f: 7, fib: 3, tags: ['grain'] },
  { name: 'Upma', aliases: ['upma', 'rava upma'], unit: 'bowl', grams: 200, kcal: 250, p: 6, c: 38, f: 8, fib: 3, tags: ['grain'] },
  { name: 'Oats', aliases: ['oats', 'oatmeal', 'porridge', 'masala oats'], unit: 'bowl', grams: 40, kcal: 150, p: 5, c: 27, f: 3, fib: 4, tags: ['grain'] },
  { name: 'Muesli', aliases: ['muesli', 'granola', 'cornflakes', 'cereal'], unit: 'bowl', grams: 50, kcal: 190, p: 5, c: 34, f: 4, fib: 4, tags: ['grain'] },
  { name: 'Idli', aliases: ['idli', 'idly'], unit: 'piece', grams: 40, kcal: 58, p: 2, c: 12, f: 0.2, fib: 0.5, tags: ['grain'] },
  { name: 'Plain dosa', aliases: ['dosa', 'plain dosa'], unit: 'piece', grams: 100, kcal: 170, p: 4, c: 28, f: 5, fib: 1, tags: ['grain'] },
  { name: 'Masala dosa', aliases: ['masala dosa'], unit: 'piece', grams: 180, kcal: 330, p: 7, c: 48, f: 12, fib: 4, tags: ['grain', 'oily'] },
  { name: 'Besan chilla', aliases: ['chilla', 'besan chilla', 'cheela', 'besan cheela'], unit: 'piece', grams: 70, kcal: 150, p: 7, c: 16, f: 6, fib: 3, tags: ['protein'] },
  { name: 'Bhature', aliases: ['bhature', 'bhatura'], unit: 'piece', grams: 80, kcal: 300, p: 6, c: 38, f: 14, fib: 1.5, tags: ['grain', 'fried'] },
  { name: 'Puri', aliases: ['puri', 'poori'], unit: 'piece', grams: 25, kcal: 100, p: 2, c: 12, f: 5, fib: 0.6, tags: ['grain', 'fried'] },
  { name: 'Khichdi', aliases: ['khichdi', 'khichri'], unit: 'bowl', grams: 200, kcal: 260, p: 9, c: 42, f: 6, fib: 4, tags: ['grain'] },
  { name: 'Veg biryani', aliases: ['veg biryani', 'vegetable biryani'], unit: 'plate', grams: 300, kcal: 450, p: 10, c: 64, f: 16, fib: 4, tags: ['grain', 'oily'] },
  { name: 'Chicken biryani', aliases: ['chicken biryani', 'biryani', 'mutton biryani'], unit: 'plate', grams: 350, kcal: 550, p: 28, c: 62, f: 20, fib: 2, tags: ['grain', 'protein', 'oily'] },
  { name: 'Instant noodles', aliases: ['maggi', 'noodles', 'instant noodles', 'ramen'], unit: 'packet', grams: 70, kcal: 350, p: 8, c: 50, f: 13, fib: 2, tags: ['processed'] },
  { name: 'Pizza', aliases: ['pizza'], unit: 'slice', grams: 107, kcal: 285, p: 12, c: 36, f: 10, fib: 2, tags: ['processed'] },
  { name: 'Burger', aliases: ['burger'], unit: 'piece', grams: 200, kcal: 450, p: 20, c: 45, f: 20, fib: 2, tags: ['processed', 'fried'] },
  { name: 'Pasta', aliases: ['pasta', 'spaghetti', 'macaroni'], unit: 'bowl', grams: 200, kcal: 380, p: 12, c: 58, f: 10, fib: 3, tags: ['grain'] },
  { name: 'Sandwich', aliases: ['sandwich', 'veg sandwich'], unit: 'piece', grams: 150, kcal: 280, p: 9, c: 36, f: 10, fib: 3, tags: ['grain'] },

  // ---- Dals, curries & sabzi ----
  { name: 'Dal', aliases: ['dal', 'daal', 'dal tadka', 'dal fry', 'toor dal', 'moong dal', 'masoor dal', 'yellow dal'], unit: 'bowl', grams: 150, kcal: 180, p: 9, c: 22, f: 6, fib: 5, tags: ['protein'] },
  { name: 'Dal makhani', aliases: ['dal makhani', 'maa ki dal'], unit: 'bowl', grams: 150, kcal: 280, p: 11, c: 26, f: 14, fib: 6, tags: ['protein', 'oily'] },
  { name: 'Rajma', aliases: ['rajma', 'kidney beans', 'rajma masala'], unit: 'bowl', grams: 150, kcal: 240, p: 12, c: 32, f: 7, fib: 9, tags: ['protein'] },
  { name: 'Chole', aliases: ['chole', 'chana', 'chana masala', 'chickpeas', 'chhole'], unit: 'bowl', grams: 150, kcal: 260, p: 11, c: 34, f: 9, fib: 9, tags: ['protein'] },
  { name: 'Sambar', aliases: ['sambar', 'sambhar'], unit: 'bowl', grams: 150, kcal: 130, p: 6, c: 18, f: 4, fib: 4, tags: ['veg'] },
  { name: 'Paneer butter masala', aliases: ['paneer butter masala', 'butter paneer', 'shahi paneer', 'paneer makhani'], unit: 'bowl', grams: 180, kcal: 400, p: 16, c: 14, f: 31, fib: 2, tags: ['protein', 'oily'] },
  { name: 'Palak paneer', aliases: ['palak paneer', 'saag paneer'], unit: 'bowl', grams: 180, kcal: 300, p: 15, c: 10, f: 22, fib: 4, tags: ['protein', 'veg'] },
  { name: 'Paneer bhurji', aliases: ['paneer bhurji'], unit: 'bowl', grams: 150, kcal: 330, p: 20, c: 6, f: 25, fib: 1, tags: ['protein'] },
  { name: 'Paneer tikka', aliases: ['paneer tikka'], unit: 'plate', grams: 150, kcal: 320, p: 22, c: 8, f: 22, fib: 2, tags: ['protein'] },
  { name: 'Mixed veg sabzi', aliases: ['mix veg', 'mixed veg', 'sabzi', 'sabji', 'vegetable curry', 'veg curry', 'mix veg sabzi'], unit: 'bowl', grams: 150, kcal: 150, p: 4, c: 16, f: 8, fib: 5, tags: ['veg'] },
  { name: 'Bhindi sabzi', aliases: ['bhindi', 'bhindi sabzi', 'okra', 'bhindi fry'], unit: 'bowl', grams: 150, kcal: 140, p: 3, c: 12, f: 9, fib: 5, tags: ['veg'] },
  { name: 'Aloo sabzi', aliases: ['aloo sabzi', 'aloo', 'potato sabzi', 'jeera aloo', 'aloo gobi'], unit: 'bowl', grams: 150, kcal: 180, p: 3, c: 26, f: 7, fib: 3, tags: ['veg'] },
  { name: 'Chicken curry', aliases: ['chicken curry', 'chicken masala', 'chicken gravy'], unit: 'bowl', grams: 200, kcal: 300, p: 26, c: 8, f: 18, fib: 1, tags: ['protein'] },
  { name: 'Butter chicken', aliases: ['butter chicken', 'chicken makhani'], unit: 'bowl', grams: 200, kcal: 420, p: 28, c: 10, f: 30, fib: 1, tags: ['protein', 'oily'] },
  { name: 'Egg curry', aliases: ['egg curry', 'anda curry'], unit: 'bowl', grams: 200, kcal: 280, p: 14, c: 8, f: 21, fib: 1, tags: ['protein'] },
  { name: 'Fish curry', aliases: ['fish curry', 'fish'], unit: 'bowl', grams: 200, kcal: 250, p: 24, c: 6, f: 14, fib: 1, tags: ['protein'] },
  { name: 'Veg thali', aliases: ['thali', 'veg thali'], unit: 'plate', grams: 600, kcal: 750, p: 22, c: 105, f: 26, fib: 12, tags: ['grain', 'veg'] },
  { name: 'Pav bhaji', aliases: ['pav bhaji'], unit: 'plate', grams: 300, kcal: 400, p: 10, c: 55, f: 16, fib: 6, tags: ['oily'] },

  // ---- Protein foods & dairy ----
  { name: 'Boiled egg', aliases: ['egg', 'eggs', 'boiled egg', 'anda', 'egg white'], unit: 'piece', grams: 50, kcal: 72, p: 6.3, c: 0.4, f: 4.8, fib: 0, tags: ['protein'] },
  { name: 'Omelette', aliases: ['omelette', 'omelet', 'egg omelette', 'eggs omelette', 'egg omelet', 'bhurji', 'egg bhurji', 'scrambled eggs', 'scrambled egg'], unit: 'egg', grams: 60, kcal: 95, p: 6.5, c: 0.5, f: 7.5, fib: 0, defaultQty: 2, tags: ['protein'] },
  { name: 'Paneer', aliases: ['paneer', 'cottage cheese'], unit: 'serving', grams: 100, kcal: 265, p: 18, c: 3, f: 20, fib: 0, tags: ['protein'] },
  { name: 'Grilled chicken', aliases: ['chicken', 'chicken breast', 'grilled chicken', 'tandoori chicken', 'chicken tikka'], unit: 'serving', grams: 100, kcal: 165, p: 31, c: 0, f: 3.6, fib: 0, tags: ['protein'] },
  { name: 'Tofu', aliases: ['tofu'], unit: 'serving', grams: 100, kcal: 145, p: 15, c: 3, f: 8, fib: 1, tags: ['protein'] },
  { name: 'Soya chunks', aliases: ['soya', 'soya chunks', 'soy chunks', 'nutrela'], unit: 'bowl', grams: 50, kcal: 170, p: 26, c: 16, f: 0.5, fib: 6, tags: ['protein'] },
  { name: 'Whey protein', aliases: ['whey', 'whey protein', 'protein shake', 'shake', 'protein'], unit: 'scoop', grams: 30, kcal: 120, p: 24, c: 3, f: 1.5, fib: 0, tags: ['protein'] },
  { name: 'Sprouts', aliases: ['sprouts', 'moong sprouts', 'sprouts chaat', 'sprout salad'], unit: 'bowl', grams: 100, kcal: 120, p: 8, c: 20, f: 1, fib: 6, tags: ['protein', 'veg'] },
  { name: 'Curd', aliases: ['curd', 'dahi', 'yogurt', 'yoghurt'], unit: 'bowl', grams: 150, kcal: 90, p: 5, c: 7, f: 5, fib: 0, tags: ['protein'] },
  { name: 'Greek yogurt', aliases: ['greek yogurt', 'greek yoghurt', 'hung curd'], unit: 'bowl', grams: 150, kcal: 130, p: 15, c: 6, f: 5, fib: 0, tags: ['protein'] },
  { name: 'Raita', aliases: ['raita'], unit: 'bowl', grams: 150, kcal: 80, p: 4, c: 7, f: 4, fib: 1, tags: ['veg'] },
  { name: 'Milk', aliases: ['milk', 'doodh', 'glass of milk'], unit: 'glass', grams: 250, kcal: 150, p: 8, c: 12, f: 8, fib: 0, tags: ['protein'] },
  { name: 'Almonds', aliases: ['almonds', 'badam', 'nuts', 'dry fruits', 'walnuts', 'cashews'], unit: 'handful', grams: 20, kcal: 116, p: 4.2, c: 4.3, f: 10, fib: 2.5, tags: [] },
  { name: 'Peanut butter', aliases: ['peanut butter'], unit: 'tbsp', grams: 16, kcal: 95, p: 4, c: 3, f: 8, fib: 1, tags: [] },
  { name: 'Peanuts', aliases: ['peanuts', 'moongfali', 'chana jor'], unit: 'handful', grams: 30, kcal: 170, p: 7.5, c: 5, f: 14, fib: 2.5, tags: [] },

  // ---- Fruit & veg ----
  { name: 'Banana', aliases: ['banana', 'kela'], unit: 'piece', grams: 120, kcal: 105, p: 1.3, c: 27, f: 0.4, fib: 3, tags: ['fruit'] },
  { name: 'Apple', aliases: ['apple'], unit: 'piece', grams: 180, kcal: 95, p: 0.5, c: 25, f: 0.3, fib: 4.4, tags: ['fruit'] },
  { name: 'Orange', aliases: ['orange'], unit: 'piece', grams: 130, kcal: 62, p: 1.2, c: 15.4, f: 0.2, fib: 3, tags: ['fruit'] },
  { name: 'Mango', aliases: ['mango', 'aam'], unit: 'piece', grams: 200, kcal: 200, p: 2.8, c: 50, f: 1.3, fib: 5, tags: ['fruit'] },
  { name: 'Papaya', aliases: ['papaya', 'fruit bowl', 'fruits', 'fruit'], unit: 'bowl', grams: 150, kcal: 65, p: 0.7, c: 16, f: 0.4, fib: 2.5, tags: ['fruit'] },
  { name: 'Salad', aliases: ['salad', 'cucumber', 'green salad', 'cucumber salad', 'kachumber', 'veggies', 'vegetables'], unit: 'bowl', grams: 100, kcal: 35, p: 1.5, c: 7, f: 0.2, fib: 2.5, tags: ['veg'] },

  // ---- Drinks & snacks ----
  { name: 'Tea', aliases: ['tea', 'chai', 'masala chai'], unit: 'cup', grams: 150, kcal: 70, p: 2, c: 10, f: 2.5, fib: 0, tags: ['sweet'] },
  { name: 'Coffee', aliases: ['coffee', 'cold coffee', 'latte', 'cappuccino'], unit: 'cup', grams: 150, kcal: 80, p: 3, c: 10, f: 3, fib: 0, tags: ['sweet'] },
  { name: 'Black coffee', aliases: ['black coffee', 'green tea', 'black tea'], unit: 'cup', grams: 150, kcal: 5, p: 0.3, c: 0.5, f: 0, fib: 0, tags: [] },
  { name: 'Samosa', aliases: ['samosa'], unit: 'piece', grams: 90, kcal: 260, p: 4, c: 30, f: 14, fib: 2, tags: ['fried'] },
  { name: 'Biscuits', aliases: ['biscuit', 'biscuits', 'cookie', 'cookies', 'parle g', 'marie'], unit: 'piece', grams: 10, kcal: 45, p: 0.6, c: 6.5, f: 2, fib: 0.2, tags: ['processed', 'sweet'] },
  { name: 'Chips', aliases: ['chips', 'wafers', 'kurkure', 'namkeen', 'bhujia'], unit: 'packet', grams: 50, kcal: 270, p: 3, c: 27, f: 17, fib: 1.5, tags: ['processed', 'fried'] },
  { name: 'Vada pav', aliases: ['vada pav', 'vada pao', 'wada pav'], unit: 'piece', grams: 150, kcal: 300, p: 6, c: 40, f: 13, fib: 2, tags: ['fried'] },
  { name: 'Dhokla', aliases: ['dhokla', 'khaman'], unit: 'plate', grams: 120, kcal: 160, p: 6, c: 24, f: 4, fib: 2, tags: [] },
  { name: 'Gulab jamun', aliases: ['gulab jamun', 'sweet', 'mithai', 'rasgulla', 'jalebi', 'dessert', 'ice cream'], unit: 'piece', grams: 50, kcal: 150, p: 2, c: 25, f: 5, fib: 0, tags: ['sweet', 'processed'] },
  { name: 'Soft drink', aliases: ['coke', 'pepsi', 'cold drink', 'soda', 'soft drink', 'sprite', 'energy drink'], unit: 'can', grams: 330, kcal: 140, p: 0, c: 35, f: 0, fib: 0, tags: ['processed', 'sweet'] },
  { name: 'Fruit juice', aliases: ['juice', 'orange juice', 'fruit juice', 'mango shake', 'smoothie'], unit: 'glass', grams: 250, kcal: 120, p: 1, c: 28, f: 0.5, fib: 0.5, tags: ['sweet'] },
  { name: 'Lassi', aliases: ['lassi', 'buttermilk', 'chaas', 'chhach'], unit: 'glass', grams: 250, kcal: 160, p: 6, c: 22, f: 5, fib: 0, tags: [] },
  { name: 'Water', aliases: ['water', 'nimbu pani', 'lemon water'], unit: 'glass', grams: 250, kcal: 0, p: 0, c: 0, f: 0, fib: 0, tags: [] }
];

/* Words that mean "how many" */
const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, quarter: 0.25, couple: 2, few: 3, double: 2, single: 1
};

/* Exercise library, grouped by muscle group */
const EXERCISES = {
  chest: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Push-ups', 'Pec Deck', 'Decline Bench Press'],
  back: ['Lat Pulldown', 'Seated Row', 'Deadlift', 'Pull-ups', 'Bent-over Row', 'Face Pull'],
  legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raise', 'Walking Lunges'],
  abs: ['Cable Crunch', 'Hanging Leg Raise', 'Plank', 'Russian Twist', 'Crunches'],
  arms: ['Barbell Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Preacher Curl', 'Overhead Tricep Extension'],
  shoulders: ['Overhead Press', 'Lateral Raise', 'Rear Delt Fly', 'Arnold Press', 'Shrugs', 'Front Raise'],
  cardio: ['Treadmill Run', 'Cycling', 'Jump Rope', 'Rowing Machine', 'Stair Climber']
};

/* Which muscle groups a workout name points to */
const SPLIT_KEYWORDS = [
  { words: ['chest', 'pec'], groups: ['chest'] },
  { words: ['back', 'lat'], groups: ['back'] },
  { words: ['leg', 'lower', 'quad', 'hamstring', 'glute'], groups: ['legs'] },
  { words: ['abs', 'core', 'ab'], groups: ['abs'] },
  { words: ['arm', 'bicep', 'tricep'], groups: ['arms'] },
  { words: ['shoulder', 'delt'], groups: ['shoulders'] },
  { words: ['push'], groups: ['chest', 'shoulders', 'arms'] },
  { words: ['pull'], groups: ['back', 'arms'] },
  { words: ['upper'], groups: ['chest', 'back', 'shoulders'] },
  { words: ['full', 'total'], groups: ['legs', 'chest', 'back', 'shoulders'] },
  { words: ['cardio', 'run', 'hiit'], groups: ['cardio'] }
];

/* Starting weights used to create the sample history (kg, reps) */
const DEMO_TEMPLATES = {
  'Chest + Back': [['Bench Press', 55, 8], ['Incline Dumbbell Press', 18, 10], ['Lat Pulldown', 45, 10], ['Seated Row', 40, 10], ['Cable Fly', 12.5, 12]],
  'Legs + Abs': [['Squat', 70, 8], ['Leg Press', 120, 10], ['Romanian Deadlift', 55, 10], ['Leg Curl', 30, 12], ['Cable Crunch', 25, 15]],
  'Arms': [['Barbell Curl', 25, 10], ['Hammer Curl', 12, 12], ['Tricep Pushdown', 22.5, 12], ['Skull Crusher', 20, 10], ['Preacher Curl', 17.5, 10]],
  'Shoulders': [['Overhead Press', 32.5, 8], ['Lateral Raise', 8, 15], ['Rear Delt Fly', 10, 15], ['Shrugs', 50, 12], ['Deadlift', 90, 5]]
};

/* Sample meals used to build the demo history (analysed by the real meal engine).
   Each sample day is "good", "okay" or "poor" so the history looks real. */
const DEMO_MEALS = {
  good: {
    breakfast: ['3 egg omelette, 2 slices brown bread and 1 glass milk', '2 besan chilla, 1 bowl curd and 1 banana', '1 bowl oats with milk, whey protein and banana', 'paneer bhurji and 2 chapati'],
    lunch: ['grilled chicken 200g, 1 bowl rice, dal and salad', '3 chapati, rajma, curd and salad', '2 chapati, paneer bhurji, dal and salad', 'soya chunks, 2 chapati, dal and salad'],
    dinner: ['2 chapati, palak paneer, dal and salad', 'fish curry, 1 bowl rice and salad', 'chicken curry, 2 chapati and salad', '2 chapati, egg curry, dal and salad'],
    snacks: ['whey protein and banana', 'greek yogurt and handful almonds', '1 glass milk and apple', 'sprouts chaat and 1 glass lassi']
  },
  okay: {
    breakfast: ['poha and 1 cup tea', '3 idli with sambar and coffee', 'upma and tea', '1 masala dosa with sambar', '2 aloo paratha and tea'],
    lunch: ['2 chapati, dal tadka, 1 bowl rice, cucumber salad', 'chicken biryani and raita', 'rajma chawal and salad', '2 chapati, mix veg sabzi, dal, curd'],
    dinner: ['khichdi with curd', 'dal, rice and bhindi sabzi', '2 chapati and mix veg', 'paneer butter masala and 2 naan'],
    snacks: ['1 banana and 1 cup tea', 'apple', 'sprouts chaat', '1 cup coffee and handful peanuts']
  },
  poor: {
    breakfast: ['3 slices white bread with tea', '4 biscuits and tea'],
    lunch: ['chole bhature and coke', 'veg biryani and cold drink', '2 vada pav and chips'],
    dinner: ['3 slices pizza and coke', 'maggi', 'burger and coke'],
    snacks: ['samosa and tea', 'chips and cold drink']
  }
};
/* Quality of each sample day, oldest first (13 days before today) */
const DEMO_DAYS = ['poor', 'okay', 'okay', 'good', 'poor', 'okay', 'good', 'okay', 'good', 'good', 'poor', 'good', 'okay'];

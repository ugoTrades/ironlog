export const EXERCISE_DB = {
  chest: [
    // Barbell
    'Panca Piana Bilanciere', 'Panca Inclinata Bilanciere', 'Panca Declinata Bilanciere',
    'Floor Press Bilanciere', 'Close Grip Bench Press',
    // Dumbbell
    'Panca Piana Manubri', 'Panca Inclinata Manubri', 'Panca Declinata Manubri',
    'Floor Press Manubri', 'Squeeze Press', 'Svend Press',
    // Cable
    'Croci ai Cavi', 'Croci ai Cavi dal Basso', 'Croci ai Cavi dall\'Alto',
    'Cable Chest Press',
    // Machine
    'Pec Deck', 'Chest Press Macchina', 'Chest Press Inclinata Macchina',
    'Smith Machine Panca Piana', 'Smith Machine Panca Inclinata',
    // Bodyweight
    'Push Up', 'Push Up Diamante', 'Push Up Inclinati', 'Push Up Declinati',
    'Dip al Petto', 'Dip alle Parallele',
    // Other
    'Pullover con Manubrio', 'Pullover al Cavo',
  ],
  back: [
    // Pull-ups / Chin-ups
    'Trazioni Presa Prona', 'Trazioni Presa Supina (Chin Up)', 'Trazioni Presa Neutra',
    'Trazioni Larghe', 'Trazioni Strette', 'Trazioni Zavorrate',
    'Trazioni Assistite alla Macchina',
    // Barbell rows
    'Rematore con Bilanciere', 'Rematore con Bilanciere Presa Supina',
    'Pendlay Row', 'T-Bar Row', 'Seal Row',
    // Dumbbell rows
    'Rematore Manubrio', 'Rematore Manubrio su Panca', 'Meadows Row',
    'Rematore Manubrio a Due Bracci', 'Kroc Row',
    // Cable
    'Pulley Basso', 'Pulley Basso Presa Stretta', 'Pulley Basso Presa Larga',
    'Pulley Alto', 'Straight Arm Pulldown', 'Face Pull',
    'Cable Row Unilaterale',
    // Machine
    'Lat Machine Avanti', 'Lat Machine Dietro', 'Lat Machine Presa Stretta',
    'Lat Machine Presa Supina', 'Lat Machine Presa Neutra',
    'Seated Row Macchina', 'Chest Supported Row Macchina',
    'Low Row Macchina',
    // Deadlift variations
    'Stacco da Terra', 'Stacco da Terra Sumo', 'Rack Pull', 'Deficit Deadlift',
    'Trap Bar Deadlift',
    // Other
    'Iperestensioni (Back Extension)', 'Reverse Hyper',
    'Good Morning', 'Shrug con Bilanciere', 'Shrug con Manubri',
  ],
  shoulders: [
    // Overhead Press
    'Military Press', 'Push Press', 'Behind the Neck Press',
    'Lento Avanti Manubri', 'Lento Avanti Manubri Seduto',
    'Arnold Press', 'Z Press',
    // Machine
    'Shoulder Press Macchina', 'Smith Machine Shoulder Press',
    // Lateral raises
    'Alzate Laterali Manubri', 'Alzate Laterali Manubri Seduto',
    'Alzate Laterali ai Cavi', 'Alzate Laterali alla Macchina',
    'Alzate Laterali Inclinate (Lean Away)',
    'Alzate Laterali al Cavo Basso',
    // Front raises
    'Alzate Frontali Manubri', 'Alzate Frontali Bilanciere',
    'Alzate Frontali al Cavo', 'Alzate Frontali con Disco',
    // Rear delt
    'Rear Delt Fly Manubri', 'Rear Delt Fly ai Cavi',
    'Rear Delt Fly alla Macchina (Reverse Pec Deck)',
    'Face Pull', 'Band Pull Apart',
    // Other
    'Upright Row', 'Lu Raises', 'Cable Y Raise',
  ],
  biceps: [
    // Barbell
    'Curl Bilanciere Dritto', 'Curl Bilanciere EZ', 'Curl Bilanciere Presa Larga',
    'Curl Bilanciere Presa Stretta', 'Drag Curl Bilanciere',
    'Curl Bilanciere 21s',
    // Dumbbell
    'Curl Manubri in Piedi', 'Curl Manubri Alternati',
    'Curl Manubri Inclinata', 'Curl Manubri Seduto',
    'Curl Concentrato', 'Hammer Curl', 'Cross Body Hammer Curl',
    'Curl Manubri Presa Prona (Reverse Curl)',
    'Curl Manubri su Panca Scott',
    // Cable
    'Curl ai Cavi Basso', 'Curl ai Cavi Alto', 'Curl al Cavo con Barra EZ',
    'Curl al Cavo Unilaterale', 'Bayesian Curl',
    // Machine
    'Curl alla Macchina', 'Preacher Curl Macchina',
    // Other
    'Spider Curl', 'Preacher Curl Bilanciere', 'Preacher Curl Manubrio',
    'Curl alla Panca Scott EZ',
  ],
  triceps: [
    // Extensions
    'French Press Bilanciere', 'French Press Manubri', 'French Press EZ',
    'Skull Crusher', 'Overhead Extension Manubrio',
    'Overhead Extension Bilanciere', 'Overhead Extension al Cavo',
    'JM Press',
    // Pushdowns
    'Pushdown ai Cavi con Barra', 'Pushdown ai Cavi con Corda',
    'Pushdown ai Cavi Presa Inversa', 'Pushdown al Cavo Unilaterale',
    // Dips
    'Dip ai Paralleli (Tricipiti)', 'Bench Dip',
    // Press
    'Panca Presa Stretta', 'Close Grip Floor Press',
    'Diamond Push Up',
    // Other
    'Kick Back Manubrio', 'Kick Back al Cavo',
    'Tate Press',
  ],
  quadriceps: [
    // Squat variations
    'Squat', 'Front Squat', 'Squat con Fermo (Pause Squat)',
    'Goblet Squat', 'Zercher Squat', 'Box Squat',
    'Squat al Smith Machine', 'Sissy Squat',
    'Squat Overhead',
    // Leg press
    'Leg Press 45°', 'Leg Press Orizzontale', 'Leg Press Verticale',
    'Leg Press Unilaterale',
    // Extensions
    'Leg Extension', 'Leg Extension Unilaterale',
    // Lunges
    'Affondi con Manubri', 'Affondi con Bilanciere',
    'Affondi Camminati', 'Affondi Indietro', 'Affondi Laterali',
    'Bulgarian Split Squat', 'Split Squat',
    // Machine
    'Hack Squat', 'Hack Squat Inverso', 'Belt Squat',
    'Pendulum Squat', 'V Squat',
    // Other
    'Step Up', 'Pistol Squat', 'Wall Sit',
  ],
  hamstrings: [
    // Curl
    'Leg Curl Sdraiato', 'Leg Curl Seduto', 'Leg Curl in Piedi',
    'Leg Curl Unilaterale', 'Nordic Curl',
    // Hip hinge
    'Stacco Rumeno Bilanciere', 'Stacco Rumeno Manubri',
    'Stacco Rumeno Unilaterale', 'Stacco a Gambe Tese',
    // Glute-ham
    'Glute Ham Raise', 'Good Morning',
    'Good Morning Seduto',
    // Other
    'Hyperextension (focus hamstring)', 'Slider Leg Curl',
    'Swiss Ball Leg Curl',
  ],
  glutes: [
    // Hip thrust
    'Hip Thrust Bilanciere', 'Hip Thrust alla Smith Machine',
    'Hip Thrust Unilaterale', 'Hip Thrust con Manubrio',
    // Bridge
    'Glute Bridge', 'Glute Bridge Unilaterale',
    'Glute Bridge con Bilanciere',
    // Cable
    'Cable Kickback', 'Cable Pull Through',
    // Abduction
    'Abductor Machine', 'Clamshell', 'Band Lateral Walk',
    'Fire Hydrant',
    // Other
    'Sumo Deadlift', 'Romanian Deadlift',
    'Frog Pump', 'Donkey Kick',
    'Step Up (focus glutei)',
    'Bulgarian Split Squat (focus glutei)',
  ],
  calves: [
    'Calf Raise in Piedi alla Macchina', 'Calf Raise Seduto alla Macchina',
    'Calf Raise al Smith Machine', 'Calf Raise su Step con Manubri',
    'Calf Raise alla Leg Press', 'Calf Raise Unilaterale',
    'Donkey Calf Raise', 'Tibialis Raise',
    'Calf Raise a Corpo Libero',
  ],
  forearms: [
    'Wrist Curl con Bilanciere', 'Wrist Curl con Manubri',
    'Reverse Wrist Curl', 'Farmer Walk',
    'Dead Hang', 'Plate Pinch', 'Grip Crush',
    'Wrist Roller', 'Reverse Curl con Bilanciere EZ',
  ],
  abs: [
    // Upper abs
    'Crunch', 'Crunch alla Macchina', 'Crunch ai Cavi',
    'Crunch su Panca Declinata', 'Crunch con Disco',
    // Lower abs
    'Leg Raise Appeso', 'Leg Raise su Panca', 'Leg Raise a Terra',
    'Knee Raise Appeso', 'Reverse Crunch',
    'Dragon Flag', 'Hanging Windshield Wiper',
    // Obliques
    'Russian Twist', 'Woodchop al Cavo',
    'Pallof Press', 'Side Bend con Manubrio',
    'Bicycle Crunch', 'Oblique Crunch',
    // Isometric
    'Plank', 'Plank Laterale', 'Plank con Peso',
    'Dead Bug', 'Hollow Body Hold',
    // Dynamic
    'Ab Wheel Rollout', 'Mountain Climber',
    'Sit Up', 'V-Up', 'Toe Touch',
    'Hanging L-Sit',
  ],
  traps: [
    'Shrug con Bilanciere', 'Shrug con Manubri',
    'Shrug alla Smith Machine', 'Shrug al Cavo',
    'Shrug con Trap Bar', 'Farmer Walk',
    'Rack Pull (sopra il ginocchio)',
    'Face Pull (focus trapezio)',
    'Y Raise Prono',
  ],
  cardio: [
    'Treadmill (Corsa)', 'Treadmill (Camminata Inclinata)',
    'Cyclette', 'Ellittica', 'Vogatore (Rowing Machine)',
    'Stair Climber', 'Assault Bike', 'Spin Bike',
    'Jumping Jacks', 'Burpees', 'Jump Rope (Corda)',
    'Battle Ropes', 'Sled Push', 'Sled Pull',
    'Box Jump', 'Sprint',
  ],
  fullbody: [
    'Clean & Jerk', 'Snatch', 'Power Clean',
    'Clean & Press', 'Thruster',
    'Turkish Get Up', 'Man Maker',
    'Devil Press', 'Bear Crawl',
    'Farmer Walk', 'Suitcase Carry',
    'Kettlebell Swing', 'Kettlebell Snatch',
  ],
}

export const MUSCLE_GROUPS = Object.keys(EXERCISE_DB)

export const MUSCLE_LABELS = {
  chest: 'Petto',
  back: 'Schiena',
  shoulders: 'Spalle',
  biceps: 'Bicipiti',
  triceps: 'Tricipiti',
  quadriceps: 'Quadricipiti',
  hamstrings: 'Femorali',
  glutes: 'Glutei',
  calves: 'Polpacci',
  forearms: 'Avambracci',
  abs: 'Addominali',
  traps: 'Trapezio',
  cardio: 'Cardio',
  fullbody: 'Full Body',
}

export const EX_TO_MUSCLE = {}
Object.entries(EXERCISE_DB).forEach(([muscle, exercises]) => {
  exercises.forEach(ex => { if (!EX_TO_MUSCLE[ex]) EX_TO_MUSCLE[ex] = muscle })
})

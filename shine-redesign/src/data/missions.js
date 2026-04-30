// ── Scavenger Hunt Missions ──────────────────────────────────────────────────

export const HUNT_TYPE_CONFIG = {
  location:   { color: '#3B82F6', light: '#EFF6FF', label: 'Location',  iconKey: 'pin' },
  resource:   { color: '#10B981', light: '#ECFDF5', label: 'Resource',  iconKey: 'wrench' },
  social:     { color: '#F59E0B', light: '#FFFBEB', label: 'Social',    iconKey: 'users' },
  academic:   { color: '#8B5CF6', light: '#F5F3FF', label: 'Academic',  iconKey: 'gradcap' },
  life:       { color: '#EF4444', light: '#FEF2F2', label: 'Life',      iconKey: 'leaf' },
  event:      { color: '#EC4899', light: '#FDF2F8', label: 'Event',     iconKey: 'calendar' },
  reflection: { color: '#6B7280', light: '#F9FAFB', label: 'Reflect',   iconKey: 'message' },
}

export const DIFFICULTY_POINTS = { easy: 10, medium: 15, hard: 20 }

// Named sections for grouped navigation
export const SECTIONS = [
  { id: 'featured',   label: '⭐ Demo Challenge',      iconKey: 'star' },
  { id: 'landmarks',  label: 'Campus Landmarks',    iconKey: 'landmark' },
  { id: 'resources',  label: 'Resources & Support',  iconKey: 'wrench' },
  { id: 'social',     label: 'Social & Culture',     iconKey: 'users' },
  { id: 'academic',   label: 'Academic Life',         iconKey: 'gradcap' },
  { id: 'daily',      label: 'Daily Life',            iconKey: 'leaf' },
  { id: 'events',     label: 'Events & Activities',   iconKey: 'calendar' },
  { id: 'reflection', label: 'Reflection',            iconKey: 'message' },
]

export const MISSIONS = [
  // ── Demo Challenge (repeatable) ──────────────────────────────────────────────
  {
    id: 'mhgse', section: 'featured', iconKey: 'camera',
    title: 'HGSE Logo Challenge',
    desc: 'Find the HGSE logo on the Harvard Ed School campus and take a selfie with it! Go solo or bring friends — the bigger your crew the more points you all earn. You can submit as many times as you want, so keep snapping!',
    type: 'social', difficulty: 'hard', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    repeatable: true,
    repeatableNote: 'Do this as many times as you can — each submission earns full points! The highest scorer on the Individual Board wins.',
    geofence: { lat: 42.3775, lng: -71.1152, radius: 300 },
    instructions: [
      'Spot the HGSE logo anywhere on the Ed School campus (buildings, signs, banners)',
      'Take a clear selfie with the logo in frame — solo or with friends',
      'Tag every friend in the photo to award points to their account too',
      'Add your photo and pin it to the Shine map',
      'Submit again and again — every submission earns full points!',
    ],
    bonusNote: '🏅 Solo: 20 pts · 👥 2–3 friends: +3 pts · 👥👥 4–6 friends: +5 pts · 🌍 3+ countries: +3 pts · 🔁 Repeatable — no limit!',
  },
  // ── Campus Landmarks ────────────────────────────────────────────────────────
  {
    id: 'm1', section: 'landmarks', iconKey: 'book',
    title: 'Widener Welcome',
    desc: 'Find Widener Library and take a group photo on the steps with at least one new friend.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3767, lng: -71.1162, radius: 150 },
  },
  {
    id: 'm2', section: 'landmarks', iconKey: 'leaf',
    title: 'Harvard Yard Chill Spot',
    desc: 'Find a place to sit in Harvard Yard and relax or study with at least one other student.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 200 },
  },
  {
    id: 'm3', section: 'landmarks', iconKey: 'landmark',
    title: 'John Harvard Tradition',
    desc: 'Find the John Harvard statue. Take a creative selfie — no touching the foot!',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3754, lng: -71.1174, radius: 100 },
  },
  {
    id: 'm4', section: 'landmarks', iconKey: 'landmark',
    title: 'House Home Base',
    desc: 'Visit your assigned Yard dorm or House. Take a photo of something that makes it feel like home.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3762, lng: -71.1155, radius: 300 },
  },
  {
    id: 'm5', section: 'landmarks', iconKey: 'cooking',
    title: 'Dining Hall Debut',
    desc: 'Have a meal in a main dining hall with at least one new friend from another country.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3730, lng: -71.1182, radius: 150 },
  },
  {
    id: 'm29', section: 'landmarks', iconKey: 'search',
    title: 'Find Remy the Cat',
    desc: "Spot Remy, Harvard's famous resident cat, and take a photo with them. Patience required!",
    type: 'location', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm30', section: 'landmarks', iconKey: 'activity',
    title: 'Cross the Charles',
    desc: 'Walk across a Charles River bridge to the other side and back. Take a photo from the bridge.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3696, lng: -71.1139, radius: 200 },
  },
  {
    id: 'm31', section: 'landmarks', iconKey: 'image',
    title: 'Harvard Art Museums',
    desc: 'Visit the Harvard Art Museums and take a photo of your favorite piece.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3743, lng: -71.1145, radius: 150 },
  },
  {
    id: 'm32', section: 'landmarks', iconKey: 'image',
    title: 'Van Gogh Moment',
    desc: "Find one of Van Gogh's paintings at the Harvard Art Museums and take a photo in front of it.",
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3743, lng: -71.1145, radius: 150 },
  },
  {
    id: 'm33', section: 'landmarks', iconKey: 'activity',
    title: 'Natural History Museum',
    desc: 'Visit the Harvard Museum of Natural History and take a photo of the most impressive exhibit.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3784, lng: -71.1159, radius: 150 },
  },
  {
    id: 'm34', section: 'landmarks', iconKey: 'search',
    title: 'Science Center Atrium',
    desc: 'Explore the Science and Engineering Complex (SEC) — take a photo in the atrium or a lab hallway.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3740, lng: -71.1213, radius: 200 },
  },
  {
    id: 'm35', section: 'landmarks', iconKey: 'leaf',
    title: 'Harvard Turkey Sighting',
    desc: "Photograph one of Harvard's famous wild turkeys roaming the campus grounds.",
    type: 'location', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm36', section: 'landmarks', iconKey: 'landmark',
    title: 'Memorial Church',
    desc: 'Visit Memorial Church and take a photo inside or of the exterior. Notice what stands out to you.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3753, lng: -71.1159, radius: 120 },
  },
  {
    id: 'm37', section: 'landmarks', iconKey: 'music',
    title: 'Sanders Theatre Selfie',
    desc: 'Take a selfie inside Sanders Theatre, one of the oldest and most beautiful venues at Harvard.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3757, lng: -71.1167, radius: 100 },
  },
  {
    id: 'm38', section: 'landmarks', iconKey: 'compass',
    title: 'Observatory Above the SEC',
    desc: 'Find the rooftop observatory above the Science Center Building and take a photo.',
    type: 'location', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3748, lng: -71.1176, radius: 150 },
  },
  {
    id: 'm39', section: 'landmarks', iconKey: 'sprout',
    title: 'Cambridge Common Walk',
    desc: 'Take a walk through Cambridge Common, just outside Harvard Yard.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3782, lng: -71.1200, radius: 200 },
  },
  // ── Resources & Support ──────────────────────────────────────────────────────
  {
    id: 'm6', section: 'resources', iconKey: 'globe',
    title: 'International Office Check-in',
    desc: 'Visit the international student office and learn one resource they offer.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3784, lng: -71.1173, radius: 120 },
  },
  {
    id: 'm7', section: 'resources', iconKey: 'book',
    title: 'Library Pro Tip',
    desc: 'Go inside a library (Cabot, Lamont, Widener, or Smith Center), find a study space, and ask a librarian one question.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3741, lng: -71.1161, radius: 150 },
  },
  {
    id: 'm8', section: 'resources', iconKey: 'heart',
    title: 'Health & Wellness Tour',
    desc: 'Find HUHS (Harvard University Health Services) and learn one type of support they offer.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3748, lng: -71.1188, radius: 150 },
  },
  {
    id: 'm9', section: 'resources', iconKey: 'code',
    title: 'IT & Tech Setup',
    desc: 'Visit IT support or finish connecting your device to Harvard Wi-Fi and email.',
    type: 'resource', difficulty: 'easy', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: true,
    geofence: null,
  },
  {
    id: 'm10', section: 'resources', iconKey: 'diamond',
    title: 'Money & Jobs Info',
    desc: 'Learn about student jobs or financial support from a relevant office or workshop.',
    type: 'resource', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    allowTextAnswer: true, textPrompt: 'One thing I learned is...',
    geofence: { lat: 42.3762, lng: -71.1155, radius: 300 },
  },
  {
    id: 'm40', section: 'resources', iconKey: 'activity',
    title: 'Gym Tryout',
    desc: 'Check out one of the campus gyms — MAC or Hemmingway — and explore the facilities.',
    type: 'resource', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm41', section: 'resources', iconKey: 'landmark',
    title: 'Smith Campus Center',
    desc: 'Explore the Smith Campus Center — find a place you could imagine studying or relaxing.',
    type: 'resource', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3740, lng: -71.1177, radius: 150 },
  },
  {
    id: 'm42', section: 'resources', iconKey: 'book',
    title: 'Harvard Bookstore',
    desc: 'Visit the COOP Bookstore and one of the Harvard Shops. Grab a souvenir if you can!',
    type: 'resource', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3734, lng: -71.1195, radius: 200 },
  },
  // ── Social & Culture ─────────────────────────────────────────────────────────
  {
    id: 'm11', section: 'social', iconKey: 'globe',
    title: 'Global Group Photo',
    desc: 'Take a group photo with at least 3 different countries represented.',
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm12', section: 'social', iconKey: 'users',
    title: 'Ask an American',
    desc: 'Ask a domestic student one question about U.S. college life and take a selfie together.',
    type: 'social', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'What I learned...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm13', section: 'social', iconKey: 'music',
    title: 'Club Fair Connection',
    desc: 'Visit the Extracurricular Fair and take a photo at the table of a club you might join.',
    type: 'social', difficulty: 'medium', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm14', section: 'social', iconKey: 'message',
    title: 'Cultural Swap',
    desc: 'Teach someone a greeting in your language and learn one in theirs. Take a selfie together.',
    type: 'social', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'I taught... and I learned...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm15', section: 'social', iconKey: 'edit',
    title: 'Study Squad',
    desc: 'Form a study group of 2+ people and work together at a library or study space.',
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm43', section: 'social', iconKey: 'cooking',
    title: 'Meal with a Stranger',
    desc: 'Sit down and eat a meal with someone you just met — introduce yourself and swap one fun fact.',
    type: 'social', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm44', section: 'social', iconKey: 'medal',
    title: 'Meet a Recruited Athlete',
    desc: 'Find a recruited athlete at Harvard, introduce yourself, and take a photo together.',
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm45', section: 'social', iconKey: 'star',
    title: 'Club Merch Hunt',
    desc: 'Score free merch (a sticker, pin, or shirt!) from any club or alumni group at the fair.',
    type: 'social', difficulty: 'easy', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm46', section: 'social', iconKey: 'crown',
    title: 'Senior Wisdom',
    desc: "Ask a Harvard senior about their post-grad plans and their biggest advice for first-years.",
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'Their best advice was...',
    geofence: null,
  },
  {
    id: 'm47', section: 'social', iconKey: 'landmark',
    title: "Upperclassman's Dorm Tour",
    desc: "Get an upperclassman to show you their dorm or House — see what Harvard living looks like later on.",
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  // ── Academic Life ─────────────────────────────────────────────────────────────
  {
    id: 'm16', section: 'academic', iconKey: 'gradcap',
    title: 'First Class Snapshot',
    desc: 'After your first class, take a photo of your notes, backpack, or classroom entry.',
    type: 'academic', difficulty: 'easy', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm17', section: 'academic', iconKey: 'landmark',
    title: 'Office Hours Explorer',
    desc: "Attend an instructor's office hours once. Photo of the hallway or door — not during!",
    type: 'academic', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm18', section: 'academic', iconKey: 'book',
    title: 'Library Treasure',
    desc: 'Find a book related to your major or a hobby in the stacks and take a photo of its cover.',
    type: 'academic', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3741, lng: -71.1161, radius: 200 },
  },
  {
    id: 'm48', section: 'academic', iconKey: 'mic',
    title: 'Ask a Prof',
    desc: 'Take a photo with a professor after class or at an event — introduce yourself first!',
    type: 'academic', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm49', section: 'academic', iconKey: 'grid',
    title: 'Academic Fair Discovery',
    desc: 'Attend the Academic Fair and learn about one concentration you had never considered before.',
    type: 'academic', difficulty: 'easy', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'The concentration that surprised me was...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  // ── Daily Life ──────────────────────────────────────────────────────────────
  {
    id: 'm19', section: 'daily', iconKey: 'compass',
    title: 'Grocery or Pharmacy Run',
    desc: 'Visit a local grocery or pharmacy and find a product that is new or surprising to you.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3732, lng: -71.1190, radius: 500 },
  },
  {
    id: 'm20', section: 'daily', iconKey: 'map',
    title: 'Transportation Trial',
    desc: 'Use public transport — T, bus, shuttle, or bike. Take a photo at a station or on board.',
    type: 'life', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3732, lng: -71.1190, radius: 200 },
  },
  {
    id: 'm21', section: 'daily', iconKey: 'code',
    title: 'Phone or Banking Setup',
    desc: 'Set up a local phone plan or bank account. Photo of storefront or redacted confirmation.',
    type: 'life', difficulty: 'hard', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm22', section: 'daily', iconKey: 'sprout',
    title: 'Campus Green Space',
    desc: 'Find a green open area and spend a few minutes there. Take a photo of your view.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm23', section: 'daily', iconKey: 'activity',
    title: 'Self-Care Moment',
    desc: 'Do one self-care activity — a walk, calling home, exercise. Capture it.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'This helps me feel grounded because...',
    geofence: null,
  },
  // ── Events & Activities ──────────────────────────────────────────────────────
  {
    id: 'm24', section: 'events', iconKey: 'star',
    title: 'Welcome Event Check-in',
    desc: 'Attend the main international welcome or orientation event.',
    type: 'event', difficulty: 'medium', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm25', section: 'events', iconKey: 'landmark',
    title: 'Workshop Bonus',
    desc: 'Attend any International Student Workshop — academics, health, or culture shock.',
    type: 'event', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: false, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm26', section: 'events', iconKey: 'map',
    title: 'First Weekend Explorer',
    desc: 'Visit a nearby neighborhood or landmark beyond the Yard — the river, Harvard Square, or beyond.',
    type: 'event', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3762, lng: -71.1155, radius: 600 },
  },
  {
    id: 'm27', section: 'events', iconKey: 'camera',
    title: 'Event Photo of the Week',
    desc: 'Take a photo at any campus event this week.',
    type: 'event', difficulty: 'easy', timing: 'weekly',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm50', section: 'events', iconKey: 'music',
    title: 'Performing Arts Show',
    desc: 'Watch a performing arts group rehearse or perform on campus. Take a photo of the performance.',
    type: 'event', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm51', section: 'events', iconKey: 'compass',
    title: 'Campus Tour Walker',
    desc: 'Join an official Harvard campus tour and learn one historical fact you did not know.',
    type: 'event', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'Something I learned was...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  // ── Reflection ───────────────────────────────────────────────────────────────
  {
    id: 'm28', section: 'reflection', iconKey: 'message',
    title: 'What I Wish I Knew',
    desc: 'Share one thing you wish you knew before coming to Harvard.',
    type: 'reflection', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'One thing I wish I knew is...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm52', section: 'reflection', iconKey: 'message',
    title: 'Postcard Home',
    desc: 'Write and send a physical postcard back to your family or a friend from home.',
    type: 'reflection', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'What I wrote on the postcard...',
    geofence: null,
  },
  {
    id: 'm53', section: 'reflection', iconKey: 'message',
    title: 'Call Home Check-in',
    desc: 'Call your family so they know you arrived safely. Take a photo of your surroundings during the call.',
    type: 'reflection', difficulty: 'easy', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm54', section: 'reflection', iconKey: 'sun',
    title: 'Harvard Sunset',
    desc: 'Capture a photo of a Harvard sunset from anywhere on campus — the Yard, the river, a rooftop.',
    type: 'reflection', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 600 },
  },
]

export const BADGES = [
  {
    id: 'resource_master', iconKey: 'wrench', name: 'Resource Master', points: 20,
    desc: 'Complete any 3 resource-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'resource').length >= 3,
  },
  {
    id: 'global_connector', iconKey: 'globe', name: 'Global Connector', points: 20,
    desc: 'Complete any 3 social-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'social').length >= 3,
  },
  {
    id: 'campus_explorer', iconKey: 'map', name: 'Campus Explorer', points: 20,
    desc: 'Complete any 5 location-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'location').length >= 5,
  },
  {
    id: 'bingo_master', iconKey: 'grid', name: 'Bingo Master', points: 30,
    desc: 'Complete 10 missions across any categories',
    check: (completions) => completions.length >= 10,
  },
  {
    id: 'reflection_star', iconKey: 'message', name: 'Reflection Star', points: 15,
    desc: 'Complete any 2 reflection missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'reflection').length >= 2,
  },
]

export const MOCK_LEADERBOARD = [
  { name: 'Priya S.',  country: '🇮🇳', dorm: 'Matthews',    points: 312, completed: 18 },
  { name: 'Kenji T.',  country: '🇯🇵', dorm: 'Weld',        points: 287, completed: 16 },
  { name: 'Sofia R.',  country: '🇩🇪', dorm: 'Thayer',      points: 254, completed: 15 },
  { name: 'Omar K.',   country: '🇪🇬', dorm: 'Grays',       points: 231, completed: 14 },
  { name: 'Mei Lin',   country: '🇨🇳', dorm: 'Straus',      points: 198, completed: 12 },
  { name: 'Ji-ho P.',  country: '🇰🇷', dorm: 'Wigglesworth',points: 167, completed: 10 },
  { name: 'Lucas M.',  country: '🇧🇷', dorm: 'Canaday',     points: 145, completed: 9  },
  { name: 'Amara O.',  country: '🇳🇬', dorm: 'Greenough',   points: 120, completed: 8  },
]

export const MOCK_GROUP_LEADERBOARD = [
  { name: 'Matthews',     members: 28, points: 4320, leader: 'Priya S.'  },
  { name: 'Weld',         members: 31, points: 3980, leader: 'Kenji T.'  },
  { name: 'Thayer',       members: 25, points: 3750, leader: 'Sofia R.'  },
  { name: 'Grays',        members: 30, points: 3210, leader: 'Omar K.'   },
  { name: 'Straus',       members: 22, points: 2870, leader: 'Mei Lin'   },
  { name: 'Wigglesworth', members: 19, points: 2540, leader: 'Ji-ho P.'  },
  { name: 'Canaday',      members: 24, points: 2190, leader: 'Lucas M.'  },
  { name: 'Greenough',    members: 20, points: 1860, leader: 'Amara O.'  },
  { name: 'Hollis',       members: 17, points: 1620, leader: 'Ana P.'    },
  { name: 'Stoughton',    members: 18, points: 1380, leader: 'Yuki N.'   },
  { name: 'Pennypacker',  members: 15, points: 1140, leader: 'Dev S.'    },
  { name: 'Lionel',       members: 16, points:  980, leader: 'Zara A.'   },
]

export const MATCH_GROUP_BONUS = 15

export function computePoints(mission, { groupSize = 1, hasDiversity = false, shareToFeed = false, isTimeLimited = false, isMatchGroup = false }) {
  const base = DIFFICULTY_POINTS[mission.difficulty] ?? 10
  let bonus = 0
  const effectiveGroupSize = isMatchGroup ? Math.max(groupSize, 4) : groupSize
  if (effectiveGroupSize >= 4) bonus += 5
  else if (effectiveGroupSize >= 2) bonus += 3
  if (hasDiversity) bonus += 3
  if (shareToFeed) bonus += 2
  if (isTimeLimited && mission.timing !== 'evergreen') bonus += 5
  if (isMatchGroup) bonus += MATCH_GROUP_BONUS
  return { base, bonus, total: base + bonus }
}

export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3
  const p1 = lat1 * Math.PI / 180
  const p2 = lat2 * Math.PI / 180
  const dp = (lat2 - lat1) * Math.PI / 180
  const dl = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

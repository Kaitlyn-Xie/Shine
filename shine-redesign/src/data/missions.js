// ── Scavenger Hunt Missions ──────────────────────────────────────────────────
// 28 missions for Harvard College international undergraduates

export const HUNT_TYPE_CONFIG = {
  location:   { color: '#3B82F6', light: '#EFF6FF', label: 'Location',  icon: '📍' },
  resource:   { color: '#10B981', light: '#ECFDF5', label: 'Resource',  icon: '🔧' },
  social:     { color: '#F59E0B', light: '#FFFBEB', label: 'Social',    icon: '👥' },
  academic:   { color: '#8B5CF6', light: '#F5F3FF', label: 'Academic',  icon: '🎓' },
  life:       { color: '#EF4444', light: '#FEF2F2', label: 'Life',      icon: '🌿' },
  event:      { color: '#EC4899', light: '#FDF2F8', label: 'Event',     icon: '🎪' },
  reflection: { color: '#6B7280', light: '#F9FAFB', label: 'Reflect',   icon: '💭' },
}

export const DIFFICULTY_POINTS = { easy: 10, medium: 15, hard: 20 }

export const MISSIONS = [
  // ── A. Campus Landmarks ──────────────────────────────────────────────────
  {
    id: 'm1', category: 'A', emoji: '📚',
    title: 'Widener Welcome',
    desc: 'Find Widener Library and take a group photo on the steps with at least one new friend.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3767, lng: -71.1162, radius: 150 },
  },
  {
    id: 'm2', category: 'A', emoji: '🌿',
    title: 'Harvard Yard Chill Spot',
    desc: 'Find a place to sit in Harvard Yard and relax or study with at least one other student.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 200 },
  },
  {
    id: 'm3', category: 'A', emoji: '🗿',
    title: 'John Harvard Tradition',
    desc: 'Find the John Harvard statue. Take a creative group photo — no touching the foot!',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3754, lng: -71.1174, radius: 100 },
  },
  {
    id: 'm4', category: 'A', emoji: '🏠',
    title: 'House Home Base',
    desc: 'Visit your assigned Yard dorm or House. Take a photo of something that makes it feel like home.',
    type: 'location', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3762, lng: -71.1155, radius: 300 },
  },
  {
    id: 'm5', category: 'A', emoji: '🍽️',
    title: 'Dining Hall Debut',
    desc: 'Have a meal in a main dining hall with at least one new friend from another country.',
    type: 'location', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3730, lng: -71.1182, radius: 150 },
  },
  // ── B. Support & Academic Resources ──────────────────────────────────────
  {
    id: 'm6', category: 'B', emoji: '🌐',
    title: 'International Office Check-in',
    desc: 'Visit the international student office and learn one resource they offer.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3784, lng: -71.1173, radius: 120 },
  },
  {
    id: 'm7', category: 'B', emoji: '📖',
    title: 'Library Pro Tip',
    desc: 'Go inside a library, find a study space, and ask a librarian one question.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3741, lng: -71.1161, radius: 150 },
  },
  {
    id: 'm8', category: 'B', emoji: '💚',
    title: 'Health & Wellness Tour',
    desc: 'Find the campus health or counseling center and learn one type of support they offer.',
    type: 'resource', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3748, lng: -71.1188, radius: 150 },
  },
  {
    id: 'm9', category: 'B', emoji: '💻',
    title: 'IT & Tech Setup',
    desc: 'Visit IT support or finish connecting your device to Harvard Wi-Fi and email.',
    type: 'resource', difficulty: 'easy', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: true,
    geofence: null,
  },
  {
    id: 'm10', category: 'B', emoji: '💰',
    title: 'Money & Jobs Info',
    desc: 'Learn about student jobs or financial support from a relevant office or workshop.',
    type: 'resource', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    allowTextAnswer: true, textPrompt: 'One thing I learned is...',
    geofence: { lat: 42.3762, lng: -71.1155, radius: 300 },
  },
  // ── C. Social & Cross-cultural ────────────────────────────────────────────
  {
    id: 'm11', category: 'C', emoji: '🌍',
    title: 'Global Group Photo',
    desc: 'Take a group photo with at least 3 different countries represented.',
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm12', category: 'C', emoji: '🤝',
    title: 'Ask an American',
    desc: 'Ask a domestic student one question about U.S. college life and take a selfie together.',
    type: 'social', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'What I learned...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm13', category: 'C', emoji: '🎪',
    title: 'Club Fair Connection',
    desc: 'Visit the club fair and take a photo at the table of a club you might join.',
    type: 'social', difficulty: 'medium', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm14', category: 'C', emoji: '💬',
    title: 'Cultural Swap',
    desc: 'Teach someone a greeting in your language and learn one in theirs. Take a selfie together.',
    type: 'social', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'I taught... and I learned...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm15', category: 'C', emoji: '📝',
    title: 'Study Squad',
    desc: 'Form a study group of 2+ people and work together at a library or study space.',
    type: 'social', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  // ── D. Academic Engagement ────────────────────────────────────────────────
  {
    id: 'm16', category: 'D', emoji: '🎓',
    title: 'First Class Snapshot',
    desc: 'After your first class, take a photo of your notes, backpack, or classroom entry.',
    type: 'academic', difficulty: 'easy', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm17', category: 'D', emoji: '🚪',
    title: 'Office Hours Explorer',
    desc: 'Attend an instructor\'s office hours once. Photo of the hallway or door — not during!',
    type: 'academic', difficulty: 'hard', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  {
    id: 'm18', category: 'D', emoji: '📗',
    title: 'Library Treasure',
    desc: 'Find a book related to your major or a hobby in the stacks and take a photo of its cover.',
    type: 'academic', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3741, lng: -71.1161, radius: 200 },
  },
  // ── E. Everyday Life ──────────────────────────────────────────────────────
  {
    id: 'm19', category: 'E', emoji: '🛒',
    title: 'Grocery or Pharmacy Run',
    desc: 'Visit a local grocery or pharmacy and find a product that is new or surprising to you.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3732, lng: -71.1190, radius: 500 },
  },
  {
    id: 'm20', category: 'E', emoji: '🚇',
    title: 'Transportation Trial',
    desc: 'Use public transport — T, bus, shuttle, or bike. Take a photo at a station or on board.',
    type: 'life', difficulty: 'medium', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3732, lng: -71.1190, radius: 200 },
  },
  {
    id: 'm21', category: 'E', emoji: '📱',
    title: 'Phone or Banking Setup',
    desc: 'Set up a local phone plan or bank account. Photo of storefront or redacted confirmation.',
    type: 'life', difficulty: 'hard', timing: 'orientation',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    geofence: null,
  },
  {
    id: 'm22', category: 'E', emoji: '🌳',
    title: 'Campus Green Space',
    desc: 'Find a green open area and spend a few minutes there. Take a photo of your view.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm23', category: 'E', emoji: '🧘',
    title: 'Self-Care Moment',
    desc: 'Do one self-care activity — a walk, calling home, exercise. Capture it.',
    type: 'life', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: false, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'This helps me feel grounded because...',
    geofence: null,
  },
  // ── F. Events ─────────────────────────────────────────────────────────────
  {
    id: 'm24', category: 'F', emoji: '🎉',
    title: 'Welcome Event Check-in',
    desc: 'Attend the main international welcome or orientation event.',
    type: 'event', difficulty: 'medium', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm25', category: 'F', emoji: '🏛️',
    title: 'Workshop Bonus',
    desc: 'Attend any International Student Workshop — academics, health, or culture shock.',
    type: 'event', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: false, requiresQR: true,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 400 },
  },
  {
    id: 'm26', category: 'F', emoji: '🗺️',
    title: 'First Weekend Explorer',
    desc: 'Visit a nearby neighborhood or landmark beyond the Yard — the river, Harvard Square, or beyond.',
    type: 'event', difficulty: 'hard', timing: 'orientation',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3762, lng: -71.1155, radius: 600 },
  },
  {
    id: 'm27', category: 'F', emoji: '📸',
    title: 'Event Photo of the Week',
    desc: 'Take a photo at any campus event this week.',
    type: 'event', difficulty: 'easy', timing: 'weekly',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
  // ── G. Reflection ─────────────────────────────────────────────────────────
  {
    id: 'm28', category: 'G', emoji: '💭',
    title: 'What I Wish I Knew',
    desc: 'Share one thing you wish you knew before coming to Harvard.',
    type: 'reflection', difficulty: 'easy', timing: 'evergreen',
    requiresGPS: true, requiresPhoto: true, requiresQR: false,
    allowTextAnswer: true, textPrompt: 'One thing I wish I knew is...',
    geofence: { lat: 42.3755, lng: -71.1130, radius: 500 },
  },
]

export const BADGES = [
  {
    id: 'resource_master', emoji: '🔧', name: 'Resource Master', points: 20,
    desc: 'Complete any 3 resource-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'resource').length >= 3,
  },
  {
    id: 'global_connector', emoji: '🌍', name: 'Global Connector', points: 20,
    desc: 'Complete any 3 social-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'social').length >= 3,
  },
  {
    id: 'campus_explorer', emoji: '🗺️', name: 'Campus Explorer', points: 20,
    desc: 'Complete any 5 location-type missions',
    check: (completions) =>
      completions.filter(c => MISSIONS.find(m => m.id === c.missionId)?.type === 'location').length >= 5,
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

// Match-group bonus: completing a mission with an AI-matched group earns extra points
export const MATCH_GROUP_BONUS = 15

export function computePoints(mission, { groupSize = 1, hasDiversity = false, shareToFeed = false, isTimeLimited = false, isMatchGroup = false }) {
  const base = DIFFICULTY_POINTS[mission.difficulty] ?? 10
  let bonus = 0
  // If via matched group, auto-qualify for the 4-person group tier
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

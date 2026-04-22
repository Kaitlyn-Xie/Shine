const getBase = () => {
  if (typeof window === "undefined") return "http://localhost:8080";
  // Route through the shine-live server which proxies /api/ → API server.
  // Works regardless of how Replit's proxy handles path prefixes.
  return `${window.location.origin}/Shine`;
};

function session() {
  try { return localStorage.getItem("shine_session") ?? ""; } catch { return ""; }
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const tok = session();
  if (tok) headers["x-session-id"] = tok;

  const res = await fetch(`${getBase()}/api/shine${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

export const api = {
  signup: (name, email, password) =>
    request("POST", "/auth/signup", { name, email, password }),
  signin: (email, password) =>
    request("POST", "/auth/signin", { email, password }),
  getMe: () => request("GET", "/users/me"),
  updateMe: (data) => request("PUT", "/users/me", data),

  getFeedPosts: () => request("GET", "/feed-posts"),
  createFeedPost: (post) => request("POST", "/feed-posts", post),
  likeFeedPost: (id) => request("POST", `/feed-posts/${id}/like`),

  getSunlightPosts: () => request("GET", "/sunlight-posts"),
  createSunlightPost: (post) => request("POST", "/sunlight-posts", post),
  updateSunlightPost: (id, data) => request("PUT", `/sunlight-posts/${id}`, data),
  likeSunlightPost: (id) => request("POST", `/sunlight-posts/${id}/like`),

  getQuestionAnswers: (questionId) =>
    request("GET", `/sunlight-posts/${questionId}/answers`),
  postQuestionAnswer: (questionId, body, isAnonymous = false) =>
    request("POST", `/sunlight-posts/${questionId}/answers`, { body, isAnonymous }),

  getHuntStats: () => request("GET", "/hunt/stats"),
  completeHuntMission: (data) => request("POST", "/hunt/complete", data),

  // ── Hidden Journal ────────────────────────────────────────────────────────
  getHiddenJournal: () => request("GET", "/profile/hidden-journal"),
  saveHiddenJournal: (hiddenJournal) => request("PUT", "/profile/hidden-journal", { hiddenJournal }),

  // ── Scavenger Matching ────────────────────────────────────────────────────
  setScavengerOptIn: (optIn) => request("POST", "/scavenger/opt-in", { optIn }),
  // Queue
  joinMatchQueue: () => request("POST", "/scavenger/queue"),
  leaveMatchQueue: () => request("DELETE", "/scavenger/queue"),
  getQueueStatus: () => request("GET", "/scavenger/queue/status"),
  // Groups
  getMyGroups: () => request("GET", "/scavenger/my-groups"),
  getMyParticipation: () => request("GET", "/scavenger/my-participation"),
  runMatching: () => request("POST", "/scavenger/run-matching"),
  // Group chat
  getGroupChat: (groupId) => request("GET", `/scavenger/groups/${groupId}/chat`),
  sendGroupMessage: (groupId, content) => request("POST", `/scavenger/groups/${groupId}/chat`, { content }),
  chooseGroupMission: (groupId, missionId, missionTitle) => request("POST", `/scavenger/groups/${groupId}/choose-mission`, { missionId, missionTitle }),
  // Available missions (for group to pick from)
  getScavengerMissions: () => request("GET", "/scavenger/missions"),
  // Group mission completion
  completeGroupMission: (groupId, data) => request("POST", `/scavenger/groups/${groupId}/complete-mission`, data),
};

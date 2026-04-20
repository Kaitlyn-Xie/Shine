const getBase = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/api-server`;
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
  likeSunlightPost: (id) => request("POST", `/sunlight-posts/${id}/like`),

  getQuestionAnswers: (questionId) =>
    request("GET", `/sunlight-posts/${questionId}/answers`),
  postQuestionAnswer: (questionId, body, isAnonymous = false) =>
    request("POST", `/sunlight-posts/${questionId}/answers`, { body, isAnonymous }),

  getHuntStats: () => request("GET", "/hunt/stats"),
  completeHuntMission: (data) => request("POST", "/hunt/complete", data),
};

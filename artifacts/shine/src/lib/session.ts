export function getSessionId(): string {
  let sessionId = localStorage.getItem("x-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("x-session-id", sessionId);
  }
  return sessionId;
}

export function clearSession() {
  localStorage.removeItem("x-session-id");
}

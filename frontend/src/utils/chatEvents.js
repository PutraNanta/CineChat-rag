export const CHAT_SESSIONS_CHANGED = "chat:sessions-changed";

export function notifyChatSessionsChanged() {
  window.dispatchEvent(new CustomEvent(CHAT_SESSIONS_CHANGED));
}

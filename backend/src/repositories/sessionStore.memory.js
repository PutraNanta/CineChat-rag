import { randomUUID } from "node:crypto";

const sessions = new Map();

export const memorySessionStore = {
  async getLatest(userId) {
    if (!userId) return null;

    const latest = [...sessions.values()].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    )[0];
    if (!latest) return null;
    return {
      id: latest.id,
      title: latest.title,
      createdAt: latest.createdAt,
      updatedAt: latest.updatedAt,
    };
  },

  async getOrCreate(sessionId, firstUserMessage, { userId, forceNew = false } = {}) {
    if (sessionId && !forceNew && sessions.has(sessionId)) {
      return sessions.get(sessionId);
    }

    if (userId && !forceNew) {
      const latest = await this.getLatest(userId);
      if (latest) return sessions.get(latest.id);
    }

    const id = randomUUID();
    if (!sessions.has(id)) {
      sessions.set(id, {
        id,
        title: firstUserMessage?.slice(0, 60) || "Percakapan Baru",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return sessions.get(id);
  },

  async appendMessage(sessionId, message) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.messages.push({
      ...message,
      createdAt: new Date().toISOString(),
    });
    session.updatedAt = new Date().toISOString();
    return session;
  },

  async list(userId) {
    if (!userId) return [];

    return [...sessions.values()]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map((item) => ({
        id: item.id,
        title: item.title,
        updatedAt: item.updatedAt,
      }));
  },

  async getById(id, _userId) {
    return sessions.get(id) || null;
  },

  async removeById(id, userId) {
    if (!userId) return false;

    if (!sessions.has(id)) return false;
    sessions.delete(id);
    return true;
  },
};

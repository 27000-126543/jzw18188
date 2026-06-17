import { store } from "../db/store";
import type { Notification } from "../../shared/types";

const CURRENT_USER_ID = "u4";

export const notificationsService = {
  list(): Notification[] {
    return store.notifications
      .filter((n) => n.userId === CURRENT_USER_ID)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  unreadCount(): { count: number } {
    const count = store.notifications.filter(
      (n) => n.userId === CURRENT_USER_ID && !n.read
    ).length;
    return { count };
  },

  markRead(id: string): Notification | undefined {
    const n = store.notifications.find((x) => x.id === id);
    if (!n) return undefined;
    n.read = true;
    return n;
  },
};

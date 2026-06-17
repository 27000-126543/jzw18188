import { create } from "zustand";
import type {
  Lead,
  User,
  Notification,
  LeadStage,
  LeadSource,
} from "../../shared/types";
import { api } from "../api/client";

interface AppState {
  currentUser: User;
  users: User[];
  leads: Lead[];
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchUsers: () => Promise<void>;
  fetchLeads: (params?: {
    stage?: LeadStage;
    ownerId?: string;
    source?: LeadSource;
    search?: string;
  }) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  setCurrentUser: (user: User) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: {
    id: "u4",
    name: "陈敏",
    email: "chenmin@example.com",
    role: "manager",
  },
  users: [],
  leads: [],
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchUsers: async () => {
    const users = await api.users.list();
    set({ users });
  },

  fetchLeads: async (params) => {
    set({ loading: true });
    try {
      const leads = await api.leads.list(params);
      set({ leads });
    } finally {
      set({ loading: false });
    }
  },

  fetchNotifications: async () => {
    const [list, unread] = await Promise.all([
      api.notifications.list(),
      api.notifications.unreadCount(),
    ]);
    set({ notifications: list, unreadCount: unread.count });
  },

  markNotificationRead: async (id: string) => {
    await api.notifications.markRead(id);
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    });
  },

  setCurrentUser: (user) => set({ currentUser: user }),
}));

import type {
  Lead,
  LeadStage,
  Communication,
  StageHistory,
  Customer,
  SalesTarget,
  Notification,
  User,
  FunnelData,
  StageDurationData,
  CloseCycleBucket,
  CommunicationType,
  LeadSource,
} from "../../shared/types";

const API_BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return undefined as unknown as T;
}

export const api = {
  users: {
    list: () => request<User[]>("/users"),
  },

  leads: {
    list: (params?: {
      stage?: LeadStage;
      ownerId?: string;
      source?: LeadSource;
      search?: string;
    }) => {
      const qs = new URLSearchParams();
      if (params?.stage) qs.set("stage", params.stage);
      if (params?.ownerId) qs.set("ownerId", params.ownerId);
      if (params?.source) qs.set("source", params.source);
      if (params?.search) qs.set("search", params.search);
      const query = qs.toString();
      return request<Lead[]>(`/leads${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<Lead>(`/leads/${id}`),
    create: (data: Partial<Lead>) =>
      request<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Lead>) =>
      request<Lead>(`/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    changeStage: (id: string, stage: LeadStage) =>
      request<Lead>(`/leads/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      }),
    convert: (id: string, dealValue: number) =>
      request<Customer>(`/leads/${id}/convert`, {
        method: "POST",
        body: JSON.stringify({ dealValue }),
      }),
    communications: {
      list: (leadId: string) =>
        request<Communication[]>(`/leads/${leadId}/communications`),
      create: (
        leadId: string,
        data: { type: CommunicationType; content: string; createdBy: string }
      ) =>
        request<Communication>(`/leads/${leadId}/communications`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
    },
    stageHistory: (leadId: string) =>
      request<StageHistory[]>(`/leads/${leadId}/stage-history`),
  },

  customers: {
    list: (params?: { search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      const query = qs.toString();
      return request<Customer[]>(`/customers${query ? `?${query}` : ""}`);
    },
    get: (id: string) => request<Customer>(`/customers/${id}`),
  },

  analytics: {
    funnel: () => request<FunnelData[]>("/analytics/funnel"),
    stageDuration: () => request<StageDurationData[]>("/analytics/stage-duration"),
    closeCycle: () => request<CloseCycleBucket[]>("/analytics/close-cycle"),
  },

  targets: {
    list: (params?: { month?: string }) => {
      const qs = new URLSearchParams();
      if (params?.month) qs.set("month", params.month);
      const query = qs.toString();
      return request<SalesTarget[]>(`/targets${query ? `?${query}` : ""}`);
    },
    create: (data: Partial<SalesTarget>) =>
      request<SalesTarget>("/targets", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<SalesTarget>) =>
      request<SalesTarget>(`/targets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: () => request<Notification[]>("/notifications"),
    unreadCount: () => request<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) =>
      request<void>(`/notifications/${id}/read`, { method: "PATCH" }),
  },
};

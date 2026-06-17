import { store, scheduleSave } from "../db/store";
import { nanoid } from "../db/seed";
import type {
  Lead,
  LeadStage,
  Communication,
  StageHistory,
  Customer,
  LeadSource,
  CommunicationType,
} from "../../shared/types";
import {
  STAGE_ORDER,
  COOLING_THRESHOLD_DAYS,
  STAGE_LABELS,
} from "../../shared/types";

function computeCooling(lead: Lead): Lead {
  if (!lead.lastFollowUpAt) {
    const days = Math.floor(
      (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return { ...lead, isCooling: days > COOLING_THRESHOLD_DAYS, coolingDays: days };
  }
  const days = Math.floor(
    (Date.now() - new Date(lead.lastFollowUpAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return { ...lead, isCooling: days > COOLING_THRESHOLD_DAYS, coolingDays: days };
}

export const leadsService = {
  list(params?: {
    stage?: LeadStage;
    ownerId?: string;
    source?: LeadSource;
    search?: string;
  }): Lead[] {
    let result = store.leads.map(computeCooling);
    if (params?.stage) result = result.filter((l) => l.stage === params.stage);
    if (params?.ownerId) result = result.filter((l) => l.ownerId === params.ownerId);
    if (params?.source) result = result.filter((l) => l.source === params.source);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.companyName.toLowerCase().includes(q) ||
          l.contactName.toLowerCase().includes(q)
      );
    }
    return result;
  },

  getById(id: string): Lead | undefined {
    const lead = store.leads.find((l) => l.id === id);
    return lead ? computeCooling(lead) : undefined;
  },

  create(data: Partial<Lead>): Lead {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: nanoid(),
      companyName: data.companyName || "",
      contactName: data.contactName || "",
      contactTitle: data.contactTitle,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address,
      source: data.source || "website",
      stage: data.stage || "initial",
      ownerId: data.ownerId || "u1",
      estimatedValue: data.estimatedValue || 0,
      isCooling: false,
      coolingDays: 0,
      createdAt: now,
      updatedAt: now,
      lastFollowUpAt: undefined,
    };
    store.leads.push(lead);

    store.stageHistory.push({
      id: nanoid(),
      leadId: lead.id,
      stage: lead.stage,
      enteredAt: now,
    });

    scheduleSave();
    return computeCooling(lead);
  },

  update(id: string, data: Partial<Lead>): Lead | undefined {
    const idx = store.leads.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString();
    store.leads[idx] = { ...store.leads[idx], ...data, updatedAt: now };
    scheduleSave();
    return computeCooling(store.leads[idx]);
  },

  changeStage(id: string, stage: LeadStage): Lead | undefined {
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return undefined;

    const now = new Date().toISOString();
    const oldStage = lead.stage;
    lead.stage = stage;
    lead.updatedAt = now;

    const prevHistory = store.stageHistory.find(
      (h) => h.leadId === id && h.stage === oldStage && !h.leftAt
    );
    if (prevHistory) {
      prevHistory.leftAt = now;
      prevHistory.durationDays = Math.ceil(
        (new Date(now).getTime() - new Date(prevHistory.enteredAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    }

    store.stageHistory.push({
      id: nanoid(),
      leadId: id,
      stage,
      enteredAt: now,
    });

    if (stage === "lost" || STAGE_ORDER.indexOf(stage) > STAGE_ORDER.indexOf(oldStage)) {
      const managers = store.users.filter((u) => u.role === "manager");
      managers.forEach((m) => {
        store.notifications.push({
          id: nanoid(),
          userId: m.id,
          type: stage === "lost" ? "lost" : "stage_change",
          title: stage === "lost" ? "线索流失提醒" : "线索阶段推进",
          content:
            stage === "lost"
              ? `${lead.companyName} 已被标记为流失。`
              : `${lead.companyName} 已从「${STAGE_LABELS[oldStage]}」推进至「${STAGE_LABELS[stage]}」阶段。`,
          relatedLeadId: lead.id,
          read: false,
          createdAt: now,
        });
      });
    }

    scheduleSave();
    return computeCooling(lead);
  },

  convert(id: string, dealValue: number): Customer | undefined {
    const lead = store.leads.find((l) => l.id === id);
    if (!lead) return undefined;

    const won = this.changeStage(id, "won");
    if (!won) return undefined;

    const now = new Date().toISOString();
    const customer: Customer = {
      id: nanoid(),
      leadId: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName,
      phone: lead.phone,
      email: lead.email,
      address: lead.address,
      dealValue,
      closedAt: now,
      createdAt: now,
    };
    store.customers.push(customer);

    const target = store.salesTargets.find((t) => {
      const tMonth = new Date(t.month + "-01").getMonth();
      const nowMonth = new Date().getMonth();
      return t.userId === lead.ownerId && tMonth === nowMonth;
    });
    if (target) {
      target.achievedAmount += dealValue;
      target.achievedCount += 1;
    }

    scheduleSave();
    return customer;
  },

  listCommunications(leadId: string): Communication[] {
    const result = store.communications
      .filter((c) => c.leadId === leadId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return result.map((c) => {
      const user = store.users.find((u) => u.id === c.createdBy);
      return { ...c, createdByName: user?.name };
    });
  },

  addCommunication(
    leadId: string,
    data: { type: CommunicationType; content: string; createdBy: string }
  ): Communication | undefined {
    const lead = store.leads.find((l) => l.id === leadId);
    if (!lead) return undefined;

    const now = new Date().toISOString();
    const comm: Communication = {
      id: nanoid(),
      leadId,
      type: data.type,
      content: data.content,
      createdBy: data.createdBy,
      createdAt: now,
    };
    store.communications.push(comm);

    lead.lastFollowUpAt = now;
    lead.updatedAt = now;

    scheduleSave();
    return comm;
  },

  listStageHistory(leadId: string): StageHistory[] {
    return store.stageHistory
      .filter((h) => h.leadId === leadId)
      .sort(
        (a, b) =>
          new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime()
      );
  },
};

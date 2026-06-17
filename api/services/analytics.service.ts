import { store } from "../db/store";
import type {
  FunnelData,
  StageDurationData,
  CloseCycleBucket,
  LeadStage,
} from "../../shared/types";
import { STAGE_ORDER, STAGE_LABELS } from "../../shared/types";

export const analyticsService = {
  funnel(): FunnelData[] {
    const enteredLeads: Record<LeadStage, Set<string>> = {
      initial: new Set(),
      needs: new Set(),
      proposal: new Set(),
      negotiation: new Set(),
      won: new Set(),
      lost: new Set(),
    };

    const currentCounts: Record<LeadStage, number> = {
      initial: 0,
      needs: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };
    const values: Record<LeadStage, number> = {
      initial: 0,
      needs: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };

    store.leads.forEach((l) => {
      currentCounts[l.stage] += 1;
      values[l.stage] += l.estimatedValue;
    });

    store.stageHistory.forEach((h) => {
      enteredLeads[h.stage].add(h.leadId);
    });

    const enteredCounts: Record<LeadStage, number> = {
      initial: enteredLeads.initial.size,
      needs: enteredLeads.needs.size,
      proposal: enteredLeads.proposal.size,
      negotiation: enteredLeads.negotiation.size,
      won: enteredLeads.won.size,
      lost: enteredLeads.lost.size,
    };

    const result: FunnelData[] = STAGE_ORDER.map((stage, idx) => {
      let conversionRate: number;
      if (idx === 0) {
        conversionRate = 100;
      } else {
        const prevStage = STAGE_ORDER[idx - 1];
        const prevEntered = enteredCounts[prevStage];
        conversionRate = prevEntered > 0 ? (enteredCounts[stage] / prevEntered) * 100 : 0;
      }
      return {
        stage,
        stageLabel: STAGE_LABELS[stage],
        count: currentCounts[stage],
        conversionRate: Math.min(100, Math.round(conversionRate * 10) / 10),
        value: values[stage],
      };
    });

    return result;
  },

  stageDuration(): StageDurationData[] {
    const stageDurations: Record<LeadStage, number[]> = {
      initial: [],
      needs: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };

    store.stageHistory.forEach((h) => {
      if (h.durationDays !== undefined && h.durationDays !== null) {
        stageDurations[h.stage].push(h.durationDays);
      }
    });

    return STAGE_ORDER.map((stage) => {
      const arr = stageDurations[stage];
      if (arr.length === 0) {
        return {
          stage,
          stageLabel: STAGE_LABELS[stage],
          avgDays: 0,
          medianDays: 0,
          minDays: 0,
          maxDays: 0,
        };
      }
      const sorted = [...arr].sort((a, b) => a - b);
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      return {
        stage,
        stageLabel: STAGE_LABELS[stage],
        avgDays: Math.round(avg * 10) / 10,
        medianDays: Math.round(median * 10) / 10,
        minDays: sorted[0],
        maxDays: sorted[sorted.length - 1],
      };
    });
  },

  closeCycle(): CloseCycleBucket[] {
    const wonLeads = store.leads.filter((l) => l.stage === "won");
    const cycles = wonLeads.map((l) => {
      const first = store.stageHistory
        .filter((h) => h.leadId === l.id)
        .sort(
          (a, b) =>
            new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime()
        )[0];
      if (!first) return 0;
      const closedAt =
        store.customers.find((c) => c.leadId === l.id)?.closedAt || l.updatedAt;
      return Math.ceil(
        (new Date(closedAt).getTime() - new Date(first.enteredAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    });

    const buckets: CloseCycleBucket[] = [
      { range: "0-7天", min: 0, max: 7, count: 0 },
      { range: "8-14天", min: 8, max: 14, count: 0 },
      { range: "15-30天", min: 15, max: 30, count: 0 },
      { range: "31-60天", min: 31, max: 60, count: 0 },
      { range: "60天以上", min: 61, max: Infinity, count: 0 },
    ];

    cycles.forEach((d) => {
      const bucket = buckets.find((b) => d >= b.min && d <= b.max);
      if (bucket) bucket.count += 1;
    });

    return buckets;
  },
};

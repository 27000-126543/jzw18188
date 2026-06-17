import { store } from "../db/store";
import { nanoid } from "../db/seed";
import type { SalesTarget } from "../../shared/types";

export const targetsService = {
  list(params?: { month?: string }): (SalesTarget & { userName?: string })[] {
    let result = [...store.salesTargets];
    if (params?.month) {
      result = result.filter((t) => t.month === params.month);
    }
    return result.map((t) => {
      const user = store.users.find((u) => u.id === t.userId);
      return { ...t, userName: user?.name };
    });
  },

  create(data: Partial<SalesTarget>): SalesTarget {
    const target: SalesTarget = {
      id: nanoid(),
      userId: data.userId || "",
      month: data.month || "",
      targetAmount: data.targetAmount || 0,
      targetCount: data.targetCount || 0,
      achievedAmount: data.achievedAmount || 0,
      achievedCount: data.achievedCount || 0,
    };
    store.salesTargets.push(target);
    return target;
  },

  update(id: string, data: Partial<SalesTarget>): SalesTarget | undefined {
    const idx = store.salesTargets.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;
    store.salesTargets[idx] = { ...store.salesTargets[idx], ...data };
    return store.salesTargets[idx];
  },
};

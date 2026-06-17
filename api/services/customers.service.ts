import { store } from "../db/store";
import type { Customer, Communication } from "../../shared/types";

export const customersService = {
  list(params?: { search?: string }): Customer[] {
    let result = [...store.customers];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById(id: string):
    | (Customer & { communications: Communication[] })
    | undefined {
    const customer = store.customers.find((c) => c.id === id);
    if (!customer) return undefined;
    const comms = store.communications
      .filter((c) => c.leadId === customer.leadId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((c) => {
        const user = store.users.find((u) => u.id === c.createdBy);
        return { ...c, createdByName: user?.name };
      });
    return { ...customer, communications: comms };
  },
};

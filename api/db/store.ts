import type {
  User,
  Lead,
  Communication,
  StageHistory,
  Customer,
  SalesTarget,
  Notification,
} from "../../shared/types";

export interface DataStore {
  users: User[];
  leads: Lead[];
  communications: Communication[];
  stageHistory: StageHistory[];
  customers: Customer[];
  salesTargets: SalesTarget[];
  notifications: Notification[];
}

export const store: DataStore = {
  users: [],
  leads: [],
  communications: [],
  stageHistory: [],
  customers: [],
  salesTargets: [],
  notifications: [],
};

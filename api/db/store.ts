import fs from "node:fs";
import path from "node:path";
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

const DATA_FILE = path.join(process.cwd(), "data", "db.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveToFile() {
  try {
    ensureDataDir();
    const data = {
      users: store.users,
      leads: store.leads,
      communications: store.communications,
      stageHistory: store.stageHistory,
      customers: store.customers,
      salesTargets: store.salesTargets,
      notifications: store.notifications,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save data to file:", e);
  }
}

export function loadFromFile(): boolean {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw) as DataStore;
      store.users = data.users || [];
      store.leads = data.leads || [];
      store.communications = data.communications || [];
      store.stageHistory = data.stageHistory || [];
      store.customers = data.customers || [];
      store.salesTargets = data.salesTargets || [];
      store.notifications = data.notifications || [];
      return true;
    }
  } catch (e) {
    console.error("Failed to load data from file:", e);
  }
  return false;
}

let saveTimeout: NodeJS.Timeout | null = null;

export function scheduleSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveToFile();
    saveTimeout = null;
  }, 100);
}

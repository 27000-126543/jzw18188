import { store } from "../db/store";
import type { User } from "../../shared/types";

export const usersService = {
  list(): User[] {
    return store.users;
  },

  getById(id: string): User | undefined {
    return store.users.find((u) => u.id === id);
  },
};

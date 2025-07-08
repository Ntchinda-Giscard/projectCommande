import { create } from 'zustand'

type Line = {
  itemCode: string;
  qty: number;
  price?: number;
};

type CommandParams = {
  site: string;         // e.g. "FR011"
  orderType: string;    // e.g. "SOI"
  customer: string;     // e.g. "AU002"
  date: string;         // "YYYYMMDD"
  shipSite: string;     // e.g. "FR011"
  currency: string;     // e.g. "EUR"
  lines: Line[];
};

interface CommandState {
  commandParams: CommandParams;
  setCommandParams: (params: CommandParams) => void;
}

export const useCommandStore = create<CommandState>()((set) => ({
  commandParams: {
    site: "FR011",
    orderType: "SOI",
    customer: "AU002",
    date: "20250707",
    shipSite: "FR011",
    currency: "EUR",
    lines: [],
  },
  setCommandParams: (params) => set({ commandParams: params }),
}))


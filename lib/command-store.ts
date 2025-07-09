import { create } from 'zustand'

const formatToCompactDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
};

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
  updateCommandField: <K extends keyof CommandParams>(key: K, value: CommandParams[K]) => void;

}

export const useCommandStore = create<CommandState>()((set) => ({
  commandParams: {
    site: "FR011",
    orderType: "SOI",
    customer: "FR001",
    date: formatToCompactDate(new Date()),
    shipSite: "FR011",
    currency: "EUR",
    lines: [],
  },
  setCommandParams: (params) => set({ commandParams: params }),

  updateCommandField: (key, value) =>
    set((state) => ({
      commandParams: {
        ...state.commandParams,
        [key]: value,
      },
    })),
}))


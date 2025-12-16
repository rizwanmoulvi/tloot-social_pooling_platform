import { create } from "zustand";
import { User, UserParticipation } from "@/types";
import { mockUser, mockUserParticipations } from "@/lib/mock-data";

interface UserStore {
  user: User | null;
  participations: UserParticipation[];
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setParticipations: (participations: UserParticipation[]) => void;
  updateTokenBalance: (balance: number) => void;
  updateXP: (xp: number) => void;
  updateReputation: (reputation: number) => void;
  addParticipation: (participation: UserParticipation) => void;
  loadMockUser: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  participations: [],
  isLoading: false,

  setUser: (user) => set({ user }),

  setParticipations: (participations) => set({ participations }),

  updateTokenBalance: (balance) =>
    set((state) => ({
      user: state.user ? { ...state.user, tokenBalance: balance } : null,
    })),

  updateXP: (xp) =>
    set((state) => ({
      user: state.user ? { ...state.user, xp, level: Math.floor(xp / 100) + 1 } : null,
    })),

  updateReputation: (reputation) =>
    set((state) => ({
      user: state.user ? { ...state.user, reputation } : null,
    })),

  addParticipation: (participation) =>
    set((state) => ({
      participations: [participation, ...state.participations],
      user: state.user
        ? { ...state.user, poolsJoined: state.user.poolsJoined + 1 }
        : null,
    })),

  loadMockUser: () =>
    set({
      user: mockUser,
      participations: mockUserParticipations,
    }),

  clearUser: () =>
    set({
      user: null,
      participations: [],
    }),
}));

import { create } from "zustand";

interface UIStore {
  isJoinPoolModalOpen: boolean;
  selectedPoolForJoin: string | null;
  isSidebarOpen: boolean;
  toast: {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
  };
  
  openJoinPoolModal: (poolId: string) => void;
  closeJoinPoolModal: () => void;
  toggleSidebar: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isJoinPoolModalOpen: false,
  selectedPoolForJoin: null,
  isSidebarOpen: false,
  toast: {
    message: "",
    type: "info",
    isVisible: false,
  },

  openJoinPoolModal: (poolId) =>
    set({
      isJoinPoolModalOpen: true,
      selectedPoolForJoin: poolId,
    }),

  closeJoinPoolModal: () =>
    set({
      isJoinPoolModalOpen: false,
      selectedPoolForJoin: null,
    }),

  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),

  showToast: (message, type) =>
    set({
      toast: {
        message,
        type,
        isVisible: true,
      },
    }),

  hideToast: () =>
    set((state) => ({
      toast: {
        ...state.toast,
        isVisible: false,
      },
    })),
}));

import { create } from 'zustand';

const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

export default useAppStore;



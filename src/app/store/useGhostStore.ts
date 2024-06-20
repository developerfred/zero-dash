import { create } from 'zustand';

const useGhostStore = create((set) => ({
    data: null,
    isLoading: false,
    error: null,

    fetchZineData: async (filter: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/zine?filter=${filter}`);
            const data = await response.json();
            set({ data, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch data', isLoading: false });
        }
    }
}));

export default useGhostStore;

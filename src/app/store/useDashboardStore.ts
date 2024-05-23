import create from 'zustand';
import { DataPoint, ZnsData } from '@/app/types';
import { persist } from 'zustand/middleware';

interface DashboardState {
    filter: string;
    data: DataPoint[];
    znsData: ZnsData[];
    znsDataCache: Record<string, ZnsData[]>;
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
    setZnsData: (data: ZnsData[], filter: string) => void;
    fetchDashboardData: (filter: string) => Promise<void>;
    fetchZnsData: (filter: string, limit?: number, offset?: number) => Promise<void>;
}

const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            filter: '24h',
            data: [],
            znsData: [],
            znsDataCache: {},

            setFilter: (filter: string) => set({ filter }),

            setData: (data: DataPoint[]) => set({ data }),

            setZnsData: (data: ZnsData[], filter: string) => {
                const cache = { ...get().znsDataCache, [filter]: data };
                set({ znsData: data, znsDataCache: cache });
            },

            fetchDashboardData: async (filter: string) => {
                try {
                    const response = await fetch(`/api/dashboard?filter=${filter}`);
                    if (!response.ok) {
                        throw new Error(`Error fetching dashboard data: ${response.statusText}`);
                    }
                    const result = await response.json();
                    set({ data: result.data });
                } catch (error) {
                    console.error('Error in fetchDashboardData:', error);
                }
            },

            fetchZnsData: async (filter: string, limit = 100, offset = 0) => {
                const cache = get().znsDataCache[filter];
                if (cache && cache.length > offset) {
                    set({ znsData: cache.slice(offset, offset + limit) });
                    return;
                }

                try {
                    const response = await fetch(`/api/zns?filter=${filter}&limit=${limit}&offset=${offset}`);
                    if (!response.ok) {
                        throw new Error(`Error fetching ZNS data: ${response.statusText}`);
                    }
                    const result = await response.json();
                    const newData = (cache || []).concat(result.data);
                    const newCache = { ...get().znsDataCache, [filter]: newData };
                    set({ znsData: newData.slice(offset, offset + limit), znsDataCache: newCache });
                } catch (error) {
                    console.error('Error in fetchZnsData:', error);
                }
            },
        }),
        {
            name: 'dashboard-storage',
            getStorage: () => localStorage,
        }
    )
);

export default useDashboardStore;

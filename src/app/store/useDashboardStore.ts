import create from 'zustand';
import { persist } from 'zustand/middleware';
import { DataPoint, ZnsData } from '@/app/types';

interface DashboardState {
    filter: string;
    data: DataPoint[];
    znsData: ZnsData[];
    znsDataCache: Record<string, ZnsData[]>;
    totals: {
        totalRegistrations: number;
        totalWorlds: number;
        totalDomains: number;
    };
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
    setZnsData: (data: ZnsData[], filter: string) => void;
    fetchDashboardData: (filter: string) => Promise<void>;
    fetchZnsData: (filter: string, limit?: number, offset?: number) => Promise<void>;
    fetchTotals: (filter: string) => Promise<void>;
}

const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            filter: '24h',
            data: [],
            znsData: [],
            znsDataCache: {},
            totals: {
                totalRegistrations: 0,
                totalWorlds: 0,
                totalDomains: 0,
            },

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
                    console.log(result);
                    const newData = (cache || []).concat(result.data);
                    const newCache = { ...get().znsDataCache, [filter]: newData };
                    set({ znsData: newData.slice(offset, offset + limit), znsDataCache: newCache });
                } catch (error) {
                    console.error('Error in fetchZnsData:', error);
                }
            },

            fetchTotals: async (filter: string) => {
                try {
                    const response = await fetch(`/api/domains?range=${filter}`);
                    if (!response.ok) {
                        throw new Error(`Error fetching totals data: ${response.statusText}`);
                    }
                    const result = await response.json();
                    set({ totals: result });
                } catch (error) {
                    console.error('Error in fetchTotals:', error);
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

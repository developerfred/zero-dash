import create from 'zustand';
import { persist } from 'zustand/middleware';
import { DataPoint, ZnsData, MetricsData } from '@/app/types';



interface DashboardState {
    filter: string;
    data: DataPoint[];
    zosData: MetricsData[];
    znsData: ZnsData[];
    znsDataCache: Record<string, ZnsData[]>;
    totals: {
        totalRegistrations: number;
        totalWorlds: number;
        totalDomains: number;
        dailyActiveUsers: number;
        totalMessagesSent: number;
        userSignUps: number;
        totalRewardsEarned: string;
    };
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
    setZosData: (data: MetricsData[]) => void;
    setZnsData: (data: ZnsData[], filter: string) => void;
    fetchDashboardData: (fromDate: string, toDate: string) => Promise<void>;
    fetchZnsData: (filter: string, limit?: number, offset?: number) => Promise<void>;
    fetchTotals: (filter: string) => Promise<void>;
    fetchDashboardDataByFilter: (filter: string) => Promise<void>;
}

const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
};

const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
};

const fetchAllData = async (fromDate: string, toDate: string): Promise<MetricsData> => {
    const response = await fetch(`/api/zos/metrics?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
};

const useDashboardStore = create<DashboardState>()(
    persist(
        (set, get) => ({
            filter: '24h',
            data: [],
            zosData: [],
            znsData: [],
            znsDataCache: {},
            totals: {
                totalRegistrations: 0,
                totalWorlds: 0,
                totalDomains: 0,
                dailyActiveUsers: 0,
                totalMessagesSent: 0,
                userSignUps: 0,
                totalRewardsEarned: '$0.00',
            },

            setFilter: (filter: string) => set({ filter }),

            setData: (data: DataPoint[]) => set({ data }),

            setZosData: (data: MetricsData[]) => set({ zosData: data }),

            setZnsData: (data: ZnsData[], filter: string) => {
                const cache = { ...get().znsDataCache, [filter]: data };
                set({ znsData: data, znsDataCache: cache });
            },

            fetchDashboardData: async (fromDate: string, toDate: string) => {
                try {
                    const data = await fetchAllData(fromDate, toDate);
                    set({ zosData: [data] }); 
                    set({
                        totals: {
                            dailyActiveUsers: data.dailyActiveUsers,
                            totalMessagesSent: data.totalMessagesSent,
                            userSignUps: data.userSignUps,
                            totalRewardsEarned: data.totalRewardsEarned,
                            totalRegistrations: get().totals.totalRegistrations,  
                            totalWorlds: get().totals.totalWorlds,  
                            totalDomains: get().totals.totalDomains 
                        }
                    });
                } catch (error) {
                    console.error('Error in fetchDashboardData:', error);
                }
            },

            fetchDashboardDataByFilter: async (filter: string) => {
                try {
                    const now = new Date();
                    let fromDate, toDate;

                    switch (filter) {
                        case '24h':
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
                            break;
                        case '7d':
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
                            break;
                        case '30d':
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
                            break;
                        case '90d':
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0];
                            break;
                        case '365d':
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 365)).toISOString().split('T')[0];
                            break;
                        case 'today':
                            fromDate = toDate = now.toISOString().split('T')[0];
                            break;
                        case 'yesterday':
                            toDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
                            fromDate = toDate;
                            break;
                        case 'last_week':                            
                            now.setDate(now.getDate() - now.getDay()); 
                            toDate = now.toISOString().split('T')[0];
                            fromDate = new Date(now.setDate(now.getDate() - 6)).toISOString().split('T')[0];
                            break;
                        case 'last_month':
                            now.setMonth(now.getMonth() - 1);
                            toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                            fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                            break;
                        case 'last_year':
                            now.setFullYear(now.getFullYear() - 1);
                            toDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
                            fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                            break;
                        default:                            
                            const dates = filter.split('_');
                            fromDate = dates[1];
                            toDate = dates[2];
                            break;
                    }

                    await get().fetchDashboardData(fromDate, toDate);
                } catch (error) {
                    console.error('Error in fetchDashboardDataByFilter:', error);
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

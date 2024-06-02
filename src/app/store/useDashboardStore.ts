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
        dailyActiveUsers: number;
        totalMessagesSent: number;
        userSignUps: number;
        totalRewardsEarned: string;
    };
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
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

const fetchAllData = async (fromDate: string, toDate: string): Promise<DataPoint[]> => {
    const data: DataPoint[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if ((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 60) {
        const response = await fetch(`/api/zos/metrics?fromDate=${fromDate}&toDate=${toDate}`);
        const result: DataPoint[] = await response.json();
        return result;
    }

    let currentStartDate = new Date(startDate);

    while (currentStartDate < endDate) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + 59);
        if (currentEndDate > endDate) {
            currentEndDate = endDate;
        }

        const response = await fetch(`/api/zos/metrics?fromDate=${currentStartDate.toISOString().split('T')[0]}&toDate=${currentEndDate.toISOString().split('T')[0]}`);
        const result: DataPoint[] = await response.json();
        data.push(...result);

        currentStartDate.setDate(currentStartDate.getDate() + 60);
    }

    return data;
};

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
                dailyActiveUsers: 0,
                totalMessagesSent: 0,
                userSignUps: 0,
                totalRewardsEarned: '$0.00',
            },

            setFilter: (filter: string) => set({ filter }),

            setData: (data: DataPoint[]) => set({ data }),

            setZnsData: (data: ZnsData[], filter: string) => {
                const cache = { ...get().znsDataCache, [filter]: data };
                set({ znsData: data, znsDataCache: cache });
            },

            fetchDashboardData: async (fromDate: string, toDate: string) => {
                try {
                    const data = await fetchAllData(fromDate, toDate);
                    const combinedData = data.reduce((acc, current) => {
                        const accRewards = parseCurrency(acc.totalRewardsEarned);
                        const currentRewards = parseCurrency(current.totalRewardsEarned.toString());
                        const totalRewards = accRewards + currentRewards;

                        return {
                            dailyActiveUsers: acc.dailyActiveUsers + current.dailyActiveUsers,
                            totalMessagesSent: acc.totalMessagesSent + current.totalMessagesSent,
                            userSignUps: acc.userSignUps + current.userSignUps,
                            newlyMintedDomains: acc.newlyMintedDomains + current.newlyMintedDomains,
                            totalRewardsEarned: formatCurrency(totalRewards),
                            totalRegistrations: acc.totalRegistrations, // Add this
                            totalWorlds: acc.totalWorlds, // Add this
                            totalDomains: acc.totalDomains // Add this
                        };
                    }, {
                        dailyActiveUsers: 0,
                        totalMessagesSent: 0,
                        userSignUps: 0,
                        newlyMintedDomains: 0,
                        totalRewardsEarned: '$0.00',
                        totalRegistrations: 0, // Add this
                        totalWorlds: 0, // Add this
                        totalDomains: 0 // Add this
                    });

                    set({ data, totals: combinedData });
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
                        default:
                            // Assuming custom date range passed in format `custom_yyyy-MM-dd_yyyy-MM-dd`
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

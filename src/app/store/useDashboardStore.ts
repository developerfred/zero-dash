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
}

const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
};

const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
};

const fetchAllData = async (fromDate: string, toDate: string): Promise<DataPoint> => {
    const data: DataPoint[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if ((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 60) {
        const response = await fetch(`/api/zos/metrics?fromDate=${fromDate}&toDate=${toDate}`);
        const result: DataPoint = await response.json();
        return result;
    }

    let currentStartDate = new Date(startDate);

    while (currentStartDate < endDate) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + 59);
        if (currentEndDate > endDate) {
            currentEndDate = endDate;
        }

        console.log(`Fetching data from ${currentStartDate.toISOString().split('T')[0]} to ${currentEndDate.toISOString().split('T')[0]}`);
        const response = await fetch(`/api/zos/metrics?fromDate=${currentStartDate.toISOString().split('T')[0]}&toDate=${currentEndDate.toISOString().split('T')[0]}`);
        const result: DataPoint = await response.json();
        console.log('Fetched data:', result);
        data.push(result);

        currentStartDate.setDate(currentStartDate.getDate() + 60);
    }

    const combinedData = data.reduce((acc, current) => {
        const accRewards = parseCurrency(acc.totalRewardsEarned);
        const currentRewards = parseCurrency(current.totalRewardsEarned);
        const totalRewards = accRewards + currentRewards;

        console.log(`Accumulated Rewards: ${accRewards}, Current Rewards: ${currentRewards}, Total Rewards: ${totalRewards}`);

        return {
            dailyActiveUsers: acc.dailyActiveUsers + current.dailyActiveUsers,
            totalMessagesSent: acc.totalMessagesSent + current.totalMessagesSent,
            userSignUps: acc.userSignUps + current.userSignUps,
            totalRewardsEarned: formatCurrency(totalRewards)
        };
    }, {
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        totalRewardsEarned: '$0.00'
    });

    console.log('Combined Data:', combinedData);
    return combinedData;
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
                    const combinedData = await fetchAllData(fromDate, toDate);
                    set({ totals: combinedData });
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

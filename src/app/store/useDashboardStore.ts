// @ts-nocheck
import create from 'zustand';
import { formatUnits } from 'viem';
import { DataPoint, ZnsData, MetricsData, GroupedData } from '@/app/types';
import { formatUSD } from '@/app/lib/currencyUtils';

interface DashboardState {
    filter: string;
    pairData: any;
    data: DataPoint[];
    zosData: MetricsData[];
    znsData: ZnsData[];
    znsDataCache: Record<string, GroupedData>;
    zosDataCache: Record<string, MetricsData[]>;
    totals: {
        totalRegistrations: number;
        totalWorlds: number;
        totalDomains: number;
        dailyActiveUsers: number;
        totalMessagesSent: number;
        userSignUps: number;
        newlyMintedDomains: number;
        totalRewardsEarned: string;
        dayCount: number;
    };
    tokenPriceInUSD: number | null;
    meowHolders: number | string;
    isLoadingDashboard: boolean;
    isLoadingZns: boolean;
    isLoadingPairData: boolean;
    setFilter: (filter: string) => void;
    setData: (data: DataPoint[]) => void;
    setZosData: (data: MetricsData[]) => void;
    setZnsData: (data: ZnsData[], filter: string) => void;
    fetchDashboardData: (fromDate: string, toDate: string) => Promise<void>;
    fetchZnsData: (filter: string, limit?: number, offset?: number) => Promise<void>;
    fetchTotals: (filter: string) => Promise<void>;
    fetchDashboardDataByFilter: (filter: string) => Promise<void>;
    fetchTokenPrice: () => Promise<void>;
    fetchPairData: () => Promise<void>;
}

const fetchAllData = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    const response = await fetch(`/api/zos/metrics?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
};

const fetchCurrentTokenPriceInUSD = async (): Promise<number> => {
    const response = await fetch('/api/meow/token-price');
    if (!response.ok) {
        throw new Error(`Error fetching MEOW price: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        price: data.price,
        holders: data.holders
    };
};


const fetchPairDataFromAPI = async (): Promise<any> => {
    const response = await fetch('/api/meow/pairs'); 
    if (!response.ok) {
        throw new Error(`Error fetching pair data: ${response.statusText}`);
    }
    return await response.json();
};

const useDashboardStore = create<DashboardState>((set, get) => ({
    filter: '24h',
    data: [],
    pairData: null,
    zosData: [],
    znsData: [],
    znsDataCache: {},
    zosDataCache: {},
    totals: {
        totalRegistrations: 0,
        totalWorlds: 0,
        totalDomains: 0,
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        newlyMintedDomains: 0,
        totalRewardsEarned: '0',
        dayCount: 0,
    },
    tokenPriceInUSD: null,
    meowHolders: 0,
    isLoadingDashboard: false,
    isLoadingZns: false,
    isLoadingPairData: false,

    setFilter: (filter: string) => set({ filter }),

    setData: (data: DataPoint[]) => set({ data }),

    setZosData: (data: MetricsData[]) => set({ zosData: data }),

    setZnsData: (data: ZnsData[], filter: string) => {
        const cache = { ...get().znsDataCache, [filter]: data };
        set({ znsData: data, znsDataCache: cache });
    },

    fetchTokenPrice: async () => {
        try {
            const info = await fetchCurrentTokenPriceInUSD();            
            set({ tokenPriceInUSD: info.price, meowHolders: info.holders  });
        } catch (error) {
            console.error('Error fetching token price:', error);
        }
    },

    fetchDashboardData: async (fromDate: string, toDate: string) => {
        try {
            set({ isLoadingDashboard: true });
            const data: DataPoint[] = await fetchAllData(fromDate, toDate);
            const tokenPriceInUSD = get().tokenPriceInUSD;

            if (tokenPriceInUSD === null) {
                throw new Error('Token price is not available');
            }

            const initialTotals = {
                dailyActiveUsers: 0,
                totalMessagesSent: 0,
                userSignUps: 0,
                newlyMintedDomains: 0,
                totalRewardsEarned: '0',
                totalRegistrations: 0,
                totalWorlds: 0,
                totalDomains: 0,
                dayCount: 0,
            };

            const totals = data.reduce((acc, curr) => {
                acc.dailyActiveUsers += curr.dailyActiveUsers;
                acc.totalMessagesSent += curr.totalMessagesSent;
                acc.userSignUps += curr.userSignUps;
                acc.newlyMintedDomains += curr.newlyMintedDomains;
                const rewardInEther = parseFloat(formatUnits(BigInt(curr.totalRewardsEarned.amount), curr.totalRewardsEarned.precision));
                const rewardInUSD = rewardInEther * tokenPriceInUSD;
                acc.totalRewardsEarned = (parseFloat(acc.totalRewardsEarned) + rewardInUSD).toString();
                acc.dayCount += 1;
                return acc;
            }, initialTotals);

            totals.dailyActiveUsers = Math.round(totals.dailyActiveUsers / totals.dayCount);
            totals.totalRewardsEarned = formatUSD(parseFloat(totals.totalRewardsEarned) * 100);

            set((state) => ({
                zosData: data,
                zosDataCache: { ...state.zosDataCache, [`${fromDate}_${toDate}`]: data },
                totals,
                isLoadingDashboard: false,
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({ isLoadingDashboard: false });
        }
    },

    fetchDashboardDataByFilter: async (filter: string) => {
        if (!filter) {
            throw new Error('Filter is required');
        }

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
                    if (filter && filter.includes('_')) {
                        const dates = filter.split('_');
                        fromDate = dates[1];
                        toDate = dates[2];
                    } else {
                        throw new Error(`Invalid filter format: ${filter}`);
                    }
                    break;
            }

            const { fetchTokenPrice, fetchDashboardData } = get();
            await fetchTokenPrice();
            await fetchDashboardData(fromDate, toDate);
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
            set({ isLoadingZns: true });
            const response = await fetch(`/api/zns?filter=${filter}&limit=${limit}&offset=${offset}`);
            if (!response.ok) {
                throw new Error(`Error fetching ZNS data: ${response.statusText}`);
            }
            const result = await response.json();
            const newData = (cache || []).concat(result.data);
            const newCache = { ...get().znsDataCache, [filter]: newData };
            set({ znsData: newData.slice(offset, offset + limit), znsDataCache: newCache, isLoadingZns: false });
        } catch (error) {
            console.error('Error in fetchZnsData:', error);
            set({ isLoadingZns: false });
        }
    },

    fetchTotals: async (filter: string) => {
        try {
            const response = await fetch(`/api/domains?range=${filter}`);
            if (!response.ok) {
                throw new Error(`Error fetching totals data: ${response.statusText}`);
            }
            const result: Record<string, GroupedData> = await response.json();
            const totals = {
                totalRegistrations: Object.values(result).reduce((acc, val) => acc + val.totalDomainRegistrations, 0),
                totalWorlds: Object.values(result).reduce((acc, val) => acc + val.totalWorlds, 0),
                totalDomains: Object.values(result).reduce((acc, val) => acc + val.totalDomains, 0),
            };
            set({ znsDataCache: result, totals });
        } catch (error) {
            console.error('Error in fetchTotals:', error);
        }
    },

    fetchPairData: async () => {
        try {
            set({ isLoadingPairData: true });
            const data = await fetchPairDataFromAPI();
            set({ pairData: data, isLoadingPairData: false });
        } catch (error) {
            console.error('Error fetching pair data:', error);
            set({ isLoadingPairData: false });
        }
    },
}));

export default useDashboardStore;

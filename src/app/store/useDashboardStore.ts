// @ts-nocheck

import { create } from 'zustand';
import { formatUnits } from 'viem';
import { DataPoint, MetricsData, GroupedData, DashboardState, Totals } from '@/app/types';
import { formatUSD } from '@/app/lib/currencyUtils';
import axios from 'axios';

const CACHE_TIMEOUT = 15 * 60 * 1000;
const API_URL_METRICS = process.env.NEXT_PUBLIC_METRICS_GO_URL!;

const getMetricsUrl = (filter) => {
    if (filter === "24h" || filter === "48h") {
        return `${API_URL_METRICS}/api/metrics/dynamic?filter=${filter}`;
    } else {
        return `${API_URL_METRICS}/api/metrics?filter=${filter}`;
    }
};

const calculateDateRange = (filter: string): { fromDate: string; toDate: string; } => {
    const now = new Date();
    let fromDate: string, toDate: string;

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (filter) {
        case '24h':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 1)));
            break;
        case '48h':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 2)));
            break;
        case '7d':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 7)));
            break;
        case '30d':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 30)));
            break;
        case '90d':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 90)));
            break;
        case '365d':
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 365)));
            break;
        case 'today':
            fromDate = toDate = formatDate(now);
            break;
        case 'yesterday':
            toDate = formatDate(new Date(now.setDate(now.getDate() - 1)));
            fromDate = toDate;
            break;
        case 'last_week':
            now.setDate(now.getDate() - now.getDay());
            toDate = formatDate(now);
            fromDate = formatDate(new Date(now.setDate(now.getDate() - 6)));
            break;
        case 'last_month':
            now.setMonth(now.getMonth() - 1);
            toDate = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
            fromDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
            break;
        case 'last_year':
            now.setFullYear(now.getFullYear() - 1);
            toDate = formatDate(new Date(now.getFullYear(), 11, 31));
            fromDate = formatDate(new Date(now.getFullYear(), 0, 1));
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

    return { fromDate, toDate };
};

const fetchAllData = async (fromDate: string, toDate: string, is15Minute: boolean = false): Promise<MetricsData[]> => {
    const url = `${API_URL_METRICS}/api/metrics?fromDate=${fromDate}&toDate=${toDate}&includeLast15Minutes=${is15Minute}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
};

const fetchDashboardDataFromTime = async (filter: string): Promise<{ metricsData: MetricsData[], totalRewards: { amount: string, unit: string }, totalMessagesSent: number, totalDailyActiveUsers: number, totalUserSignUps: number }> => {
    const url = getMetricsUrl(filter);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }

    return await response.json();
};


const fetchCurrentTokenPriceInUSD = async (): Promise<{ price: number; holders: number }> => {
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

const calculateDateTimestamp = (filter: string) => {
    const now = Date.now();
    let fromDate: number;
    let toDate = now;

    switch (filter) {
        case '24h':
            fromDate = now - 24 * 60 * 60 * 1000;
            break;
        case '48h':
            fromDate = now - 48 * 60 * 60 * 1000;
            break;
        case '7d':
            fromDate = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case '30d':
            fromDate = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case '90d':
            fromDate = now - 90 * 24 * 60 * 60 * 1000;
            break;
        default:
            throw new Error('Invalid filter');
    }

    return { fromDate, toDate };
};

const useDashboardStore = create<DashboardState>((set, get) => ({
    filter: '7d',
    data: [],
    activeSection: 'Zero',
    pairData: null,
    zosData: [],
    znsData: [],
    znsDataCache: {},
    zosDataCache: {},
    rewardsDataCache: {},
    totalsCache: {},
    cacheTimestamps: {},
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
    rewardsData: [],
    tokenPriceInUSD: null,
    meowHolders: 0,
    volume: 0,
    holderCount: 0,
    lpHolderCount: 0,
    isLoadingDashboard: false,
    isLoadingZns: false,
    isLoadingPairData: false,
    isInfoLoading: false,

    setFilter: (filter: string) => {
        const { activeSection } = get();
        localStorage.setItem('selectedOption', filter);
        set({ filter });
    },

    setActiveSection: (section: string) => {
        const { filter } = get();
        set({ activeSection: section });
    },

    setData: (data: DataPoint[]) => set({ data }),

    setZosData: (data: MetricsData[]) => set({ zosData: data }),

    fetchTokenPrice: async () => {
        try {
            const info = await fetchCurrentTokenPriceInUSD();
            set({ tokenPriceInUSD: info.price, meowHolders: info.holders });
        } catch (error) {
            console.error('Error fetching token price:', error);
        }
    },

    fetchDashboardData: async (fromDate: string, toDate: string, is15Minute?: boolean) => {
        try {
            set({ isLoadingDashboard: true });
            const data: DataPoint[] = await fetchAllData(fromDate, toDate, is15Minute);
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

            const rewardsData: { date: string; totalRewardsEarned: number }[] = [];

            const totals = data.reduce((acc, curr) => {
                acc.dailyActiveUsers += curr.dailyActiveUsers;
                acc.totalMessagesSent += curr.totalMessagesSent;
                acc.userSignUps += curr.userSignUps;
                acc.newlyMintedDomains += curr.newlyMintedDomains;
                const rewardInEther = parseFloat(formatUnits(BigInt(curr.totalRewardsEarned.amount), curr.totalRewardsEarned.precision));
                const rewardInUSD = rewardInEther * tokenPriceInUSD;
                acc.totalRewardsEarned = (parseFloat(acc.totalRewardsEarned) + rewardInUSD).toString();
                rewardsData.push({ date: curr.date, totalRewardsEarned: rewardInUSD });
                acc.dayCount += 1;
                return acc;
            }, initialTotals);

            totals.dailyActiveUsers = Math.round(totals.dailyActiveUsers / totals.dayCount);
            totals.totalRewardsEarned = formatUSD(parseFloat(totals.totalRewardsEarned) * 100);

            set((state) => ({
                zosData: data,
                zosDataCache: { ...state.zosDataCache, [`${fromDate}_${toDate}`]: data },
                totals,
                rewardsData,
                isLoadingDashboard: false,
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({ isLoadingDashboard: false });
        }
    },

    calculateRewardInUSD: (amount: string, precision: number, tokenPriceInUSD: number): number => {
        const rewardInEther = parseFloat(formatUnits(BigInt(amount), precision));
        return rewardInEther * tokenPriceInUSD;
    },

    sumTotals: (data: DataPoint[], tokenPriceInUSD: number): Totals => {
        const initialTotals: Totals = {
            dailyActiveUsers: 0,
            totalMessagesSent: 0,
            userSignUps: 0,
            newlyMintedDomains: 0,
            totalRewardsEarned: 0,
            dayCount: 0,
        };

        return data.reduce((acc, curr) => ({
            dailyActiveUsers: acc.dailyActiveUsers + curr.dailyActiveUsers,
            totalMessagesSent: acc.totalMessagesSent + curr.totalMessagesSent,
            userSignUps: acc.userSignUps + curr.userSignUps,
            newlyMintedDomains: acc.newlyMintedDomains + curr.newlyMintedDomains,
            totalRewardsEarned: acc.totalRewardsEarned + calculateRewardInUSD(
                curr.totalRewardsEarned.amount,
                curr.totalRewardsEarned.precision,
                tokenPriceInUSD
            ),
            dayCount: acc.dayCount + 1,
        }), initialTotals);
    },

    calculateAverages: (totals: Totals): Totals => ({
        ...totals,
        dailyActiveUsers: Math.round(totals.dailyActiveUsers / totals.dayCount),
        totalRewardsEarned: formatUSD(totals.totalRewardsEarned * 100),
    }),

    extractRewardsData: (data: DataPoint[], tokenPriceInUSD: number): RewardData[] =>
        data.map(item => ({
            date: item.date,
            totalRewardsEarned: calculateRewardInUSD(
                item.totalRewardsEarned.amount,
                item.totalRewardsEarned.precision,
                tokenPriceInUSD
            ),
        })),

    cardTotals: {
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        totalRewardsEarned: '0',
    },
    isLoadingCards: false,

    fetchCardData: async (filter: string) => {
        if (['24h', '48h', '7d'].includes(filter)) {
            try {
                const { fromDate, toDate } = calculateDateTimestamp(filter);
                const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';
                const response = await axios.get(`${API_URL}?fromTs=${fromDate}&toTs=${toDate}`);
                const data = response.data;

                set({
                    cardTotals: {
                        dailyActiveUsers: data.dailyActiveUsers,
                        totalMessagesSent: data.totalMessagesSent,
                        userSignUps: data.userSignUps,
                        totalRewardsEarned: data.totalRewardsEarned || '0', 
                    },
                    isLoadingCards: false,
                });
            } catch (error) {
                console.error('Error fetching card data:', error);
                set({ isLoadingCards: false });
            }
        } else {
            set({ isLoadingCards: false });
        }
    },

    fetchDashboardData: async (fromDate: string, toDate: string, is15Minute?: boolean) => {
        try {
            set({ isLoadingDashboard: true });
            const data: DataPoint[] = await fetchAllData(fromDate, toDate, is15Minute);
            const tokenPriceInUSD = get().tokenPriceInUSD;

            if (tokenPriceInUSD === null) {
                throw new Error('Token price is not available');
            }

            const totals = sumTotals(data, tokenPriceInUSD);
            const averagedTotals = calculateAverages(totals);
            const rewardsData = extractRewardsData(data, tokenPriceInUSD);

            set((state) => ({
                zosData: data,
                zosDataCache: { ...state.zosDataCache, [`${fromDate}_${toDate}`]: data },
                totals: averagedTotals,
                rewardsData,
                isLoadingDashboard: false,
            }));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({ isLoadingDashboard: false });
        }
    },


    fetchDashboardDataByFilter: async (filter: string, forceRefresh = false) => {
        if (!filter) {
            throw new Error('Filter is required');
        }

        try {
            const { activeSection, cacheTimestamps } = get();
            const cacheKey = `${filter}_${activeSection}`;
            const now = Date.now();

            if (!forceRefresh && get().zosDataCache[cacheKey] && (now - cacheTimestamps[cacheKey]) < CACHE_TIMEOUT) {
                const cachedData = {
                    zosData: get().zosDataCache[cacheKey],
                    rewardsData: get().rewardsDataCache[cacheKey],
                    totals: get().totalsCache[cacheKey],
                };
                set(cachedData);
                return;
            }

            set({ isLoadingDashboard: true });

            if ((filter === '24h' || filter === '48h' || filter === '7d') && activeSection === 'Zero') {
                const { metricsData, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps } = await fetchDashboardDataFromTime(filter);
                
                
                const { fromDate, toDate } = calculateDateTimestamp(filter);
                const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';
                const response = await axios.get(`${API_URL}?fromTs=${fromDate}&toTs=${toDate}`);
                const data = response.data;
                
                const rewardsData: { date: string; totalRewardsEarned: number }[] = [];

                const totals = {
                    dailyActiveUsers: data.dailyActiveUsers,
                    totalMessagesSent: data.totalMessagesSent,
                    userSignUps: data.userSignUps,
                    newlyMintedDomains: metricsData.reduce((acc, curr) => acc + curr.newlyMintedDomains, 0),
                    totalRewardsEarned: totalRewards,
                    totalRegistrations: 0,
                    totalWorlds: 0,
                    totalDomains: 0,                    
                };

                const updatedData = {
                    zosData: metricsData,
                    zosDataCache: { ...get().zosDataCache, [cacheKey]: metricsData },
                    rewardsData,
                    rewardsDataCache: { ...get().rewardsDataCache, [cacheKey]: rewardsData },
                    totals,
                    totalsCache: { ...get().totalsCache, [cacheKey]: totals },
                    cacheTimestamps: { ...get().cacheTimestamps, [cacheKey]: now },
                    isLoadingDashboard: false,
                };
                set(updatedData);
            } else if ((filter === '30d' || filter === '90d' || filter === '365d') && activeSection === 'Zero') {
                const { metricsData, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps } = await fetchDashboardDataFromTime(filter);

                const rewardsData: { date: string; totalRewardsEarned: number }[] = [];
                let days;

                switch (filter) {
                    case '30d':
                        days = 30;
                        break;
                    case '90d':
                        days = 90;
                        break;
                    case '365d':
                        days = 365;
                        break;
                    default:
                        days = 30;
                }

                const rewardPerDay = parseFloat(totalRewards.amount) / days;

                for (let i = 0; i < days; i++) {
                    const dayTimestamp = new Date(new Date().setDate(new Date().getDate() - i)).toISOString();
                    rewardsData.push({ date: dayTimestamp, totalRewardsEarned: rewardPerDay });
                }

                const totals = {
                    dailyActiveUsers: totalDailyActiveUsers,
                    totalMessagesSent: totalMessagesSent,
                    userSignUps: totalUserSignUps,
                    newlyMintedDomains: metricsData.reduce((acc, curr) => acc + curr.newlyMintedDomains, 0),
                    totalRewardsEarned: totalRewards,
                    totalRegistrations: 0,
                    totalWorlds: 0,
                    totalDomains: 0,
                    dayCount: days,
                };

                const updatedData = {
                    zosData: metricsData,
                    zosDataCache: { ...get().zosDataCache, [cacheKey]: metricsData },
                    rewardsData,
                    rewardsDataCache: { ...get().rewardsDataCache, [cacheKey]: rewardsData },
                    totals,
                    totalsCache: { ...get().totalsCache, [cacheKey]: totals },
                    cacheTimestamps: { ...get().cacheTimestamps, [cacheKey]: now },
                    isLoadingDashboard: false,
                };
                set(updatedData);
            }else {
                const { fromDate, toDate } = calculateDateRange(filter);
                const { fetchTokenPrice, fetchDashboardData } = get();
                await fetchTokenPrice();
                await fetchDashboardData(fromDate, toDate);
                set(state => ({
                    cacheTimestamps: { ...state.cacheTimestamps, [cacheKey]: now },
                    isLoadingDashboard: false,
                }));
            }
        } catch (error) {
            console.error('Error in fetchDashboardDataByFilter:', error);
            set({ isLoadingDashboard: false });
        }
    },

    fetchTotals: async (filter: string) => {
        const cacheKey = filter;
        const state = get();

        const cachedData = state.znsDataCache[cacheKey];
        if (cachedData) {
            set({
                totals: {
                    totalRegistrations: cachedData.totalDomainRegistrations,
                    totalWorlds: cachedData.totalWorlds,
                    totalDomains: cachedData.totalDomains,
                }
            });
            return;
        }

        try {
            set({ isLoadingZns: true });
            const response = await fetch(`/api/domains?range=${filter}`);
            if (!response.ok) {
                throw new Error(`Error fetching totals data: ${response.statusText}`);
            }
            const result: Record<string, GroupedData> = await response.json();
            const totals = calculateTotals(result);

            set((state) => ({
                znsDataCache: { ...state.znsDataCache, [cacheKey]: result },
                totals,
                isLoadingZns: false,
            }));
        } catch (error) {
            console.error('Error in fetchTotals:', error);
            set({ isLoadingZns: false });
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

    fetchMeowInfo: async () => {
        set({ isInfoLoading: true });
        try {
            const response = await axios.get('/api/meow/info');
            const { volume, holder_count, lp_holder_count } = response.data;
            set({
                volume,
                holdersCount: holder_count,
                lpHolderCount: lp_holder_count,
                isInfoLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch wild info:', error);
            set(
                { isInfoLoading: false });
        }
    },
}));

const calculateTotals = (data: Record<string, GroupedData>): Totals => {
    return {
        totalRegistrations: Object.values(data).reduce((acc, val) => acc + val.totalDomainRegistrations, 0),
        totalWorlds: Object.values(data).reduce((acc, val) => acc + val.totalWorlds, 0),
        totalDomains: Object.values(data).reduce((acc, val) => acc + val.totalDomains, 0),
    };
};

export default useDashboardStore;
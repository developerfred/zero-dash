import { create } from 'zustand';
import axios from 'axios';

interface ZeroGlobalState {
    filter: string;
    totals: {
        dailyActiveUsers: number;
        totalMessagesSent: number;
        userSignUps: number;
        totalRewardsEarned: string;
    };
    zosData: any[];
    rewardsData: any[];
    isLoading: boolean;
    setFilter: (filter: string) => void;
    fetchDashboardDataByFilter: (filter: string) => void;
}

const useZeroGlobalStore = create<ZeroGlobalState>((set) => ({
    filter: '7d',
    totals: {
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        totalRewardsEarned: '0',
    },
    zosData: [],
    rewardsData: [],
    isLoading: false,

    setFilter: (filter: string) => set({ filter }),

    fetchDashboardDataByFilter: async (filter: string) => {
        set({ isLoading: true });

        const cacheKey = `dashboardData_${filter}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const { totals, zosData, rewardsData } = JSON.parse(cachedData);
            set({
                totals,
                zosData,
                rewardsData,
                isLoading: false,
            });
        }

        try {
            const response = await axios.get(`/api/zos/metrics?filter=${filter}`);
            const data = response.data;

            const totals = {
                dailyActiveUsers: data.dailyActiveUsers,
                totalMessagesSent: data.totalMessagesSent,
                userSignUps: data.userSignUps,
                totalRewardsEarned: data.totalRewardsEarned,
            };

            const newState = {
                totals,
                zosData: data.zosData,
                rewardsData: data.rewardsData,
                isLoading: false,
            };

            set(newState);
            localStorage.setItem(cacheKey, JSON.stringify(newState));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({ isLoading: false });
        }
    },
}));

export default useZeroGlobalStore;

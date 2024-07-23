// @ts-nocheck

import { create } from 'zustand';
import axios from 'axios';

interface RacingStore {
    data: any;
    cardsData: {
        totalPlayers: number;
        totalSoloRaces: number;
        totalMpRaces: number;
        totalLaps: number;
        averageLapTime: string;
        uniquePlayersCount: number;
        maxLapsPlayer: string;
        minLapsPlayer: string;
        averageLapsPerPlayer: string;
        retentionRate: string;
        lapTimeDistribution: {
            fast: number;
            medium: number;
            slow: number;
        };
    };
    rechartsData: any;
    isLoading: boolean;
    fetchRacingData: (filter: string) => void;
}

export const formatToMillion = (value: number): string => {
    if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
};

const useRacingStore = create<RacingStore>((set) => ({
    data: {},
    cardsData: {
        totalPlayers: 0,
        totalSoloRaces: 0,
        totalMpRaces: 0,
        totalLaps: 0,
        averageLapTime: '0.00',
        uniquePlayersCount: 0,
        maxLapsPlayer: '',
        minLapsPlayer: '',
        averageLapsPerPlayer: '0.00',
        retentionRate: '0.00%',
        lapTimeDistribution: {
            fast: 0,
            medium: 0,
            slow: 0,
        },
    },
    rechartsData: {},
    isLoading: false,

    fetchRacingData: async (filter: string) => {
        set({ isLoading: true });
        try {
            const response = await axios.post('https://dashboard.zero.tech/api/racing/players', { filter });
            const { data, cardsData, rechartsData } = response.data;
                        
            const formattedCardsData = {
                ...cardsData,
                averageLapTime: cardsData.averageLapTime.toString(),
                retentionRate: `${cardsData.retentionRate}%`
            };

            set({ data, cardsData: formattedCardsData, rechartsData });
        } catch (error) {
            console.error('Failed to fetch racing data:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));

export default useRacingStore;

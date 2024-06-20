// @ts-nocheck

import { create } from 'zustand';
import axios from 'axios';

const CHAIN_BASE_KEY = process.env.CHAIN_BASE_KEY;

interface WildStore {
    totalDaos: number;
    totalBalances: { [key: string]: number };
    tokenBalances: { [key: string]: number };
    isLoading: boolean;
    isPriceLoading: boolean;
    fetchData: () => void;
}

const useWildStore = create<WildStore>((set) => ({
    totalDaos: 0,
    totalBalances: { ETH: 0, WILD: 0 },
    tokenBalances: { ETH: 0, WETH: 0, WILD: 0 },
    isLoading: false,
    isPriceLoading: false,

    fetchData: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get('/api/wild/dao');
            const { totalDaos, totalBalances, tokenBalances } = response.data;            

            set({ isPriceLoading: true });
            const pricesResponse = await axios.get('/api/wild/prices');
            const ethPrice = pricesResponse.data.ETH ?? 0;
            const wethPrice = pricesResponse.data.WETH ?? 0;
            const wildPrice = pricesResponse.data.WILD ?? 0;
           

            const totalBalancesUSD = {
                ETH: totalBalances.ETH * ethPrice,
                WILD: totalBalances.WILD * wildPrice,
            };


            const formatToMillion = (value: number): string => {
                if (value >= 1e6) {
                    return `$${(value / 1e6).toFixed(2)}M`;
                }
                return `$${value.toFixed(2)}`;
            };

            
            const formattedBalancesUSD = {
                ETH: formatToMillion(totalBalancesUSD.ETH),
                WILD: formatToMillion(totalBalancesUSD.WILD),
                GLOBAL: formatToMillion(totalBalancesUSD.ETH +totalBalancesUSD.WILD),
            };

            
            set({ totalDaos, totalBalances: formattedBalancesUSD, tokenBalances });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            set({ isLoading: false, isPriceLoading: false });
        }
    },
}));

export default useWildStore;

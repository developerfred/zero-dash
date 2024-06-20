// @ts-nocheck

import { create } from 'zustand';
import axios from 'axios';

interface WildStore {
    totalDaos: number;
    totalBalances: { [key: string]: number };
    tokenBalances: { [key: string]: number };    
    transactionCount: number;
    isLoading: boolean;
    isPriceLoading: boolean;
    aggregatedTransactionsData: { date: string, count: number }[];
    isTransactionsLoading: boolean;
    isInfoLoading: boolean;
    volume: number;
    holderCount: number;
    lpHolderCount: number;
    fetchTransactions: (fromDate?: string, toDate?: string) => void;
    fetchData: () => void;    
    fetchWildInfo: () => void;
}

export const formatToMillion = (value: number): string => {
    if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
};

const useWildStore = create<WildStore>((set) => ({
    totalDaos: 0,
    totalBalances: { ETH: 0, WILD: 0 },
    tokenBalances: { ETH: 0, WETH: 0, WILD: 0 },
    aggregatedTransactionsData: [],
    transactionCount: 0,
    isLoading: false,
    isPriceLoading: false,
    isTransactionsLoading: false,
    isInfoLoading: false,
    volume: 0,
    holderCount: 0,
    lpHolderCount: 0,
    

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

    fetchTransactions: async (fromDate?: string, toDate?: string) => {
        set({ isTransactionsLoading: true });
        try {
            const response = await axios.get('/api/wild/dao-transactions', {
                params: {
                    fromDate,
                    toDate,
                },
            });
            const aggregatedTransactionsData = response.data;
            const transactionCount = aggregatedTransactionsData.reduce((acc: number, transaction: { count: number }) => acc + transaction.count, 0);

            set({ aggregatedTransactionsData, transactionCount });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            set({ isTransactionsLoading: false });
        }
    },

    fetchWildInfo: async () => {
        set({ isInfoLoading: true });
        try {
            const response = await axios.get('/api/wild/info');
            const { volume, holder_count, lp_holder_count } = response.data;
            set({
                volume: formatToMillion(volume),
                holderCount: holder_count,
                lpHolderCount: lp_holder_count,
                isInfoLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch wild info:', error);
            set({ isInfoLoading: false });
        }
    },
}));


export default useWildStore;

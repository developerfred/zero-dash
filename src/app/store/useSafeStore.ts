import create from 'zustand';
import axios from 'axios';

interface Balance {
    tokenAddress: string | null;
    token: {
        name: string;
        symbol: string;
        decimals: number;
        logoUri: string;
    } | null;
    balance: string;
}

interface Transaction {
    date: string;
    numberOfTransactions: number;
    transactions: any[];
}

interface SafeState {
    balances: Balance[];
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    fetchSafeData: (filter: string) => Promise<void>;
}

const useSafeStore = create<SafeState>((set) => ({
    balances: [],
    transactions: [],
    isLoading: false,
    error: null,
    fetchSafeData: async (filter = '7d') => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get(`/api/dao/safe-balances?filter=${filter}`);
            set({
                balances: response.data.balances,
                transactions: response.data.transactions,
                isLoading: false
            });
        } catch (error) {
            set({ error: 'Failed to fetch data', isLoading: false });
        }
    }
}));

export default useSafeStore;

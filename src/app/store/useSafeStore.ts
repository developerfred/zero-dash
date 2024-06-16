import create from 'zustand';
import axios from 'axios';

const useSafeStore = create((set) => ({
    balances: [],
    transactions: [],
    isLoading: false,
    error: null,
    fetchSafeData: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get('/api/dao/safe-balances');
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

import { create } from 'zustand';


interface ChartState {
    chartData: any[];
    chartDataCache: { [key: string]: any[] };
    isLoadingChart: boolean;
    fetchChartData: (coins: string, start: Date, end: Date) => void;
}

const useChartStore = create<ChartState>((set) => ({
    chartData: [],
    chartDataCache: {},
    isLoadingChart: false,
    fetchChartData: async (coins, start, end) => {
        try {
            set({ isLoadingChart: true });

            const startISO = start.toISOString();
            const endISO = end.toISOString();

            const response = await fetch(`/api/meow/chart?coins=${encodeURIComponent(coins)}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`);
            if (!response.ok) {
                throw new Error(`Error fetching chart data: ${response.statusText}`);
            }
            const data = await response.json();

            set((state) => ({
                chartData: data,
                isLoadingChart: false,
            }));
        } catch (error) {
            console.error('Error fetching chart data:', error);
            set({ isLoadingChart: false });
        }
    },
}));

export default useChartStore;

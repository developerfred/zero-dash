import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MetricsData {
  date: string;
  dailyActiveUsers: number;
  totalMessagesSent: number;
  userSignUps: number;
  newlyMintedDomains: number;
  totalRewardsEarned: {
    amount: string;
    unit: string;
    precision: number;
  };
}

interface MetricsStore {
  data: MetricsData[];
  loading: boolean;
  error: string | null;
  fetchMetricsData: (filter: string) => void;
}

const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';
const API_URL_METRICS = process.env.NEXT_PUBLIC_API_METRICS;

const getTokenPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://zero-dash.vercel.app/api/meow/token-price');
    if (!response.ok) {
      throw new Error(`Error fetching MEOW price: ${response.statusText}`);
    }
    const data = await response.json();
    return data.price;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
};

const fetchMetricsData = async (fromTs: number, toTs: number): Promise<MetricsData[]> => {
  try {
    const response = await fetch(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return normalizeData(data, fromTs);
  } catch (error) {
    console.error('Error fetching metrics data:', error);
    return [];
  }
};

const normalizeData = (data: any, timestamp: number): MetricsData[] => {
  const date = new Date(timestamp);
  const pstOffset = -8 * 60 * 60 * 1000;  
  const pstDate = new Date(date.getTime() + pstOffset);
  const humanReadableTime = pstDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'PST' });
  const humanReadableDate = pstDate.toISOString().split('T')[0];

  if (Array.isArray(data)) {
    return data.map(entry => ({ ...entry, timestamp, humanReadableTime, humanReadableDate }));
  } else if (typeof data === 'object' && data !== null) {
    return [{ ...data, timestamp, humanReadableTime, humanReadableDate }];
  } else {
    throw new Error('Unexpected response format');
  }
};

export const useMetricsChartStore = create<MetricsStore>(devtools((set) => ({
  data: [],
  loading: false,
  error: null,
  fetchMetricsData: async (filter: string) => {
    set({ loading: true, error: null });
    const now = Date.now();
    const fromTs = filter === '24h' ? now - 24 * 60 * 60 * 1000
      : filter === '48h' ? now - 48 * 60 * 60 * 1000
        : filter === '7d' ? now - 7 * 24 * 60 * 60 * 1000
          : filter === '30d' ? now - 30 * 24 * 60 * 60 * 1000
            : now - 365 * 24 * 60 * 60 * 1000;

    try {
      const data = await fetchMetricsData(fromTs, now);
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
})));

// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { formatUnits } from 'viem';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';
const API_URL_METRICS = process.env.NEXT_PUBLIC_API_METRICS;

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

const CACHE_DURATION = 15 * 60 * 1000;

const getTokenPrice = async (): Promise<number> => {
    const response = await fetch('https://zero-dash.vercel.app/api/meow/token-price');
    if (!response.ok) {
        throw new Error(`Error fetching MEOW price: ${response.statusText}`);
    }
    const data = await response.json();
    return data.price;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (filter !== '24h' && filter !== '48h') {
        return res.status(400).json({ error: 'Invalid filter. Only 24h and 48h are supported.' });
    }

    const now = Date.now();
    const fromTs = filter === '24h' ? now - 24 * 60 * 60 * 1000 : now - 48 * 60 * 60 * 1000;

    try {
        const data = await fetchMetricsDataInChunks(fromTs, now);

        const tokenPrice = await getTokenPrice();
        const { metricsData, totalRewards } = await addTotalRewardsToData(data, filter, tokenPrice);

        const response = {
            metricsData,
            totalRewards
        };

        await saveDataToSupabase(filter as string, response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
};

const fetchMetricsDataInChunks = async (fromTs: number, toTs: number): Promise<any[]> => {
    const interval = 15 * 60 * 1000;
    const promises = [];

    for (let ts = fromTs; ts < toTs; ts += interval) {
        promises.push(fetchMetricsData(ts, ts + interval));
    }

    const results = await Promise.all(promises);
    return results.flat();
};

const fetchMetricsData = async (fromTs: number, toTs: number): Promise<any[]> => {
    const response = await fetch(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return normalizeData(data, fromTs);
};

const fetchMetricsDataByDate = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    const response = await fetch(`${API_URL_METRICS}?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return Object.entries(data).map(([date, metrics]: [string, any]) => ({
        date,
        ...metrics,
    }));
};

const normalizeData = (data: any, timestamp: number): any[] => {
    const date = new Date(timestamp);
    const humanReadableTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const humanReadableDate = date.toISOString().split('T')[0];

    if (Array.isArray(data)) {
        return data.map(entry => ({ ...entry, timestamp, humanReadableTime, humanReadableDate }));
    } else if (typeof data === 'object' && data !== null) {
        return [{ ...data, timestamp, humanReadableTime, humanReadableDate }];
    } else {
        throw new Error('Unexpected response format');
    }
};

const addTotalRewardsToData = async (data: any[], filter: string, tokenPrice: number): Promise<{ metricsData: any[], totalRewards: { amount: string, unit: string } }> => {
    if (data.length === 0) return { metricsData: data, totalRewards: null };

    const firstDate = data[0].humanReadableDate;
    const lastDate = data[data.length - 1].humanReadableDate;

    const metricsData = await fetchMetricsDataByDate(firstDate, lastDate);

    let totalRewards = { amount: "0.00", unit: "USD" };

    if (filter === '24h') {
        const lastItemMetrics = metricsData[metricsData.length - 1];
        if (lastItemMetrics && lastItemMetrics.totalRewardsEarned) {
            const lastRewardInEther = parseFloat(formatUnits(BigInt(lastItemMetrics.totalRewardsEarned.amount), lastItemMetrics.totalRewardsEarned.precision));
            totalRewards.amount = (lastRewardInEther * tokenPrice).toFixed(2);
        }
    } else if (filter === '48h') {
        const firstItemMetrics = metricsData[0];
        const lastItemMetrics = metricsData[metricsData.length - 1];
        if (firstItemMetrics && lastItemMetrics) {
            const firstRewardInEther = parseFloat(formatUnits(BigInt(firstItemMetrics.totalRewardsEarned.amount), firstItemMetrics.totalRewardsEarned.precision));
            const lastRewardInEther = parseFloat(formatUnits(BigInt(lastItemMetrics.totalRewardsEarned.amount), lastItemMetrics.totalRewardsEarned.precision));
            totalRewards.amount = ((firstRewardInEther + lastRewardInEther) * tokenPrice).toFixed(2);
        }
    }

    return { metricsData: data, totalRewards };
};

const saveDataToSupabase = async (filter: string, data: any) => {
    const { data: supabaseData, error } = await supabase
        .from('metrics')
        .insert([
            {
                filter,
                data,
                timestamp: new Date().toISOString(),
            },
        ]);

    if (error) {
        console.error('Error saving data to Supabase:', error);
    } else {
        console.log('Data saved to Supabase:', supabaseData);
    }
};

export default handler;

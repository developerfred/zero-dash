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

const getTokenPrice = async (): Promise<number> => {
    const response = await fetch('https://zero-dash.vercel.app/api/meow/token-price');
    if (!response.ok) {
        throw new Error(`Error fetching MEOW price: ${response.statusText}`);
    }
    const data = await response.json();
    return data.price;
};

const fetchMetricsDataInChunks = async (fromTs: number, toTs: number): Promise<any[]> => {
    const interval = 30 * 60 * 1000;
    const promises = [];

    for (let ts = fromTs; ts < toTs; ts += interval) {
        promises.push(fetchMetricsData(ts, ts + interval));
    }

    const results = await Promise.allSettled(promises);
    const fulfilledResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any[]>).value);
    return fulfilledResults.flat();
};

const fetchMetricsData = async (fromTs: number, toTs: number): Promise<any[]> => {
    const response = await fetchWithTimeout(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`, 10000);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return normalizeData(data, fromTs);
};

const fetchWithTimeout = (resource: string, options: number): Promise<Response> => {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(id));
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

const saveDataToSupabase = async (filter: string, data: any) => {
    if (data.totalDailyActiveUsers > 0 || data.totalMessagesSent > 0 || data.totalUserSignUps > 0 || parseFloat(data.totalRewards.amount) > 0) {
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
    } else {
        console.log('No valid data to save to Supabase.');
    }
};

const addTotalRewardsToData = async (data: any[], filter: string, tokenPrice: number): Promise<{ metricsData: any[], totalRewards: { amount: string, unit: string }, totalMessagesSent: number, totalDailyActiveUsers: number, totalUserSignUps: number }> => {
    if (data.length === 0) return { metricsData: data, totalRewards: { amount: "0.00", unit: "USD" }, totalMessagesSent: 0, totalDailyActiveUsers: 0, totalUserSignUps: 0 };

    const firstDate = data[0].humanReadableDate;
    const lastDate = data[data.length - 1].humanReadableDate;

    const metricsData = await fetchMetricsDataByDate(firstDate, lastDate);

    let totalRewards = { amount: "0.00", unit: "USD" };
    let totalMessagesSent = 0;
    let totalDailyActiveUsers = 0;
    let totalUserSignUps = 0;

    if (filter === '24h') {
        if (metricsData.length > 0) {
            const lastMetrics = metricsData[metricsData.length - 1];

            totalMessagesSent = lastMetrics.totalMessagesSent;
            totalDailyActiveUsers = lastMetrics.dailyActiveUsers;
            totalUserSignUps = lastMetrics.userSignUps;

            const lastRewardInEther = parseFloat(formatUnits(BigInt(lastMetrics.totalRewardsEarned.amount), lastMetrics.totalRewardsEarned.precision));
            totalRewards.amount = (lastRewardInEther * tokenPrice).toFixed(2);
        }
    } else if (filter === '48h') {
        let dailyTotals: { [key: string]: MetricsData } = {};

        metricsData.forEach(metrics => {
            const date = metrics.date;
            if (!dailyTotals[date]) {
                dailyTotals[date] = { ...metrics };
            } else {
                dailyTotals[date].totalMessagesSent += metrics.totalMessagesSent;
                dailyTotals[date].dailyActiveUsers += metrics.dailyActiveUsers;
                dailyTotals[date].userSignUps += metrics.userSignUps;
                dailyTotals[date].newlyMintedDomains += metrics.newlyMintedDomains;
                const currentRewardInEther = parseFloat(formatUnits(BigInt(metrics.totalRewardsEarned.amount), metrics.totalRewardsEarned.precision));
                const totalRewardInEther = parseFloat(formatUnits(BigInt(dailyTotals[date].totalRewardsEarned.amount), dailyTotals[date].totalRewardsEarned.precision));
                dailyTotals[date].totalRewardsEarned.amount = (currentRewardInEther + totalRewardInEther).toString();
            }
        });

        for (const date in dailyTotals) {
            totalMessagesSent += dailyTotals[date].totalMessagesSent;
            totalDailyActiveUsers += dailyTotals[date].dailyActiveUsers;
            totalUserSignUps += dailyTotals[date].userSignUps;

            const rewardInEther = parseFloat(formatUnits(BigInt(dailyTotals[date].totalRewardsEarned.amount), dailyTotals[date].totalRewardsEarned.precision));
            totalRewards.amount = (parseFloat(totalRewards.amount) + rewardInEther * tokenPrice).toFixed(2);
        }
    }

    return { metricsData: data, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps };
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
        const { metricsData, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps } = await addTotalRewardsToData(data, filter, tokenPrice);

        const response = {
            metricsData,
            totalRewards,
            totalMessagesSent,
            totalDailyActiveUsers,
            totalUserSignUps
        };

        await saveDataToSupabase(filter as string, response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export default handler;

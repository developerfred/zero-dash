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

const cache: { [key: string]: any } = {};

const getTokenPrice = async (): Promise<number> => {
    const response = await fetch('https://zero-dash.vercel.app/api/meow/token-price');
    if (!response.ok) {
        throw new Error(`Error fetching MEOW price: ${response.statusText}`);
    }
    const data = await response.json();
    return data.price;
};

const fetchWithTimeout = (resource: string, options: { timeout: number }): Promise<Response> => {
    const { timeout } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(resource, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(id));
};

const fetchMetricsData = async (fromTs: number, toTs: number): Promise<any[]> => {
    console.log(`Fetching metrics data from ${fromTs} to ${toTs}`);
    const response = await fetchWithTimeout(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`, { timeout: 10000 });
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return normalizeData(data, fromTs);
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchMetricsDataInChunks = async (fromTs: number, toTs: number): Promise<any[]> => {
    const interval = 15 * 60 * 1000; // 15 minutos
    const maxRequestsPerBatch = 10; // Número máximo de requisições por pacote
    const results = [];

    for (let ts = fromTs; ts < toTs; ts += interval * maxRequestsPerBatch) {
        const promises = [];
        for (let i = 0; i < maxRequestsPerBatch && (ts + i * interval) < toTs; i++) {
            promises.push(fetchMetricsData(ts + i * interval, ts + (i + 1) * interval));
        }
        const batchResults = await Promise.allSettled(promises);
        batchResults.forEach(result => {
            if (result.status === 'fulfilled') {
                results.push(...result.value);
            } else {
                console.error('Error fetching data:', result.reason);
            }
        });
        await delay(1000); // Atraso de 1 segundo entre os pacotes
    }

    console.log(`Fetched ${results.length} chunks of metrics data`);
    return results;
};

const fetchMetricsDataByDate = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    console.log(`Fetching metrics data by date from ${fromDate} to ${toDate}`);
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
    if (
        data.totalDailyActiveUsers > 0 ||
        data.totalMessagesSent > 0 ||
        data.totalUserSignUps > 0 ||
        (parseFloat(data.totalRewards.amount) > 0 && data.totalRewards.unit)
    ) {
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

const aggregateDataByHour = (data: any[]): any[] => {
    const aggregatedData: { [key: string]: any } = {};

    data.forEach(entry => {
        const date = new Date(entry.timestamp);
        const hourKey = date.toISOString().split(':')[0]; // Keep only up to hours

        if (!aggregatedData[hourKey]) {
            aggregatedData[hourKey] = {
                timestamp: date.getTime(),
                humanReadableTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                humanReadableDate: date.toISOString().split('T')[0],
                userSignUps: 0,
                totalMessagesSent: 0,
                dailyActiveUsers: 0,
            };
        }

        aggregatedData[hourKey].userSignUps += entry.userSignUps;
        aggregatedData[hourKey].totalMessagesSent += entry.totalMessagesSent;
        aggregatedData[hourKey].dailyActiveUsers += entry.dailyActiveUsers;
    });

    return Object.values(aggregatedData);
};

const aggregateDataByDay = (data: any[]): any[] => {
    const aggregatedData: { [key: string]: any } = {};

    data.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dayKey = date.toISOString().split('T')[0]; // Keep only up to days

        if (!aggregatedData[dayKey]) {
            aggregatedData[dayKey] = {
                timestamp: date.getTime(),
                humanReadableTime: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                humanReadableDate: dayKey,
                userSignUps: 0,
                totalMessagesSent: 0,
                dailyActiveUsers: 0,
            };
        }

        aggregatedData[dayKey].userSignUps += entry.userSignUps;
        aggregatedData[dayKey].totalMessagesSent += entry.totalMessagesSent;
        aggregatedData[dayKey].dailyActiveUsers += entry.dailyActiveUsers;
    });

    return Object.values(aggregatedData);
};

const addTotalRewardsToData = async (data: any[], filter: string, tokenPrice: number): Promise<{ metricsData: any[], totalRewards: { amount: string, unit: string }, totalMessagesSent: number, totalDailyActiveUsers: number, totalUserSignUps: number }> => {
    if (data.length === 0) return { metricsData: data, totalRewards: { amount: "0.00", unit: "USD" }, totalMessagesSent: 0, totalDailyActiveUsers: 0, totalUserSignUps: 0 };

    const firstDate = data[0].humanReadableDate;
    const lastDate = data[data.length - 1].humanReadableDate;

    console.log(`Fetching additional metrics data by date from ${firstDate} to ${lastDate}`);
    const metricsData = await fetchMetricsDataByDate(firstDate, lastDate);

    let totalRewards = { amount: "0.00", unit: "USD" };
    let totalMessagesSent = 0;
    let totalDailyActiveUsers = 0;
    let totalUserSignUps = 0;

    if (metricsData.length > 0) {
        const dailyTotals = metricsData.reduce((acc, metrics) => {
            const currentRewardInEther = parseFloat(formatUnits(BigInt(metrics.totalRewardsEarned.amount), metrics.totalRewardsEarned.precision));
            acc.totalRewards.amount = (parseFloat(acc.totalRewards.amount) + currentRewardInEther * tokenPrice).toFixed(2);
            acc.totalMessagesSent += metrics.totalMessagesSent;
            acc.totalDailyActiveUsers += metrics.dailyActiveUsers;
            acc.totalUserSignUps += metrics.userSignUps;
            return acc;
        }, {
            totalRewards: { amount: "0.00", unit: "USD" },
            totalMessagesSent: 0,
            totalDailyActiveUsers: 0,
            totalUserSignUps: 0
        });

        totalRewards = dailyTotals.totalRewards;
        totalMessagesSent = dailyTotals.totalMessagesSent;
        totalDailyActiveUsers = dailyTotals.totalDailyActiveUsers;
        totalUserSignUps = dailyTotals.totalUserSignUps;
    }

    return { metricsData: data, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (!['24h', '48h', '7d', '30d', '365d'].includes(filter)) {
        console.error('Invalid filter:', filter);
        return res.status(400).json({ error: 'Invalid filter. Only 24h, 48h, 7d, 30d, and 365d are supported.' });
    }

    const now = Date.now();
    const fromTs = filter === '24h' ? now - 24 * 60 * 60 * 1000
        : filter === '48h' ? now - 48 * 60 * 60 * 1000
            : filter === '7d' ? now - 7 * 24 * 60 * 60 * 1000
                : filter === '30d' ? now - 30 * 24 * 60 * 60 * 1000
                    : now - 365 * 24 * 60 * 60 * 1000;

    console.log(`Fetching data for filter: ${filter}`);

    let data = [];

    try {
        if (filter === '48h') {
            console.log('Fetching data for 48h');
            const cached24hData = cache['24h'] || await fetchMetricsDataInChunks(now - 24 * 60 * 60 * 1000, now);
            cache['24h'] = cached24hData;
            const previous24hData = await fetchMetricsDataInChunks(now - 48 * 60 * 60 * 1000, now - 24 * 60 * 60 * 1000);
            data = [...previous24hData, ...cached24hData];
        } else if (filter === '7d') {
            console.log('Fetching data for 7d');
            const cached48hData = cache['48h'] || await fetchMetricsDataInChunks(now - 48 * 60 * 60 * 1000, now);
            cache['48h'] = cached48hData;
            const previous5dData = await fetchMetricsDataInChunks(now - 7 * 24 * 60 * 60 * 1000, now - 48 * 60 * 60 * 1000);
            data = [...previous5dData, ...cached48hData];
        } else if (filter === '30d') {
            console.log('Fetching data for 30d');
            const cached7dData = cache['7d'] || await fetchMetricsDataInChunks(now - 7 * 24 * 60 * 60 * 1000, now);
            cache['7d'] = cached7dData;
            const previous23dData = await fetchMetricsDataInChunks(now - 30 * 24 * 60 * 60 * 1000, now - 7 * 24 * 60 * 60 * 1000);
            data = [...previous23dData, ...cached7dData];
        } else if (filter === '365d') {
            console.log('Fetching data for 365d');
            const cached30dData = cache['30d'] || await fetchMetricsDataInChunks(now - 30 * 24 * 60 * 60 * 1000, now);
            cache['30d'] = cached30dData;
            const previous335dData = await fetchMetricsDataInChunks(now - 365 * 24 * 60 * 60 * 1000, now - 30 * 24 * 60 * 60 * 1000);
            data = [...previous335dData, ...cached30dData];
        } else {
            data = await fetchMetricsDataInChunks(fromTs, now);
        }

        cache[filter] = data;

        let aggregatedData;
        if (filter === '24h' || filter === '48h') {
            aggregatedData = aggregateDataByHour(data);
        } else {
            aggregatedData = aggregateDataByDay(data);
        }

        const tokenPrice = await getTokenPrice();
        const { metricsData, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps } = await addTotalRewardsToData(aggregatedData, filter, tokenPrice);

        const response = {
            metricsData,
            totalRewards,
            totalMessagesSent,
            totalDailyActiveUsers,
            totalUserSignUps
        };

        console.log('Response:', response);

        await saveDataToSupabase(filter as string, response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
};

export default handler;

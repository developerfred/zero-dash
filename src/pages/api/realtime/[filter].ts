// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { formatUnits } from 'viem';

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
    try {
        const response = await fetchWithTimeout(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`, { timeout: 10000 });
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

const fetchMetricsDataInChunks = async (fromTs: number, toTs: number): Promise<any[]> => {
    const interval = 15 * 60 * 1000;  
    const maxRequestsPerBatch = 5;
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
        await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

    return results;
};

const fetchMetricsDataByDate = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    try {
        const response = await fetch(`${API_URL_METRICS}?fromDate=${fromDate}&toDate=${toDate}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return Object.entries(data).map(([date, metrics]: [string, any]) => ({
            date,
            ...metrics,
        }));
    } catch (error) {
        console.error('Error fetching metrics data by date:', error);
        return [];
    }
};

const normalizeData = (data: any, timestamp: number): any[] => {
    const date = new Date(timestamp);
    const pstOffset = -8 * 60 * 60 * 1000;  // PST offset in milliseconds
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

const aggregateDataByHour = (data: any[]): any[] => {
    const aggregatedData: { [key: string]: any } = {};

    data.forEach(entry => {
        const date = new Date(entry.timestamp);
        const hourKey = date.toISOString().split(':')[0];

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
        const dayKey = date.toISOString().split('T')[0];

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

const updateMetricsData = async (filter: string, fromTs: number, toTs: number): Promise<{ totalMessagesSent: number, totalDailyActiveUsers: number, totalUserSignUps: number }> => {
    try {
        if (filter === '30d' || filter === '365d') {
            const fromDate = new Date(fromTs).toISOString().split('T')[0];
            const toDate = new Date(toTs).toISOString().split('T')[0];
            const metricsData = await fetchMetricsDataByDate(fromDate, toDate);
            return metricsData.reduce((totals, dayMetrics) => {
                totals.totalMessagesSent += dayMetrics.totalMessagesSent;
                totals.totalDailyActiveUsers += dayMetrics.dailyActiveUsers;
                totals.totalUserSignUps += dayMetrics.userSignUps;
                return totals;
            }, {
                totalMessagesSent: 0,
                totalDailyActiveUsers: 0,
                totalUserSignUps: 0,
            });
        } else {
            const response = await fetchWithTimeout(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`, { timeout: 10000 });
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
            const data = await response.json();
            return {
                totalMessagesSent: data.totalMessagesSent,
                totalDailyActiveUsers: data.dailyActiveUsers,
                totalUserSignUps: data.userSignUps
            };
        }
    } catch (error) {
        console.error('Error updating metrics data:', error);
        return {
            totalMessagesSent: 0,
            totalDailyActiveUsers: 0,
            totalUserSignUps: 0
        };
    }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (!['24h', '48h', '7d', '30d', '90d', '365d'].includes(filter as string)) {
        return res.status(400).json({ error: 'Invalid filter. Only 24h, 48h, 7d, 30d, 90d, and 365d are supported.' });
    }

    const now = Date.now();
    const fromTs = filter === '24h' ? now - 24 * 60 * 60 * 1000
        : filter === '48h' ? now - 48 * 60 * 60 * 1000
            : filter === '7d' ? now - 7 * 24 * 60 * 60 * 1000
                : filter === '30d' ? now - 30 * 24 * 60 * 60 * 1000
                    : now - 365 * 24 * 60 * 60 * 1000;

    try {
        let data = [];

        if (filter === '48h') {
            const cached24hData = cache['24h'] || await fetchMetricsDataInChunks(now - 24 * 60 * 60 * 1000, now);
            cache['24h'] = cached24hData;
            const previous24hData = await fetchMetricsDataInChunks(now - 48 * 60 * 60 * 1000, now - 24 * 60 * 60 * 1000);
            data = [...previous24hData, ...cached24hData];
        } else if (filter === '7d') {
            const cached48hData = cache['48h'] || await fetchMetricsDataInChunks(now - 48 * 60 * 60 * 1000, now);
            cache['48h'] = cached48hData;
            const previous5dData = await fetchMetricsDataInChunks(now - 7 * 24 * 60 * 60 * 1000, now - 48 * 60 * 60 * 1000);
            data = [...previous5dData, ...cached48hData];
        } else if (filter === '30d') {
            const cached7dData = cache['7d'] || await fetchMetricsDataInChunks(now - 7 * 24 * 60 * 60 * 1000, now);
            cache['7d'] = cached7dData;
            const previous23dData = await fetchMetricsDataInChunks(now - 30 * 24 * 60 * 60 * 1000, now - 7 * 24 * 60 * 60 * 1000);
            data = [...previous23dData, ...cached7dData];
        } else if (filter === '90d') {
            const cached30dData = cache['30d'] || await fetchMetricsDataInChunks(now - 30 * 24 * 60 * 60 * 1000, now);
            cache['30d'] = cached30dData;
            const previous83dData = await fetchMetricsDataInChunks(now - 90 * 24 * 60 * 60 * 1000, now - 7 * 24 * 60 * 60 * 1000);
            data = [...previous83dData, ...cached30dData];
        } else if (filter === '365d') {
            const cached30dData = cache['30d'] || await fetchMetricsDataInChunks(now - 30 * 24 * 60 * 60 * 1000, now);
            cache['30d'] = cached30dData;
            const previous335dData = await fetchMetricsDataInChunks(now - 365 * 24 * 60 * 60 * 1000, now - 30 * 24 * 60 * 60 * 1000);
            data = [...previous335dData, ...cached30dData];
        } else {
            data = await fetchMetricsDataInChunks(fromTs, now);
        }

        cache[filter as string] = data;

        let aggregatedData;
        if (filter === '24h' || filter === '48h') {
            aggregatedData = aggregateDataByHour(data);
        } else {
            aggregatedData = aggregateDataByDay(data);
        }

        const tokenPrice = await getTokenPrice();
        const { metricsData, totalRewards, totalMessagesSent, totalDailyActiveUsers, totalUserSignUps } = await addTotalRewardsToData(aggregatedData, filter as string, tokenPrice);

        const updatedMetrics = await updateMetricsData(filter as string, fromTs, now);

        const response = {
            metricsData,
            totalRewards,
            totalMessagesSent: updatedMetrics.totalMessagesSent,
            totalDailyActiveUsers: updatedMetrics.totalDailyActiveUsers,
            totalUserSignUps: updatedMetrics.totalUserSignUps
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export default handler;

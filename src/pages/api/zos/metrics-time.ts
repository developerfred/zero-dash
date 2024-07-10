// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';
const API_URL_METRICS = process.env.NEXT_PUBLIC_API_METRICS;

let cache = {};
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; 

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (filter !== '24h' && filter !== '48h') {
        return res.status(400).json({ error: 'Invalid filter. Only 24h and 48h are supported.' });
    }

    const now = Date.now();
    const fromTs = filter === '24h' ? now - 24 * 60 * 60 * 1000 : now - 48 * 60 * 60 * 1000;
 
    if (cache[filter] && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
        return res.status(200).json(cache[filter]);
    }

    try {
        const data = await fetchMetricsDataInChunks(fromTs, now);
        const todayMetrics = await fetchTodayMetricsData();

        if (Array.isArray(data) && data.length > 0) {
            const combinedData = data.map(entry => ({
                ...entry,
                totalRewardsEarned: todayMetrics.totalRewardsEarned
            }));
            
            cache[filter] = combinedData;
            cacheTimestamp = now;

            return res.status(200).json(combinedData);
        } else {
            throw new Error('No valid data received from the API');
        }
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

const fetchTodayMetricsData = async (): Promise<any> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_URL_METRICS}?fromDate=${today}&toDate=${today}`);
    if (!response.ok) {
        throw new Error(`Error fetching today's data: ${response.statusText}`);
    }
    const data = await response.json();
    return Object.entries(data).map(([date, metrics]: [string, any]) => ({
        date,
        ...metrics,
    }))[0];
};

const normalizeData = (data: any, timestamp: number): any[] => {
    const date = new Date(timestamp);
    const humanReadableTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const humanReadableDate = date.toLocaleDateString('en-US');

    if (Array.isArray(data)) {
        return data.map(entry => ({ ...entry, timestamp, humanReadableTime, humanReadableDate }));
    } else if (typeof data === 'object' && data !== null) {
        return [{ ...data, timestamp, humanReadableTime, humanReadableDate }];
    } else {
        throw new Error('Unexpected response format');
    }
};

export default handler;

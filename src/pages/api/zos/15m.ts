// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = 'https://zosapi.zero.tech/metrics/dynamic';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    
    if (global.cachedData && global.cacheTimestamp > fifteenMinutesAgo) {
        return res.status(200).json(global.cachedData);
    }

    try {
        const data = await fetchMetricsData(fifteenMinutesAgo, now);
        global.cachedData = data;
        global.cacheTimestamp = now;
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
};

const fetchMetricsData = async (fromTs: number, toTs: number) => {
    const response = await fetch(`${API_URL}?fromTs=${fromTs}&toTs=${toTs}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return await response.json();
};

export default handler;

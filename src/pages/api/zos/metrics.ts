// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_METRICS;
const API_15M_URL = process.env.NEXT_PUBLIC_API_METRICS_15M!;

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

interface Metrics15MData {
    userSignUps: number;
    totalMessagesSent: number;
    dailyActiveUsers: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { fromDate, toDate, includeLast15Minutes } = req.query;

    if (typeof fromDate !== 'string' || typeof toDate !== 'string') {
        return res.status(400).json({ error: 'fromDate and toDate are required' });
    }

    try {
        let data: MetricsData[];

        if (includeLast15Minutes && includeLast15Minutes === 'true') {
            const metrics15MData = await fetch15MinutesData();
            const mainMetricsData = await fetchMetricsData(fromDate, toDate);
            const todayMetricsData = await fetchTodayMetricsData(); 

            if (mainMetricsData.length === 0) {
                throw new Error('No data found for the specified period');
            }

            data = mainMetricsData.map((mainData) => ({
                ...mainData,
                dailyActiveUsers: metrics15MData.dailyActiveUsers,
                totalMessagesSent: metrics15MData.totalMessagesSent,
                userSignUps: metrics15MData.userSignUps,
                totalRewardsEarned: todayMetricsData.totalRewardsEarned, 
            }));
        } else {
            data = await fetchMetricsData(fromDate, toDate);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: (error as Error).message });
    }
};

const fetchMetricsData = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    const response = await fetch(`${API_URL}?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return Object.entries(data).map(([date, metrics]: [string, any]) => ({
        date,
        ...metrics,
    }));
};

const fetch15MinutesData = async (): Promise<Metrics15MData> => {
    const response = await fetch(API_15M_URL);
    if (!response.ok) {
        throw new Error(`Error fetching 15 minutes data: ${response.statusText}`);
    }
    return await response.json();
};

const fetchTodayMetricsData = async (): Promise<MetricsData> => {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_URL}?fromDate=${today}&toDate=${today}`);
    if (!response.ok) {
        throw new Error(`Error fetching today's data: ${response.statusText}`);
    }
    const data = await response.json();
    return Object.entries(data).map(([date, metrics]: [string, any]) => ({
        date,
        ...metrics,
    }))[0]; 
};

export default handler;

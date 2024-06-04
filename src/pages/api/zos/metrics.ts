import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_METRICS;

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { fromDate, toDate } = req.query;

    if (typeof fromDate !== 'string' || typeof toDate !== 'string') {
        return res.status(400).json({ error: 'fromDate and toDate are required' });
    }

    try {
        const data = await fetchDataInIntervals(fromDate, toDate);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: error.message });
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

const fetchDataInIntervals = async (fromDate: string, toDate: string): Promise<MetricsData[]> => {
    const data: MetricsData[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if ((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 60) {
        return fetchMetricsData(fromDate, toDate);
    }

    let currentStartDate = new Date(startDate);

    while (currentStartDate < endDate) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + 59);
        if (currentEndDate > endDate) {
            currentEndDate = endDate;
        }

        const result = await fetchMetricsData(currentStartDate.toISOString().split('T')[0], currentEndDate.toISOString().split('T')[0]);
        data.push(...result);

        currentStartDate.setDate(currentStartDate.getDate() + 60);
    }

    return data;
};

export default handler;

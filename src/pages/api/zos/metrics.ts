import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = process.env.NEXT_PUBLIC_API_METRICS;

interface MetricsData {
    dailyActiveUsers: number;
    totalMessagesSent: number;
    userSignUps: number;
    newlyMintedDomains: number;
    totalRewardsEarned: string;
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
        // @ts-ignore
        return res.status(500).json({ error: error.message });
    }
};

const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
};

const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
};

const fetchMetricsData = async (fromDate: string, toDate: string): Promise<MetricsData> => {
    const response = await fetch(`${API_URL}?fromDate=${fromDate}&toDate=${toDate}`);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }
    return response.json();
};

const fetchDataInIntervals = async (fromDate: string, toDate: string): Promise<MetricsData> => {
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
        data.push(result);

        currentStartDate.setDate(currentStartDate.getDate() + 60);
    }

    return combineData(data);
};

const combineData = (data: MetricsData[]): MetricsData => {
    return data.reduce((acc, current) => {
        const accRewards = parseCurrency(acc.totalRewardsEarned);
        const currentRewards = parseCurrency(current.totalRewardsEarned);
        const totalRewards = accRewards + currentRewards;

        console.log(`Accumulated Rewards: ${accRewards}, Current Rewards: ${currentRewards}, Total Rewards: ${totalRewards}`);

        return {
            dailyActiveUsers: acc.dailyActiveUsers + current.dailyActiveUsers,
            totalMessagesSent: acc.totalMessagesSent + current.totalMessagesSent,
            userSignUps: acc.userSignUps + current.userSignUps,
            newlyMintedDomains: acc.newlyMintedDomains + current.newlyMintedDomains,
            totalRewardsEarned: formatCurrency(totalRewards)
        };
    }, {
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        newlyMintedDomains: 0,
        totalRewardsEarned: '$0.00'
    });
};

export default handler;

// pages/api/metrics.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const API_URL = 'https://zosapi.zero.tech/metrics';

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
        return res.status(500).json({ error: error.message });
    }
};

const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
};

const formatCurrency = (value: number): string => {
    return `$${value.toFixed(2)}`;
};

const fetchDataInIntervals = async (fromDate: string, toDate: string): Promise<MetricsData> => {
    const data: MetricsData[] = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if ((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24) <= 60) {
        const response = await fetch(`${API_URL}?fromDate=${fromDate}&toDate=${toDate}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return await response.json();
    }

    let currentStartDate = new Date(startDate);

    while (currentStartDate < endDate) {
        let currentEndDate = new Date(currentStartDate);
        currentEndDate.setDate(currentEndDate.getDate() + 59);
        if (currentEndDate > endDate) {
            currentEndDate = endDate;
        }

        console.log(`Fetching data from ${currentStartDate.toISOString().split('T')[0]} to ${currentEndDate.toISOString().split('T')[0]}`);
        const response = await fetch(`${API_URL}?fromDate=${currentStartDate.toISOString().split('T')[0]}&toDate=${currentEndDate.toISOString().split('T')[0]}`);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const result: MetricsData = await response.json();
        console.log('Fetched data:', result);
        data.push(result);

        currentStartDate.setDate(currentStartDate.getDate() + 60);
    }

    const combinedData = data.reduce((acc, current) => {
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

    console.log('Combined Data:', combinedData);
    return combinedData;
};

export default handler;

// @ts-nocheck

import { formatUnits } from 'viem';
import { formatUSD } from './currencyUtils';
import { format } from 'date-fns';

export const calculateTotals = (data, tokenPriceInUSD) => {
    const initialTotals = {
        dailyActiveUsers: 0,
        totalMessagesSent: 0,
        userSignUps: 0,
        newlyMintedDomains: 0,
        totalRewardsEarned: '0',
        totalRegistrations: 0,
        totalWorlds: 0,
        totalDomains: 0,
        dayCount: 0,
    };

    const rewardsData = [];

    const totals = data.reduce((acc, curr) => {
        acc.dailyActiveUsers += curr.dailyActiveUsers;
        acc.totalMessagesSent += curr.totalMessagesSent;
        acc.userSignUps += curr.userSignUps;
        acc.newlyMintedDomains += curr.newlyMintedDomains;
        const rewardInEther = parseFloat(formatUnits(BigInt(curr.totalRewardsEarned.amount), curr.totalRewardsEarned.precision));
        const rewardInUSD = rewardInEther * tokenPriceInUSD;
        acc.totalRewardsEarned = (parseFloat(acc.totalRewardsEarned) + rewardInUSD).toString();
        rewardsData.push({ date: curr.date, totalRewardsEarned: rewardInUSD });
        acc.dayCount += 1;
        return acc;
    }, initialTotals);

    totals.dailyActiveUsers = Math.round(totals.dailyActiveUsers / totals.dayCount);
    totals.totalRewardsEarned = formatUSD(parseFloat(totals.totalRewardsEarned) * 100);

    return { totals, rewardsData };
};

export const formatDateRange = (filter: string): { fromDate: string; toDate: string } => {
    const now = new Date();
    let fromDate, toDate;

    switch (filter) {
        case '24h':
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
            break;
        case '7d':
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 7)).toISOString().split('T')[0];
            break;
        case '30d':
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
            break;
        case '90d':
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 90)).toISOString().split('T')[0];
            break;
        case '365d':
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 365)).toISOString().split('T')[0];
            break;
        case 'today':
            fromDate = toDate = now.toISOString().split('T')[0];
            break;
        case 'yesterday':
            toDate = new Date(now.setDate(now.getDate() - 1)).toISOString().split('T')[0];
            fromDate = toDate;
            break;
        case 'last_week':
            now.setDate(now.getDate() - now.getDay());
            toDate = now.toISOString().split('T')[0];
            fromDate = new Date(now.setDate(now.getDate() - 6)).toISOString().split('T')[0];
            break;
        case 'last_month':
            now.setMonth(now.getMonth() - 1);
            toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            break;
        case 'last_year':
            now.setFullYear(now.getFullYear() - 1);
            toDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
            fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            break;
        default:
            if (filter && filter.includes('_')) {
                const dates = filter.split('_');
                fromDate = dates[1];
                toDate = dates[2];
            } else {
                throw new Error(`Invalid filter format: ${filter}`);
            }
            break;
    }

    return { fromDate, toDate };
};


export const formatDate = (date: string): string => {
    return format(new Date(date), 'MM-dd-yy');
};


export const formatCurrency = (value: number): string => {
    return `$${value.toLocaleString()}`;
};
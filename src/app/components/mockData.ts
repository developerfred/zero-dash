import { addDays, subDays, format } from 'date-fns';

import { DataPoint } from '@/app/types'

const generateData = (startDate: Date, endDate: Date): DataPoint[] => {
    const data: DataPoint[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
        data.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            dailyActiveUsers: Math.floor(Math.random() * 100),
            totalMessagesSent: Math.floor(Math.random() * 1000),
            userSignUps: Math.floor(Math.random() * 50),
            newlyMintedDomains: Math.floor(Math.random() * 10),
            totalRewardsEarned: Math.floor(Math.random() * 500),
        });
        currentDate = addDays(currentDate, 1);
    }

    return data;
};

export const mockData = (filter: string): DataPoint[] => {
    const endDate = new Date();
    let startDate: Date;

    switch (filter) {
        case '24h':
            startDate = subDays(endDate, 1);
            break;
        case '7d':
            startDate = subDays(endDate, 7);
            break;
        case '30d':
            startDate = subDays(endDate, 30);
            break;
        case '90d':
            startDate = subDays(endDate, 90);
            break;
        case '365d':
            startDate = subDays(endDate, 365);
            break;
        case 'today':
            startDate = endDate;
            break;
        case 'yesterday':
            startDate = subDays(endDate, 1);
            break;
        case 'last_week':
            startDate = subDays(endDate, 7);
            break;
        case 'last_month':
            startDate = subDays(endDate, 30);
            break;
        case 'last_year':
            startDate = subDays(endDate, 365);
            break;
        default:
            startDate = subDays(endDate, 1);
    }

    return generateData(startDate, endDate);
};

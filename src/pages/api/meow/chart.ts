import { parseISO, differenceInDays } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

interface CoinPrice {
    timestamp: number;
    price: number;
}

interface CoinData {
    prices: CoinPrice[];
}

interface ApiResponse {
    coins: {
        [key: string]: CoinData;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { coins, start, end } = req.query;

        if (typeof coins !== 'string' || typeof start !== 'string' || typeof end !== 'string') {
            res.status(400).json({ error: 'Missing or invalid required parameters' });
            return;
        }

        const startDate = parseISO(start);
        const endDate = parseISO(end);
        const startUnix = Math.floor(startDate.getTime() / 1000);
        const endUnix = Math.floor(endDate.getTime() / 1000);
        
        const daysDiff = differenceInDays(endDate, startDate);
        
        let period: string;
        let span: number;
        let searchWidth: number = 600;

        if (daysDiff <= 1) {
            period = '1h';
            span = 1;
        } else if (daysDiff <= 30) {
            period = '1d';
            span = daysDiff;
        } else {
            period = '7d';
            span = Math.ceil(daysDiff / 7);
        }

        const url = new URL(`https://coins.llama.fi/chart/${coins}`);
        url.searchParams.append('start', startUnix.toString());
        url.searchParams.append('span', span.toString());
        url.searchParams.append('period', period);
        url.searchParams.append('searchWidth', searchWidth.toString());

        console.log('Request URL:', url.toString());

        const response = await fetch(url.toString(), {
            headers: {
                'Referer': 'https://defillama.com/'
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data: ApiResponse = await response.json();

        const formattedData = data.coins[coins].prices.map((item: CoinPrice) => ({
            ...item,
            date: new Date(item.timestamp * 1000).toISOString().split('T')[0],
        }));

        res.status(200).json(formattedData);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}

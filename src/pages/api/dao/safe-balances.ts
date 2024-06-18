import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const SAFE_BALANCES_URL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes/0xEf147697d948D609F712397Db270234CF155A925/balances/?trusted=true&exclude_spam=true';
const SAFE_TRANSACTIONS_URL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes/0xEf147697d948D609F712397Db270234CF155A925/all-transactions/?executed=false&queued=false&trusted=true&limit=25&offset=0';

interface Balance {
    tokenAddress: string | null;
    token: {
        name: string;
        symbol: string;
        decimals: number;
        logoUri: string;
    } | null;
    balance: string;
}

interface Transaction {
    executionDate: string;
    [key: string]: any;
}

interface GroupedTransactions {
    [key: string]: {
        date: string;
        numberOfTransactions: number;
        transactions: Transaction[];
    };
}

const dateRanges = {
    '24h': { startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), endDate: new Date().toISOString() },
    '7d': { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), endDate: new Date().toISOString() },
    '30d': { startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), endDate: new Date().toISOString() },
    '90d': { startDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(), endDate: new Date().toISOString() },
    '365d': { startDate: new Date(new Date().setDate(new Date().getDate() - 365)).toISOString(), endDate: new Date().toISOString() },
    'today': { startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), endDate: new Date().toISOString() },
    'yesterday': { startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), endDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() },
    'last_week': { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), endDate: new Date().toISOString() },
    'last_month': { startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), endDate: new Date().toISOString() },
    'last_year': { startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), endDate: new Date().toISOString() },
};

const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransactions => {
    return transactions.reduce((acc: GroupedTransactions, transaction: Transaction) => {
        const date = new Date(transaction.executionDate).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                date: date,
                numberOfTransactions: 0,
                transactions: []
            };
        }
        acc[date].transactions.push(transaction);
        acc[date].numberOfTransactions += 1;
        return acc;
    }, {});
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { filter } = req.query;

    if (!filter) {
        return res.status(400).json({ error: 'Missing filter parameter' });
    }

    let startDate: string;
    let endDate: string;
    
    // @ts-ignore
    if (filter.startsWith('custom_')) {
        // @ts-ignore
        const dates = filter.split('_');
        startDate = dates[1];
        endDate = dates[2];
    } else if (dateRanges[filter as keyof typeof dateRanges]) {
        startDate = dateRanges[filter as keyof typeof dateRanges].startDate;
        endDate = dateRanges[filter as keyof typeof dateRanges].endDate;
    } else {
        return res.status(400).json({ error: 'Invalid filter parameter' });
    }

    try {
        const [balancesResponse, transactionsResponse] = await Promise.all([
            axios.get(SAFE_BALANCES_URL),
            axios.get(`${SAFE_TRANSACTIONS_URL}&execution_date__gte=${startDate}&execution_date__lte=${endDate}`)
        ]);

        const balances: Balance[] = balancesResponse.data;
        const transactions: Transaction[] = transactionsResponse.data.results;

        const groupedTransactions = groupTransactionsByDate(transactions);

        const result = {
            balances: balances,
            transactions: Object.values(groupedTransactions)
        };

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching data from Safe API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Safe API' });
    }
}

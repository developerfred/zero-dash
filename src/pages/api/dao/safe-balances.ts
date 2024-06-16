import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const SAFE_BALANCES_URL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes/0xEf147697d948D609F712397Db270234CF155A925/balances/?trusted=true&exclude_spam=true';
const SAFE_TRANSACTIONS_URL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes/0xEf147697d948D609F712397Db270234CF155A925/all-transactions/?executed=false&queued=false&trusted=true&limit=25&offset=0';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const [balancesResponse, transactionsResponse] = await Promise.all([
            axios.get(SAFE_BALANCES_URL),
            axios.get(SAFE_TRANSACTIONS_URL)
        ]);

        res.status(200).json({
            balances: balancesResponse.data,
            transactions: transactionsResponse.data
        });
    } catch (error) {
        console.error('Error fetching data from Safe API:', error);
        res.status(500).json({ error: 'Failed to fetch data from Safe API' });
    }
}

// @ts-nocheck
import axios from 'axios';

const CHAIN_BASE_KEY = process.env.CHAIN_BASE_KEY; 
const TOKEN_ADDRESS = '0x2a3bff78b79a009976eea096a51a948a3dc00e34';
const NETWORK_ID = 1;

export default async function handler(req, res) {    
    res.setHeader('Access-Control-Allow-Origin', 'https://docs.chainbase.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const pageSize = 100;
    let currentPage = 1;
    let totalCount = 0;
    let hasMorePages = true;

    try {
        while (hasMorePages) {
            const response = await axios.get('https://api.chainbase.online/v1/token/holders', {
                params: {
                    chain_id: NETWORK_ID,
                    contract_address: TOKEN_ADDRESS,
                    page: currentPage,
                    limit: pageSize,
                },
                headers: {
                    'accept': 'application/json',
                    'x-api-key': CHAIN_BASE_KEY,
                    'Referer': 'https://docs.chainbase.com'
                },
            });

            const { data, next_page, count } = response.data;

            if (currentPage === 1) {
                
                totalCount = count;
            }

            if (next_page) {
                currentPage = next_page;
            } else {
                hasMorePages = false;
            }
        }

        res.status(200).json({ totalHolders: totalCount });
    } catch (error) {
        console.error('Failed to fetch token holders:', error);
        res.status(500).json({ error: 'Failed to fetch token holders' });
    }
}

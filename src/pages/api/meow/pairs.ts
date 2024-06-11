// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const DUNE_API_ENDPOINT = 'https://api.dune.com/api/v1/dex/pairs/ethereum';
const DUNE_API_KEY = process.env.DUNE_API_KEY;  

const TOKEN_ADDRESS = '0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch(DUNE_API_ENDPOINT, {
            method: 'GET',
            headers: {
                'X-DUNE-API-KEY': DUNE_API_KEY,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        
        const filteredPairs = data.result.rows.filter((pair: any) =>
            pair.token_a_address === TOKEN_ADDRESS || pair.token_b_address === TOKEN_ADDRESS
        );

        if (filteredPairs.length === 0) {
            return res.status(404).json({ error: 'Pairs involving the specified token not found' });
        }

        res.status(200).json(filteredPairs);
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}

import { NextApiRequest, NextApiResponse } from 'next';

const ZERO_PRICE_URL = 'https://beta.zero.tech/api/tokens/zero/';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const response = await fetch(ZERO_PRICE_URL);

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data || typeof data.price === 'undefined') {
            return res.status(404).json({ error: 'ZERO price data not found' });
        }

        res.status(200).json({
            price: data.price,
            diff: data.diff,
            cap: data.cap,
            volume: data.volume,
            holders: data.holders,
        });
    } catch (error) {
        console.error('Error fetching ZERO price:', error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export default handler;

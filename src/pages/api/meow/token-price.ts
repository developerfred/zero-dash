import { NextApiRequest, NextApiResponse } from 'next';

const MEOW_PRICE_URL = 'https://coins.llama.fi/prices/current/ethereum:0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8?searchWidth=4h';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const response = await fetch(MEOW_PRICE_URL);

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        const meowPrice = data.coins['ethereum:0x0eC78ED49C2D27b315D462d43B5BAB94d2C79bf8'];
        if (!meowPrice) {
            return res.status(404).json({ error: 'MEOW price data not found' });
        }

        res.status(200).json({
            decimals: meowPrice.decimals,
            symbol: meowPrice.symbol,
            price: meowPrice.price,
            timestamp: meowPrice.timestamp,
            confidence: meowPrice.confidence,
        });
    } catch (error) {
        console.error('Error fetching MEOW price:', error);
        //@ts-ignore
        res.status(500).json({ error: error.message });
    }
};

export default handler;

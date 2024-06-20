// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get('https://token-price.brett-b26.workers.dev/?symbol=eth,WETH,WILD');
    const data = response.data.data;

    const prices = {
      ETH: data.ETH[0].quote.USD.price,
      WETH: data.WETH[0].quote.USD.price,
      WILD: data.WILD[0].quote.USD.price,
    };

    res.status(200).json(prices);
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}

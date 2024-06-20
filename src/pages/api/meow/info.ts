import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const GO_PLUS_LABS_API = 'https://api.gopluslabs.io/api/v1/token_security/1';
const CONTRACT_ADDRESS = '0x0ec78ed49c2d27b315d462d43b5bab94d2c79bf8';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Fetch the data from the GoPlus Labs API
    const response = await axios.get(GO_PLUS_LABS_API, {
      params: {
        contract_addresses: CONTRACT_ADDRESS
      },
      headers: {
        'Referer': 'https://gopluslabs.io'
      }
    });

    const data = response.data.result[CONTRACT_ADDRESS];

    // Calculate the total liquidity (volume)
    const volume = data.dex.reduce((sum: number, dex: any) => sum + parseFloat(dex.liquidity), 0);

    // Prepare the response data
    const responseData = {
      volume,
      holder_count: data.holder_count,
      dex: data.dex,
      holders: data.holders,
      token_name: data.token_name,
      token_symbol: data.token_symbol,
      total_supply: data.total_supply,
      creator_address: data.creator_address,
      creator_balance: data.creator_balance,
      creator_percent: data.creator_percent,
      lp_holder_count: data.lp_holder_count,
      lp_holders: data.lp_holders,
      lp_total_supply: data.lp_total_supply,
      owner_address: data.owner_address,
      buy_tax: data.buy_tax,
      sell_tax: data.sell_tax,
      is_in_dex: data.is_in_dex,
      is_open_source: data.is_open_source,
      is_proxy: data.is_proxy,
      honeypot_with_same_creator: data.honeypot_with_same_creator
    };

    // Send the response
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

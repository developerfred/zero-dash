// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { GraphQLClient, gql } from 'graphql-request';

const snapshotClient = new GraphQLClient('https://hub.snapshot.org/graphql');
const safeBaseURL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes';

const CHAIN_BASE_KEY = process.env.CHAIN_BASE_KEY; 
const NETWORK_ID = 1;

const daoList: string[] = [
  'wilderworlddao.eth',
  'zdao-wilderwheels.eth',
  'zdao-moto.eth',
  'zdao-ww-kicks.eth',
  'zdao-ww-beasts.eth',
  'wildercraftdao.eth',
  'wildercribsdao.eth',
  'wilderpalsdao.eth'
];

const daoAddresses: { [key: string]: string } = {
  'wilderworlddao.eth': '0xAf968D74e79fd2ad24e366bFf96E91F769e0AaEA',
  'zdao-wilderwheels.eth': '0xEe7Ad892Fdf8d95223d7E94E4fF42E9d0cfeCAFA',
  'zdao-moto.eth': '0x624fb845A6b2C64ea10fF9EBe710f747853022B3',
  'zdao-ww-kicks.eth': '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150',
  'zdao-ww-beasts.eth': '0x766A9b866930D0C7f673EB8Fc9655D5f782b2B21',
  'wildercraftdao.eth': '0x48c0E0C0A266255BE9E5E26C0aDc18991b893a86',
  'wildercribsdao.eth': '0xcE2d2421ce6275b7A221F62eC5fA10A9c13E92f7',
  'wilderpalsdao.eth': '0x700F189E8756c60206E4D759272c0c2d57D9b343'
};

const GET_SPACES_QUERY = gql`
  query Spaces($id_in: [String]) {
    spaces(where: { id_in: $id_in }) {
      id
      filters {
        minScore
        onlyMembers
      }
      voting {
        delay
        period
        quorum
      }
      strategies {
        name
        params
      }
    }
  }
`;

const getBalances = async (daoAddress: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${safeBaseURL}/${daoAddress}/balances/?trusted=true&exclude_spam=true`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching balances for ${daoAddress}:`, error.response ? error.response.data : error.message);
    } else {
      console.error(`Error fetching balances for ${daoAddress}:`, error);
    }
    return [];
  }
};

const fetchNFTs = async (walletAddress: string): Promise<any[]> => {
  try {
    const response = await axios.get('https://api.chainbase.online/v1/account/nfts', {
      params: {
        chain_id: NETWORK_ID,
        address: walletAddress,
        limit: 100,
      },
      headers: {
        'accept': 'application/json',
        'x-api-key': CHAIN_BASE_KEY,
      },
    });
    return response.data.data || [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch NFTs:', error.response ? error.response.data : error.message);
    } else {
      console.error('Failed to fetch NFTs:', error);
    }
    return [];
  }
};

const fetchNFTFloorPrice = async (contractAddress: string): Promise<any> => {
  try {
    const response = await axios.get('https://api.chainbase.online/v1/nft/floor_price', {
      params: {
        chain_id: NETWORK_ID,
        contract_address: contractAddress,
      },
      headers: {
        'accept': 'application/json',
        'x-api-key': CHAIN_BASE_KEY,
      },
    });
    return response.data.data || {};
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch NFT floor price:', error.response ? error.response.data : error.message);
    } else {
      console.error('Failed to fetch NFT floor price:', error);
    }
    return {};
  }
};

const calculateTokenBalances = (balancesData: any[]): { [key: string]: number } => {
  const tokenBalances: { [key: string]: number } = {
    ETH: 0,
    WETH: 0,
    WILD: 0
  };

  balancesData.forEach(balances => {
    if (balances) {
      balances.forEach(balance => {
        const { token } = balance;
        const symbol = token ? token.symbol : 'ETH';
        if (tokenBalances[symbol] !== undefined) {
          tokenBalances[symbol] += parseFloat(balance.balance) / Math.pow(10, token ? token.decimals : 18);
        }
      });
    }
  });

  return tokenBalances;
};

const calculateTotalBalance = (tokenBalances: { [key: string]: number }): { [key: string]: number } => {
  const { ETH, WETH, WILD } = tokenBalances;
  return {
    ETH: ETH + WETH,
    WILD
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const variables = { id_in: daoList };
    const spacesData = await snapshotClient.request(GET_SPACES_QUERY, variables);

    const balancesPromises = daoList.map(dao => getBalances(daoAddresses[dao]));
    const balancesData = await Promise.all(balancesPromises);

    const result = spacesData.spaces.map((space: any, index: number) => ({
      ...space,
      balances: balancesData[index]
    }));

    const tokenBalances = calculateTokenBalances(balancesData);
    const totalBalances = calculateTotalBalance(tokenBalances);

    let totalNFTValue = 0;

    for (const dao of daoList) {
      const nfts = await fetchNFTs(daoAddresses[dao]);
      for (const nft of nfts) {
        const floorPrice = await fetchNFTFloorPrice(nft.contract_address);
        totalNFTValue += floorPrice.price * nft.balance;
      }
    }

    const totalDaos = daoList.length;

    res.status(200).json({
      totalDaos,
      totalBalances,
      tokenBalances,
      totalNFTValue,
      data: result
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching data:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }
};

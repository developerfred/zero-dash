import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const safeBaseURL = 'https://safe-transaction-mainnet.safe.global/api/v1/safes';

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

const getTransactions = async (daoAddress: string, fromDate?: string, toDate?: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${safeBaseURL}/${daoAddress}/all-transactions/`, {
      params: {
        executed: false,
        queued: false,
        trusted: true,
        limit: 1000,
        offset: 0,
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      }
    });
    return response.data.results;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching transactions for ${daoAddress}:`, error.response ? error.response.data : error.message);
    } else {
      console.error(`Error fetching transactions for ${daoAddress}:`, error);
    }
    return [];
  }
};

const aggregateTransactions = (transactions: any[]): { date: string, count: number }[] => {
  const aggregated: { [key: string]: number } = {};

  transactions.forEach(transaction => {
    const date = transaction.submissionDate ? transaction.submissionDate.split('T')[0] : transaction.executionDate.split('T')[0];
    if (aggregated[date]) {
      aggregated[date] += 1;
    } else {
      aggregated[date] = 1;
    }
  });

  return Object.keys(aggregated).map(date => ({ date, count: aggregated[date] }));
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { fromDate, toDate } = req.query;
    const transactionPromises = Object.values(daoAddresses).map(daoAddress => getTransactions(daoAddress, fromDate as string, toDate as string));
    const allTransactions = await Promise.all(transactionPromises);

    const aggregatedTransactions = allTransactions.flat();
    const aggregatedData = aggregateTransactions(aggregatedTransactions);

    res.status(200).json(aggregatedData);
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

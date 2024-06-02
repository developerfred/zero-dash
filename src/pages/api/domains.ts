// @ts-nocheck
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';
import dayjs from 'dayjs';
import fetch from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';

const subgraphUrl = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

const client = new ApolloClient({
  link: new HttpLink({
    uri: subgraphUrl,
    fetch,
    headers: {
      'Referer': 'https://explorer.zero.tech/',
    },
  }),
  cache: new InMemoryCache(),
});

const GET_DOMAINS_QUERY = gql`
  query AllDomains($first: Int, $skip: Int, $orderBy: Domain_orderBy, $orderDirection: OrderDirection, $startTimestamp: Int, $endTimestamp: Int) {
    domains(skip: $skip, first: $first, orderBy: $orderBy, orderDirection: $orderDirection, where: {isWorld: false, creationTimestamp_gte: $startTimestamp, creationTimestamp_lte: $endTimestamp}) {
      id
      isReclaimable
      reclaimableAddress {
        id
      }
      zna
      minter {
        id
      }
      owner {
        id
      }
      label
      paymentType
      accessType
      tokenId
      creationBlock
      creationTimestamp
      paymentToken {
        id
        name
        symbol
        decimals
      }
    }
  }
`;

const GET_WORLDS_QUERY = gql`
  query AllWorlds($first: Int, $skip: Int, $orderBy: Domain_orderBy, $orderDirection: OrderDirection, $startTimestamp: Int, $endTimestamp: Int) {
    domains(skip: $skip, first: $first, orderBy: $orderBy, orderDirection: $orderDirection, where: {isWorld: true, creationTimestamp_gte: $startTimestamp, creationTimestamp_lte: $endTimestamp}) {
      id
      isReclaimable
      reclaimableAddress {
        id
      }
      zna
      minter {
        id
      }
      owner {
        id
      }
      label
      paymentType
      accessType
      tokenId
      creationBlock
      creationTimestamp
      subdomainCount
      pricerContract
      curvePriceConfig {
        maxPrice
      }
      fixedPriceConfig {
        price
      }
      paymentToken {
        id
        name
        symbol
        decimals
      }
    }
  }
`;

async function fetchDomains(variables) {
  console.log('Fetching domains with variables:', variables);
  const response = await client.query({
    query: GET_DOMAINS_QUERY,
    variables
  });
  console.log('Fetched domains data:', response.data);
  return response.data.domains;
}

async function fetchWorlds(variables) {
  console.log('Fetching worlds with variables:', variables);
  const response = await client.query({
    query: GET_WORLDS_QUERY,
    variables
  });
  console.log('Fetched worlds data:', response.data);
  return response.data.domains;
}

function calculateTimestamps(range) {
  const now = dayjs();
  let start;
  let end = now.unix(); // Default to current time

  switch (range) {
    case '24h':
      start = now.subtract(24, 'hours').unix();
      break;
    case '7d':
      start = now.subtract(7, 'days').unix();
      break;
    case '30d':
      start = now.subtract(30, 'days').unix();
      break;
    case '90d':
      start = now.subtract(90, 'days').unix();
      break;
    case '365d':
      start = now.subtract(365, 'days').unix();
      break;
    case 'today':
      start = now.startOf('day').unix();
      end = now.endOf('day').unix();
      break;
    case 'yesterday':
      start = now.subtract(1, 'day').startOf('day').unix();
      end = now.subtract(1, 'day').endOf('day').unix();
      break;
    case 'last_week':
      start = now.subtract(1, 'week').startOf('week').unix();
      end = now.subtract(1, 'week').endOf('week').unix();
      break;
    case 'last_month':
      start = now.subtract(1, 'month').startOf('month').unix();
      end = now.subtract(1, 'month').endOf('month').unix();
      break;
    case 'last_year':
      start = now.subtract(1, 'year').startOf('year').unix();
      end = now.subtract(1, 'year').endOf('year').unix();
      break;
    default:
      throw new Error('Invalid date range');
  }

  return { start, end };
}

export default async function handler(req, res) {
  const { range, orderBy = 'creationTimestamp', orderDirection = 'desc' } = req.query;

  console.log('Received request with query:', req.query);

  if (!range) {
    return res.status(400).json({ error: 'Date range is required' });
  }

  let start;
  let end;

  try {
    const timestamps = calculateTimestamps(range);
    start = timestamps.start;
    end = timestamps.end;
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  console.log('Computed timestamps:', { start, end });

  try {
    const variables = {
      first: 1000,
      skip: 0,
      orderBy,
      orderDirection,
      startTimestamp: start,
      endTimestamp: end
    };

    const [domains, worlds] = await Promise.all([
      fetchDomains(variables),
      fetchWorlds(variables)
    ]);

    const totalDomains = domains.length;
    const totalWorlds = worlds.length;

    const result = {
      totalDomainRegistrations: totalDomains + totalWorlds,
      totalDomains,
      totalWorlds,
      domains,
      worlds
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching data from subgraph:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do subgraph' });
  }
}
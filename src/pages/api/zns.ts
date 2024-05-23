//@ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';

const DUNE_API_KEY = process.env.DUNE_API_KEY || "";
const queryId = 3331485;

type ResponseData = {
    message: string;
    data?: any;
    error?: string;
}

const fetchDuneData = async (queryId: number, limit: number, offset: number) => {
    const url = `https://api.dune.com/api/v1/query/${queryId}/results?api_key=${DUNE_API_KEY}`;
    const response = await fetch(url);
    const result = await response.json();

    if (result && result.result && result.result.rows) {
        const filteredData = result.result.rows.slice(offset, offset + limit);
        return filteredData;
    } else {
        throw new Error('Invalid response data');
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const { limit = 1000, offset = 0 } = req.query;

    try {
        const queryResult = await fetchDuneData(
            queryId,
            parseInt(limit as string, 10),
            parseInt(offset as string, 10)
        );
        res.status(200).json({ message: 'Total domain registrations fetched successfully', data: queryResult });
    } catch (error) {
        console.error('Error fetching query result:', error);
        res.status(500).json({ message: 'Error fetching query result', error: error.message });
    }
}

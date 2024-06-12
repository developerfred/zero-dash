import type { NextApiRequest, NextApiResponse } from 'next';
import { DataPoint } from '@/app/types';
import { mockData } from '@/components/mockData';

type ResponseData = {
    message: string;
    data?: DataPoint[];
    error?: string;
};

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const { filter } = req.query;

    try {
        if (typeof filter !== 'string') {
            throw new Error('Invalid filter');
        }

        const data = mockData(filter);
        res.status(200).json({ message: 'Data fetched successfully', data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Error fetching data', error: message });
    }
}
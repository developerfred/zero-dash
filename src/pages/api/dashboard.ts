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
        const data = mockData(filter as string);
        res.status(200).json({ message: 'Data fetched successfully', data });
    } catch (error) {
        //@ts-ignore
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
}

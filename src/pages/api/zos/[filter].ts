// @ts-nocheck
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (filter !== '24h' && filter !== '48h' && filter !== '7d' && filter !== '30d' && filter !== '90d' && filter !== '365d') {
        return res.status(400).json({ error: 'Invalid filter. Only 24h , 48h and 7d are supported.' });
    }

    const { data: cachedData, error: cacheError } = await supabase
        .from('metrics')
        .select('*')
        .eq('filter', filter)
        .order('timestamp', { ascending: false })
        .limit(1);

    if (cacheError) {
        console.error('Error fetching data from Supabase:', cacheError);
        return res.status(500).json({ error: 'Error fetching data from Supabase' });
    }

    if (cachedData.length > 0) {
        return res.status(200).json(cachedData[0].data);
    } else {
        return res.status(404).json({ error: 'No data found' });
    }
};

export default handler;

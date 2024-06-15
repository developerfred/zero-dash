import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const GHOST_API_URL = 'https://wilderworld.ghost.io/ghost/api/content/posts/';
const GHOST_API_KEY = process.env.ZINE_WORK_KEY;

const dateRanges = {
    '24h': { startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), endDate: new Date().toISOString() },
    '7d': { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), endDate: new Date().toISOString() },
    '30d': { startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(), endDate: new Date().toISOString() },
    '90d': { startDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(), endDate: new Date().toISOString() },
    '365d': { startDate: new Date(new Date().setDate(new Date().getDate() - 365)).toISOString(), endDate: new Date().toISOString() },
    'today': { startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(), endDate: new Date().toISOString() },
    'yesterday': { startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), endDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString() },
    'last_week': { startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(), endDate: new Date().toISOString() },
    'last_month': { startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), endDate: new Date().toISOString() },
    'last_year': { startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), endDate: new Date().toISOString() },
};

const groupPostsByDate = (posts) => {
    return posts.reduce((acc, post) => {
        const date = new Date(post.published_at).toISOString().split('T')[0];
        if (!acc[date]) {
            acc[date] = {
                date: date,
                numberOfPosts: 0,
                posts: []
            };
        }
        acc[date].posts.push(post);
        acc[date].numberOfPosts += 1;
        return acc;
    }, {});
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { filter } = req.query;

    if (!filter || !dateRanges[filter]) {
        return res.status(400).json({ error: 'Invalid or missing filter parameter' });
    }

    const { startDate, endDate } = dateRanges[filter];

    try {
        const response = await axios.get(GHOST_API_URL, {
            params: {
                key: GHOST_API_KEY,
                filter: `published_at:>=${startDate}+published_at:<=${endDate}`,
                fields: 'id,title,slug,published_at,updated_at,feature_image',
            },
        });

        const posts = response.data.posts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            published_at: post.published_at,
            updated_at: post.updated_at,
            feature_image: post.feature_image,
        }));

        const groupedPosts = groupPostsByDate(posts);

        const result = Object.values(groupedPosts);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching posts from Ghost:', error);
        res.status(500).json({ error: 'Failed to fetch data from Ghost' });
    }
};

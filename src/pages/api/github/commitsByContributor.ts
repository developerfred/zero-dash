import { NextApiRequest, NextApiResponse } from 'next';
import { octokit } from '@/app/lib/github';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { organization, startDate, endDate } = req.query;

        if (!organization) {
            return res.status(400).json({ error: 'Organization parameter is required' });
        }

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date parameters are required' });
        }

        const repos = await octokit.repos.listForOrg({
            org: organization as string,
            type: 'all',
        });

        const contributionsPromises = repos.data.map(async (repo) => {
            const commits = await octokit.repos.listCommits({
                owner: organization as string,
                repo: repo.name,
                since: new Date(startDate as string).toISOString(),
                until: new Date(endDate as string).toISOString(),
            });

            const contributors = new Map();

            commits.data.forEach(commit => {
                const author = commit.author?.login || 'unknown';
                if (contributors.has(author)) {
                    contributors.set(author, contributors.get(author) + 1);
                } else {
                    contributors.set(author, 1);
                }
            });

            return {
                repoName: repo.name,
                contributors: Array.from(contributors.entries()).map(([name, count]) => ({ name, count })),
            };
        });

        const contributionsData = await Promise.all(contributionsPromises);

        res.status(200).json(contributionsData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
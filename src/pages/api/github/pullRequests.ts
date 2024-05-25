import { NextApiRequest, NextApiResponse } from 'next';
import { octokit } from '@/app/lib/github';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { organization } = req.query;

        if (!organization) {
            return res.status(400).json({ error: 'Organization parameter is required' });
        }

        const repos = await octokit.repos.listForOrg({
            org: organization as string,
            type: 'all',
        });

        const prDataPromises = repos.data.map(async (repo) => {
            const openPRs = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'open',
            });

            const closedPRs = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'closed',
            });

            const mergedPRs = closedPRs.data.filter((pr) => pr.merged_at !== null).length;

            return {
                repoName: repo.name,
                openPRs: openPRs.data.length,
                closedPRs: closedPRs.data.length - mergedPRs,
                mergedPRs,
            };
        });

        const prData = await Promise.all(prDataPromises);

        res.status(200).json(prData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
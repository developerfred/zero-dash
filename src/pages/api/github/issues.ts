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

        const issuesDataPromises = repos.data.map(async (repo) => {
            const openIssues = await octokit.issues.listForRepo({
                owner: organization as string,
                repo: repo.name,
                state: 'open',
            });

            const closedIssues = await octokit.issues.listForRepo({
                owner: organization as string,
                repo: repo.name,
                state: 'closed',
            });

            return {
                repoName: repo.name,
                openIssues: openIssues.data.length,
                closedIssues: closedIssues.data.length,
            };
        });

        const issuesData = await Promise.all(issuesDataPromises);

        res.status(200).json(issuesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
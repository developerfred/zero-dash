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

        const resolutionTimePromises = repos.data.map(async (repo) => {
            const issues = await octokit.issues.listForRepo({
                owner: organization as string,
                repo: repo.name,
                state: 'closed',
            });

            let totalResolutionTime = 0;
            issues.data.forEach(issue => {
                const createdTime = new Date(issue.created_at).getTime();
                const closedTime = new Date(issue.closed_at!).getTime();
                totalResolutionTime += closedTime - createdTime;
            });

            const averageResolutionTime = issues.data.length ? totalResolutionTime / issues.data.length : 0;

            return {
                repoName: repo.name,
                averageResolutionTime: averageResolutionTime / (1000 * 60 * 60 * 24), // convert to days
            };
        });

        const resolutionTimes = await Promise.all(resolutionTimePromises);

        res.status(200).json(resolutionTimes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
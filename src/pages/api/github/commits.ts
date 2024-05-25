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

        const commitDataPromises = repos.data.map(async (repo) => {
            const commits = await octokit.repos.listCommits({
                owner: organization as string,
                repo: repo.name,
            });

            return { repoName: repo.name, commitCount: commits.data.length };
        });

        const commitData = await Promise.all(commitDataPromises);

        res.status(200).json(commitData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
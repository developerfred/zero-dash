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

        const mergeTimePromises = repos.data.map(async (repo) => {
            const pullRequests = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'closed',
            });

            let totalMergeTime = 0;
            let mergedCount = 0;
            pullRequests.data.forEach(pr => {
                if (pr.merged_at) {
                    const createdTime = new Date(pr.created_at).getTime();
                    const mergedTime = new Date(pr.merged_at).getTime();
                    totalMergeTime += mergedTime - createdTime;
                    mergedCount++;
                }
            });

            const averageMergeTime = mergedCount ? totalMergeTime / mergedCount : 0;

            return {
                repoName: repo.name,
                averageMergeTime: averageMergeTime / (1000 * 60 * 60 * 24), // convert to days
            };
        });

        const mergeTimes = await Promise.all(mergeTimePromises);

        res.status(200).json(mergeTimes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
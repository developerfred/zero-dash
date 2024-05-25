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

        const codeChangesPromises = repos.data.map(async (repo) => {
            const commits = await octokit.repos.listCommits({
                owner: organization as string,
                repo: repo.name,
            });

            let additions = 0;
            let deletions = 0;

            for (const commit of commits.data) {
                const commitDetails = await octokit.repos.getCommit({
                    owner: organization as string,
                    repo: repo.name,
                    ref: commit.sha,
                });

                additions += commitDetails.data.stats?.additions || 0;
                deletions += commitDetails.data.stats?.deletions || 0;
            }

            return {
                repoName: repo.name,
                additions,
                deletions,
            };
        });

        const codeChangesData = await Promise.all(codeChangesPromises);

        res.status(200).json(codeChangesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
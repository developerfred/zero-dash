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
            const issues = await octokit.issues.listForRepo({
                owner: organization as string,
                repo: repo.name,
            });

            const contributors = new Map();

            for (const issue of issues.data) {
                const author = issue.user?.login || 'unknown';
                if (contributors.has(author)) {
                    contributors.set(author, contributors.get(author) + 1);
                } else {
                    contributors.set(author, 1);
                }
            }

            return {
                repoName: repo.name,
                contributors: Array.from(contributors.entries()).map(([name, count]) => ({ name, count })),
            };
        });

        const issuesData = await Promise.all(issuesDataPromises);

        res.status(200).json(issuesData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
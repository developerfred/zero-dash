import { NextApiRequest, NextApiResponse } from 'next';
import { loadOrganizationRepos } from '@/app/lib/githubHelpers';
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

        const startIso = new Date(startDate as string).toISOString();
        const endIso = new Date(endDate as string).toISOString();

        const repos = await loadOrganizationRepos(organization as string);

        const prDataPromises = repos.map(async (repo) => {
            const openPRs = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'open',
                since: startIso,
            });

            const closedPRs = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'closed',
                since: startIso,
                until: endIso,
            });

            const mergedPRs = closedPRs.data.filter((pr) => pr.merged_at !== null && new Date(pr.merged_at) <= new Date(endIso)).length;

            return {
                repoName: repo.name,
                openPRs: openPRs.data.filter((pr) => new Date(pr.created_at) <= new Date(endIso)).length,
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

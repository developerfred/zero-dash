// @ts-nocheck

import { NextApiRequest, NextApiResponse } from 'next';
import { octokit } from '@/app/lib/github';

const getIssuesData = async (organization, startIso, endIso) => {
    const repos = await octokit.repos.listForOrg({
        org: organization,
        type: 'all',
    });

    const issuesDataPromises = repos.data.map(async (repo) => {
        const issues = await octokit.issues.listForRepo({
            owner: organization,
            repo: repo.name,
            since: startIso,
            state: 'all',
        });

        const openIssues = issues.data.filter(issue => issue.state === 'open' && new Date(issue.created_at) <= new Date(endIso));
        const closedIssues = issues.data.filter(issue => issue.state === 'closed' && new Date(issue.closed_at) >= new Date(startIso) && new Date(issue.closed_at) <= new Date(endIso));

        return {
            repoName: repo.name,
            openIssues: openIssues.length,
            closedIssues: closedIssues.length,
        };
    });

    return Promise.all(issuesDataPromises);
};

const calculateTotals = (issuesData) => {
    const totalOpenIssues = issuesData.reduce((acc, repo) => acc + repo.openIssues, 0);
    const totalClosedIssues = issuesData.reduce((acc, repo) => acc + repo.closedIssues, 0);

    return { totalOpenIssues, totalClosedIssues };
};

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

        const issuesData = await getIssuesData(organization, startIso, endIso);
        const totals = calculateTotals(issuesData);

        const responseData = { issuesData, ...totals };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub', details: error.message });
    }
};

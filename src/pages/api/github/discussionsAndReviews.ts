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

        const reviewsDataPromises = repos.data.map(async (repo) => {
            const pullRequests = await octokit.pulls.list({
                owner: organization as string,
                repo: repo.name,
                state: 'all',
            });

            const reviewers = new Map();

            for (const pr of pullRequests.data) {
                const reviews = await octokit.pulls.listReviews({
                    owner: organization as string,
                    repo: repo.name,
                    pull_number: pr.number,
                });

                for (const review of reviews.data) {
                    const reviewer = review.user?.login || 'unknown';
                    if (reviewers.has(reviewer)) {
                        reviewers.set(reviewer, reviewers.get(reviewer) + 1);
                    } else {
                        reviewers.set(reviewer, 1);
                    }
                }
            }

            return {
                repoName: repo.name,
                reviewers: Array.from(reviewers.entries()).map(([name, count]) => ({ name, count })),
            };
        });

        const reviewsData = await Promise.all(reviewsDataPromises);

        res.status(200).json(reviewsData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
};
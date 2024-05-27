import { octokit } from '@/app/lib/github';

export const loadOrganizationRepos = async (organization: string) => {
    const repos = await octokit.repos.listForOrg({
        org: organization,
        type: 'all',
    });

    return repos.data;
};

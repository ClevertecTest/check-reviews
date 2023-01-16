const core = require('@actions/core');
const github = require('@actions/github');
const { request } = require('@octokit/request');
const fs = require('fs');

const REVIEWS = {
    COMMENTED: 'Есть комментарии',
    CHANGES_REQUESTED: 'Нужно поработать',
}

const main = async () => {
    try {
        const owner = core.getInput('owner', { required: true });
        const repo = core.getInput('repo', { required: true });
        const pull_number = core.getInput('pull_number', { required: true });
        const token = core.getInput('token', { required: true });
        const url = 'https://training.cleverland.by/pull-request/reviewed';

        const octokit = new github.getOctokit(token);

        const { data: reviews } = await octokit.rest.pulls.listReviews({
            owner,
            repo,
            pull_number,
        });

        const responseCommitsStatuses = reviews.map(({ state }) => state);

        if (responseCommitsStatuses.includes('COMMENTED') || 'CHANGES_REQUESTED') {
            await request(`POST ${url}`, {
                data: {
                    github: owner,
                    isApproved: false,
                }
            });
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

main();
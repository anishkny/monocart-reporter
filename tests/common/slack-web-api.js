const path = require('path');
const { WebClient } = require('@slack/web-api');
const EC = require('eight-colors');
const dotenv = require('dotenv');
module.exports = async (reportData, capacity) => {

    // send notifications to a single channel which the user picks on installation
    // Sending messages using Incoming Webhooks: https://api.slack.com/messaging/webhooks

    // do not store your slack token in the source code, but pass your slack token from environment variables
    dotenv.config();
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);

    const {
        name, dateH, durationH, summary, htmlPath
    } = reportData;


    // https://slack.dev/node-slack-sdk/web-api

    // Given some known conversation ID (representing a public channel, private channel, DM or group DM)
    const channelId = 'C050T9D1CH5';
    // Creating interactive messages: https://api.slack.com/messaging/interactivity
    const message = {
        channel: channelId,
        text: name,
        blocks: [{
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${name}* ${dateH} (${durationH})`
            }
        }, {
            type: 'divider'
        }, {
            type: 'section',
            // no more than 10 fields
            fields: ['tests', 'passed', 'flaky', 'skipped', 'failed'].map((k) => {
                const item = summary[k];
                const percent = item.percent ? ` (${item.percent})` : '';
                return {
                    type: 'mrkdwn',
                    text: `*${item.name}:* ${item.value} ${percent}`
                };
            })
        }]
    };

    if (summary.passed.value === summary.tests.value) {
        message.blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: '✔ Congratulations! All tests passed.'
            }
        });
    } else if (summary.failed.value > 0) {
        // @owners of all failed cases
        const owners = [];
        capacity.forEach((item) => {
            if (item.type === 'case' && item.caseType === 'failed' && item.owner) {
                owners.push(`@${item.owner}`);
            }
        });
        if (owners.length) {
            message.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Hey ${owners.join(' ')}, please fix the failed cases and run test again.`
                }
            });
        }
    }

    // console.log(JSON.stringify(message));

    await web.chat.postMessage(message).catch((err) => {
        // console.log(err);
        EC.logRed(err.message);
        EC.logRed(`[slack] failed to post message to channel ${channelId}`);
    });

    EC.logCyan('[slack] uploading report file ... ');
    // or upload report file
    await web.files.uploadV2({
        initial_comment: 'Here is the test report (download and open in browser)',
        channel_id: channelId,
        file_uploads: [{
            file: path.resolve(htmlPath),
            filename: `${name}-${dateH}.html`
        }]
    }).catch((err) => {
        console.log(err);
        EC.logRed(err.message);
        EC.logRed(`[slack] failed to upload file to channel ${channelId}`);
    });

};

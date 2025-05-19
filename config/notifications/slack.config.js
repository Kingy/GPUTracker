/**
 * Slack notification configuration
 */
module.exports = {
  name: 'Slack GPU Alerts',
  type: 'slack',
  active: true,
  config: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR_WEBHOOK_URL',
    channel: '#gpu-alerts',
    username: 'GPU Tracker Bot',
    icon_emoji: ':computer:'
  }
};
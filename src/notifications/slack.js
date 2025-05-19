const BaseNotification = require('./base');
const axios = require('axios');
const logger = require('../utils/logger');

class SlackNotification extends BaseNotification {
  constructor(config) {
    super(config);
    this.validateConfig();
  }

  /**
   * Validates the Slack webhook configuration
   */
  validateConfig() {
    if (!this.config.webhookUrl) {
      throw new Error('Slack webhook URL is required');
    }
  }

  /**
   * Sends a notification to a Slack channel using webhooks
   */
  async send(message, data) {
    try {
      const { title, price, stockStatus, retailer, url, timestamp } = data;
      
      // Create a rich Slack message with blocks
      const slackMessage = {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'GPU Tracker Alert',
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${message}*`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*GPU:*\n${title}`
              },
              {
                type: 'mrkdwn',
                text: `*Price:*\n${price}`
              },
              {
                type: 'mrkdwn',
                text: `*Stock Status:*\n${stockStatus}`
              },
              {
                type: 'mrkdwn',
                text: `*Retailer:*\n${retailer}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Product',
                  emoji: true
                },
                url
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Notification sent at: ${new Date(timestamp).toLocaleString()}`
              }
            ]
          }
        ]
      };

      // Send the message to Slack
      const response = await axios.post(this.config.webhookUrl, slackMessage);
      
      if (response.status === 200 && response.data === 'ok') {
        logger.info(`Slack notification sent successfully to ${this.name}`);
        return true;
      } else {
        throw new Error(`Slack API returned: ${response.status} - ${response.data}`);
      }
    } catch (error) {
      logger.error(`Error sending Slack notification: ${error.message}`);
      throw error;
    }
  }
}

module.exports = SlackNotification;

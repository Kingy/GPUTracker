const BaseNotification = require('./base');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailNotification extends BaseNotification {
  constructor(config) {
    super(config);
    this.validateConfig();
    this.transporter = this.createTransporter();
  }

  /**
   * Validates the email configuration
   */
  validateConfig() {
    const requiredFields = ['host', 'port', 'secure', 'auth', 'from', 'to'];
    
    for (const field of requiredFields) {
      if (!this.config[field]) {
        throw new Error(`Email ${field} is required`);
      }
    }
    
    if (this.config.auth) {
      if (!this.config.auth.user || !this.config.auth.pass) {
        throw new Error('Email auth requires both user and pass');
      }
    }
  }

  /**
   * Creates a nodemailer transporter based on the configuration
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      }
    });
  }

  /**
   * Sends an email notification
   */
  async send(message, data) {
    try {
      const { title, price, stockStatus, retailer, url, timestamp } = data;
      
      // Create a nice HTML email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">GPU Tracker Alert</h1>
          
          <p style="font-size: 16px; font-weight: bold; color: #333;">${message}</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 100px;">GPU:</td>
                <td style="padding: 8px;">${title}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Price:</td>
                <td style="padding: 8px;">${price}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Status:</td>
                <td style="padding: 8px;">${stockStatus}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Retailer:</td>
                <td style="padding: 8px;">${retailer}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Product</a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            Notification sent at: ${new Date(timestamp).toLocaleString()}
          </p>
        </div>
      `;
      
      // Configure the email
      const mailOptions = {
        from: this.config.from,
        to: this.config.to,
        subject: `GPU Alert: ${title} is ${stockStatus} at ${retailer}`,
        html: htmlContent,
        text: `${message}\n\nGPU: ${title}\nPrice: ${price}\nStatus: ${stockStatus}\nRetailer: ${retailer}\n\nView Product: ${url}\n\nNotification sent at: ${new Date(timestamp).toLocaleString()}`
      };
      
      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email notification sent successfully to ${this.config.to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`Error sending email notification: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EmailNotification;

/**
 * Email notification configuration
 */
module.exports = {
  name: 'Email GPU Alerts',
  type: 'email',
  active: true,
  config: {
    // SMTP Settings
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'user@example.com',
      pass: process.env.EMAIL_PASS || 'password'
    },
    // Email Settings
    from: process.env.EMAIL_FROM || 'gpu-tracker@example.com',
    to: process.env.EMAIL_TO || 'user@example.com',
    // Template Settings
    subject: 'GPU Alert: {product_name} - {status}',
    includeImages: true,
    priority: 'high',
    // Batch notifications (to avoid email flooding)
    batchEnabled: true,
    batchInterval: 15 * 60 * 1000, // 15 minutes
    // Retry Settings
    maxRetries: 3,
    retryDelay: 5 * 60 * 1000  // 5 minutes
  }
};
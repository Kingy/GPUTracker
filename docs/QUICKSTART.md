# Quick Start Guide

This guide will help you get the GPU Tracker up and running quickly.

## 1. Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Git

## 2. Clone the Repository

```bash
git clone https://github.com/yourusername/gpu-tracker.git
cd gpu-tracker
```

## 3. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

## 4. Configure Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file and set up your notification credentials:

```
# For Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK_URL

# For email notifications
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_password
EMAIL_FROM=gpu-tracker@example.com
EMAIL_TO=notifications@example.com
```

## 5. Initialize the Database

Run the database initialization script:

```bash
npm run db:init
```

## 6. Configure Retailers and Products

Edit the retailer configuration files in the `config/retailers/` directory to track specific products:

### Example: Adding a new GPU to track at BestBuy

Open `config/retailers/bestbuy.config.js` and add a new product to the `products` array:

```javascript
products: [
  // Existing products...
  {
    title: 'EVGA - NVIDIA GeForce RTX 5080 16GB GDDR7 PCI Express 5.0 Graphics Card',
    product_id: '6623789',
    product_url: 'https://www.bestbuy.com/site/-/6623789.p',
    gpu_model: 'RTX 5080',
    brand: 'EVGA'
  }
]
```

### Adding a New Retailer

A basic retailer configuration requires:
- A unique name
- Base URL
- CSS selectors for price, stock status, and product information
- List of products to track

See [EXTENDING.md](EXTENDING.md) for more details.

## 7. Configure Alerts

Alerts are set up in the database. The application will automatically detect when a product's stock or price changes and send notifications based on your configuration.

In this early version, you can configure alerts through the database directly or by modifying the `AlertModel` implementation.

## 8. Start the Application

Start the GPU Tracker:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

## 9. Verify Operation

Check the logs to ensure the application is working correctly:

```
info: GPU Tracker application initialized successfully
info: HTTP server listening on port 3000
info: Product check scheduler started
info: Starting scheduled product check...
info: Checking products for BestBuy...
```

You can also check the application status via the API:

```bash
curl http://localhost:3000/api/health
```

## 10. Trigger a Manual Check

You can trigger a manual check of all products via the API:

```bash
curl -X POST http://localhost:3000/api/check
```

## Troubleshooting

If you encounter any issues:

1. Check the logs in the `logs/` directory
2. Enable debug mode by setting `DEBUG_MODE=true` in your `.env` file
3. Make sure your notification credentials are correct
4. Verify that the product URLs and CSS selectors are valid

For more detailed information, refer to the full documentation in the README.md file.

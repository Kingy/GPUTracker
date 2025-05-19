# GPU Stock and Price Tracker

A Node.js application that monitors stock availability and prices of the latest GPUs across multiple retailers.

## Overview

This application tracks GPUs (NVIDIA 50 Series, AMD 9000 series, etc.) from various retailers such as Amazon, Newegg, BestBuy, B&H, and Nvidia. It monitors stock availability and price changes, sending notifications through configurable channels like Slack and email when specified conditions are met.

## Features

- **Multi-retailer Support**: Extensible framework to add and configure different online retailers
- **Flexible Product Tracking**: Track specific GPU makes, models, and brands
- **Custom Notifications**: Set up alerts based on stock availability, price thresholds, or other conditions
- **Multiple Notification Channels**: Send alerts via Slack, email, and easily add more channels
- **Resilient Operation**: Designed for continuous operation with error handling and recovery
- **Configurable Scheduling**: Adjust how frequently retailers are checked
- **Detailed Logging**: Comprehensive logging system with configurable levels

## Technical Overview

- **Database**: SQLite for lightweight, persistent storage
- **Web Scraping**: Puppeteer for interacting with retailer websites
- **Architecture**: Object-oriented design with a modular, extensible approach
- **Operation Mode**: Runs as a continuous service with scheduled checking
- **Resilience**: Error handling, retries, and monitoring to ensure reliable operation

## Project Structure

```
gpu-tracker/
├── config/                  # Configuration files
│   ├── app.config.js        # Main application config
│   ├── retailers/           # Retailer-specific configurations
│   └── notifications/       # Notification channel configs
├── src/
│   ├── app.js               # Main application entry point
│   ├── db/                  # Database modules
│   │   ├── models/          # Database models
│   │   └── migrations/      # Database migrations
│   ├── retailers/           # Retailer-specific modules
│   │   ├── base.js          # Base retailer class
│   │   ├── amazon.js        # Amazon implementation
│   │   ├── bestbuy.js       # BestBuy implementation
│   │   └── ...              # Other retailers
│   ├── products/            # Product handling
│   │   ├── gpu.js           # GPU product model
│   │   └── ...              # Other product-related code
│   ├── scraper/             # Web scraping functionality
│   │   ├── browser.js       # Browser management
│   │   └── scrapers/        # Specific scraping strategies
│   ├── notifications/       # Notification system
│   │   ├── base.js          # Base notification class
│   │   ├── slack.js         # Slack notifications
│   │   ├── email.js         # Email notifications
│   │   └── ...              # Other notification channels
│   ├── scheduler/           # Scheduling system
│   │   └── index.js         # Scheduler implementation
│   └── utils/               # Utility functions
│       ├── logger.js        # Logging functionality
│       └── ...              # Other utilities
├── docs/                    # Documentation
│   └── EXTENDING.md         # Guide for extending the application
├── tests/                   # Test suite
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── LICENSE                  # GNU GPL v3 License
├── package.json             # NPM package file
└── README.md                # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and configure with your settings
4. Initialize the database:
   ```
   npm run db:init
   ```
5. Start the application:
   ```
   npm start
   ```

## Configuration

### Retailers

Add and configure retailers in the `config/retailers/` directory. Each retailer requires specific information about how to scrape their website.

Example retailer configuration:

```javascript
// config/retailers/bestbuy.config.js
module.exports = {
  name: 'BestBuy',
  url: 'https://www.bestbuy.com',
  active: true,
  selectors: {
    price: '.priceView-customer-price span',
    addToCartButton: '.add-to-cart-button',
    soldOutButton: '.btn-disabled',
    productTitle: '.heading-5.v-fw-regular'
  },
  products: [
    {
      title: 'GIGABYTE - NVIDIA GeForce RTX 5070 WINDFORCE OC SFF 12G GDDR7 PCI Express 5.0 Graphics Card - Black',
      product_id: '6621265',
      product_url: 'https://www.bestbuy.com/site/-/6621265.p',
      gpu_model: 'RTX 5070',
      brand: 'GIGABYTE'
    }
  ]
};
```

### Products

Configure which GPUs to track in the database or through the future admin interface. You can add products through the API or directly in the retailer configuration files.

### Notifications

Set up notification channels in the `config/notifications/` directory with credentials and preferences.

Example Slack configuration:

```javascript
// config/notifications/slack.config.js
module.exports = {
  name: 'Slack GPU Alerts',
  type: 'slack',
  active: true,
  config: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: '#gpu-alerts',
    username: 'GPU Tracker Bot',
    icon_emoji: ':computer:'
  }
};
```

## Usage

### Basic Commands

- Start the application: `npm start`
- Run in development mode with auto-restart: `npm run dev`
- Initialize/reset the database: `npm run db:init`

### API Endpoints

The application exposes a simple API:

- `GET /api/health` - Check application status
- `POST /api/check` - Trigger a manual check of all products

## Extending the Application

The GPU Tracker is designed to be easily extensible. You can add new retailers, notification channels, and customize alert conditions.

See [EXTENDING.md](docs/EXTENDING.md) for detailed instructions on how to extend the application.

## Future Enhancements

- Web UI for configuration and monitoring
- Additional notification channels (Discord, Telegram, etc.)
- Price history tracking and analytics
- Stock prediction based on historical patterns
- Support for additional product categories beyond GPUs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

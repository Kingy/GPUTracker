/**
 * BestBuy retailer configuration
 */
module.exports = {
  name: 'BestBuy',
  url: 'https://www.bestbuy.com',
  active: true,
  // Specific scraping configurations for BestBuy
  selectors: {
    price: '.priceView-customer-price span',
    addToCartButton: '.add-to-cart-button',
    soldOutButton: '.btn-disabled',
    productTitle: '.heading-5.v-fw-regular'
  },
  // Specific products to track (examples)
  products: [
    {
      title: 'GIGABYTE - NVIDIA GeForce RTX 5070 WINDFORCE OC SFF 12G GDDR7 PCI Express 5.0 Graphics Card - Black',
      product_id: '6621265',
      product_url: 'https://www.bestbuy.com/site/-/6621265.p',
      gpu_model: 'RTX 5070',
      brand: 'GIGABYTE'
    },
    {
      title: 'ASUS - TUF Gaming NVIDIA GeForce RTX 5080 OC Edition Graphics Card (PCIe 5.0, 16GB GDDR7)',
      product_id: '6621432',
      product_url: 'https://www.bestbuy.com/site/-/6621432.p',
      gpu_model: 'RTX 5080',
      brand: 'ASUS'
    }
  ],
  // Retry settings
  retryLimit: 3,
  retryDelay: 5000, // 5 seconds
  // Rate limiting settings
  requestDelay: 3000, // 3 seconds between requests
  // Browser settings
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
};
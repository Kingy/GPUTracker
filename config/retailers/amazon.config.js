/**
 * Amazon retailer configuration
 */
module.exports = {
  name: 'Amazon',
  url: 'https://www.amazon.com',
  active: true,
  // Specific scraping configurations for Amazon
  selectors: {
    price: '#priceblock_ourprice, .a-offscreen',
    availability: '#availability span',
    addToCartButton: '#add-to-cart-button',
    productTitle: '#productTitle'
  },
  // Specific products to track (examples)
  products: [
    {
      title: 'PNY GeForce RTX 5070 12GB XLR8 Gaming VERTO Epic-X RGB Triple Fan Graphics Card',
      product_id: 'B0BXPRW1NF',
      product_url: 'https://www.amazon.com/dp/B0BXPRW1NF',
      gpu_model: 'RTX 5070',
      brand: 'PNY'
    },
    {
      title: 'MSI Gaming GeForce RTX 5080 16GB GDRR7 256-Bit HDMI/DP Nvlink PCI Express 5.0 Graphics Card',
      product_id: 'B0BXPT5BZL',
      product_url: 'https://www.amazon.com/dp/B0BXPT5BZL',
      gpu_model: 'RTX 5080',
      brand: 'MSI'
    }
  ],
  // Retry settings
  retryLimit: 3,
  retryDelay: 10000, // 10 seconds
  // Rate limiting settings (Amazon is more strict)
  requestDelay: 10000, // 10 seconds between requests
  // Browser settings
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
};
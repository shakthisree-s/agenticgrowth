import { MerchandisingResult, Product, Customer } from '../types';
import { catalogService } from '../services/catalogService';

export class MerchandisingAgent {
  public readonly id = 'MERCHANDISING' as const;
  public readonly name = 'Merchandising Agent';
  public readonly role = 'Increase average basket value through catalog intelligence, cross-sell, and upsell';
  public readonly tools = [
    'CatalogSearchEngine',
    'ProductAffinityGraph',
    'BundleOptimizer',
    'DynamicPriceRules'
  ];

  public decide(params: {
    customer: Customer;
    currentProduct?: Product;
    type?: 'UPSELL' | 'CROSS_SELL' | 'BUNDLE';
  }): MerchandisingResult {
    const { customer, type = 'CROSS_SELL' } = params;
    const allProducts = catalogService.getAllProducts();

    // Default target product if not passed
    let target = params.currentProduct;
    if (!target) {
      target = allProducts.find(p => p.name === customer.behavior.lastViewedProduct) || allProducts[0];
    }

    // Check target product cross-sell affinity
    if (type === 'CROSS_SELL' && target.crossSellAffinity.length > 0) {
      const topAffinity = target.crossSellAffinity[0];
      const addonProduct = catalogService.getProductById(topAffinity.productId) || allProducts[3];

      return {
        type: 'CROSS_SELL',
        targetProductId: target.id,
        targetProductName: target.name,
        recommendedProductId: addonProduct.id,
        recommendedProductName: addonProduct.name,
        price: addonProduct.price,
        expectedRevenue: addonProduct.price,
        confidence: topAffinity.affinityScore,
        reasoning: [
          `Target item: ${target.name} (₹${target.price.toLocaleString('en-IN')})`,
          `Affinity relationship: ${topAffinity.reason}`,
          `Historical co-purchase frequency: ${Math.round(topAffinity.affinityScore * 100)}%`,
          `Low price elasticity for complementary accessory item`
        ],
        affinityScore: topAffinity.affinityScore
      };
    }

    // Upsell path: e.g. SwiftRun -> Velocity Runner X Pro
    if (type === 'UPSELL') {
      const higherTier = allProducts.find(p => p.price > target.price) || allProducts[0];
      const priceDelta = higherTier.price - target.price;

      return {
        type: 'UPSELL',
        targetProductId: target.id,
        targetProductName: target.name,
        recommendedProductId: higherTier.id,
        recommendedProductName: higherTier.name,
        price: higherTier.price,
        expectedRevenue: priceDelta > 0 ? priceDelta : 1500,
        confidence: 0.94,
        reasoning: [
          `Customer shows high technical engagement with spec comparison`,
          `Upgrading to carbon-infused propulsion plate offers 2.4x higher satisfaction`,
          `Within merchant price delta tolerance (+₹${(priceDelta > 0 ? priceDelta : 1500).toLocaleString('en-IN')})`
        ],
        affinityScore: 0.94
      };
    }

    // Fallback cross-sell
    const defaultAddon = allProducts.find(p => p.category.includes('Accessories')) || allProducts[3];
    return {
      type: 'CROSS_SELL',
      targetProductId: target.id,
      targetProductName: target.name,
      recommendedProductId: defaultAddon.id,
      recommendedProductName: defaultAddon.name,
      price: defaultAddon.price,
      expectedRevenue: defaultAddon.price,
      confidence: 0.91,
      reasoning: [
        `Recommended high-margin accessory companion for ${target.name}`,
        `Zero friction 1-click checkout bundle`
      ],
      affinityScore: 0.91
    };
  }
}

export const merchandisingAgent = new MerchandisingAgent();

import { shoppingSearchService } from '../shoppingSearchService';
import { INITIAL_MERCHANT_PRODUCTS } from '../merchantData';
import { Product } from '../../types';

export function runShoppingSearchTests() {
  console.log('====================================================');
  console.log('RUNNING MULTI-MERCHANT SHOPPING SEARCH TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, failureDetails?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (failureDetails) console.error(`   Details: ${failureDetails}`);
      failed++;
    }
  }

  const sportsProducts = INITIAL_MERCHANT_PRODUCTS['merchant_sports'];
  const fashionProducts = INITIAL_MERCHANT_PRODUCTS['merchant_fashion'];
  const techProducts = INITIAL_MERCHANT_PRODUCTS['merchant_tech'];

  // TEST 1: Sports Store - "running shoes under 7000"
  {
    const result = shoppingSearchService.searchCatalog('running shoes under 7000', sportsProducts, 'UrbanKart');
    assert(
      result.matchedProducts.length === 2,
      'Test 1a: Sports Store returns 2 running shoes under ₹7,000',
      `Returned ${result.matchedProducts.length} products: ${result.matchedProducts.map(p => p.name).join(', ')}`
    );
    assert(
      result.matchedProducts.some(p => p.name.includes('Velocity Runner X')),
      'Test 1b: Returns Velocity Runner X (₹6,999)'
    );
    assert(
      !result.matchedProducts.some(p => p.category.toLowerCase().includes('fashion')),
      'Test 1c: ZERO fashion products returned in Sports Store'
    );
  }

  // TEST 2: Fashion Store - "kurti under 1000"
  {
    const result = shoppingSearchService.searchCatalog('kurti under 1000', fashionProducts, 'FashionHub');
    assert(
      result.matchedProducts.length >= 1,
      'Test 2a: Fashion Store finds kurti under ₹1,000',
      `Returned ${result.matchedProducts.length} items: ${result.matchedProducts.map(p => p.name).join(', ')}`
    );
    assert(
      result.matchedProducts.some(p => p.name.includes('Urban Performance Kurti')),
      'Test 2b: Finds Urban Performance Kurti (₹899)'
    );
    assert(
      !result.matchedProducts.some(p => p.name.includes('Phone') || p.name.includes('Runner')),
      'Test 2c: ZERO tech or sports products returned in Fashion Store'
    );
  }

  // TEST 3: Electronics Store - "laptop accessories"
  {
    const result = shoppingSearchService.searchCatalog('laptop accessories', techProducts, 'TechNest');
    assert(
      result.matchedProducts.length >= 2,
      'Test 3a: Tech Store matches laptop accessories',
      `Returned: ${result.matchedProducts.map(p => p.name).join(', ')}`
    );
    assert(
      result.matchedProducts.some(p => p.name.includes('Laptop') || p.name.includes('Mouse')),
      'Test 3b: Matched laptop stand / mouse in Tech Store'
    );
    assert(
      !result.matchedProducts.some(p => p.category.toLowerCase().includes('fashion')),
      'Test 3c: ZERO fashion items in Tech Store'
    );
  }

  // TEST 4: Dynamic Product Addition to Fashion Store
  {
    const newKurti: Product = {
      id: 'prod_summer_kurti',
      merchantId: 'merchant_fashion',
      name: 'Summer Breeze Kurti',
      category: 'Fashion',
      subcategory: 'Kurtis',
      price: 799,
      description: 'Lightweight breathable cotton kurti for summer.',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400',
      stock: 45,
      stockCount: 45,
      availability: true,
      currency: 'INR',
      margin: 45,
      tags: ['kurti', 'ethnic', 'summer', 'cotton'],
      aiSummary: 'High-margin summer essential',
      features: ['Breathable cotton'],
      aiBuyerTags: ['kurti', 'summer'],
      suitableFor: ['summer'],
      crossSellAffinity: [],
      priceElasticityScore: 0.8,
      purchaseEligibility: 'Instant checkout ready in Razorpay Test Mode.',
      jsonLdSchema: {},
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const updatedFashionCatalog = [...fashionProducts, newKurti];
    const result = shoppingSearchService.searchCatalog('kurti under 1000', updatedFashionCatalog, 'FashionHub');

    assert(
      result.matchedProducts.some(p => p.id === 'prod_summer_kurti'),
      'Test 4a: Newly added "Summer Breeze Kurti" is immediately searchable',
      `Results: ${result.matchedProducts.map(p => p.name).join(', ')}`
    );
    assert(
      result.matchedProducts.length === 2,
      'Test 4b: Both kurtis under ₹1,000 are returned'
    );
  }

  // TEST 5: Cross-Merchant Data Leakage Prevention
  {
    // Search for "kurti" in Tech Store -> Must return 0 products and CATEGORY_NOT_FOUND
    const techKurtiResult = shoppingSearchService.searchCatalog('kurti under 1000', techProducts, 'TechNest');
    assert(
      techKurtiResult.matchedProducts.length === 0,
      'Test 5a: Searching "kurti" in TechNest returns 0 results (no leakage from Fashion)',
      `Returned: ${techKurtiResult.matchedProducts.map(p => p.name).join(', ')}`
    );
    assert(
      techKurtiResult.status === 'CATEGORY_NOT_FOUND',
      'Test 5b: Status is CATEGORY_NOT_FOUND in TechNest'
    );

    // Search for "running shoes" in FashionHub -> Must return 0 products
    const fashionShoesResult = shoppingSearchService.searchCatalog('running shoes', fashionProducts, 'FashionHub');
    assert(
      fashionShoesResult.matchedProducts.length === 0,
      'Test 5c: Searching "running shoes" in FashionHub returns 0 results (no leakage from Sports)'
    );
  }

  // TEST 6: Strict Budget Ceiling Enforcement
  {
    // Search "dress under 500" in FashionHub (where dresses are ₹999+)
    const budgetResult = shoppingSearchService.searchCatalog('dress under 500', fashionProducts, 'FashionHub');
    assert(
      budgetResult.matchedProducts.length === 0,
      'Test 6a: "dress under 500" returns 0 products (Everyday Casual Dress is ₹999)'
    );
    assert(
      budgetResult.status === 'PRICE_EXCEEDED',
      'Test 6b: Status indicates PRICE_EXCEEDED with truthful alternative'
    );
  }

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');
  return { passed, failed };
}

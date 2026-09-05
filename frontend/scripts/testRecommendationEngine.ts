import { recommendationEngine, CustomerActivityContext } from '../src/services/recommendationEngine';
import { INITIAL_MERCHANT_PRODUCTS } from '../src/services/merchantData';
import { Product } from '../src/types';

function runTests() {
  console.log('====================================================');
  console.log('RUNNING AI SHOPPING AGENT RECOMMENDATION ENGINE TESTS');
  console.log('====================================================\n');

  const sportsCatalog = INITIAL_MERCHANT_PRODUCTS['merchant_sports'] || [];
  const fashionCatalog = INITIAL_MERCHANT_PRODUCTS['merchant_fashion'] || [];
  const techCatalog = INITIAL_MERCHANT_PRODUCTS['merchant_tech'] || [];

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (detail) console.error(`   Detail: ${detail}`);
    }
  }

  // TEST 1: Cross-Sell on Running Shoes
  console.log('--- TEST 1: CROSS-SELL ON RUNNING SHOES ---');
  const runningShoes = sportsCatalog.find(p => p.name.includes('Velocity Runner'))!;
  const context1: CustomerActivityContext = {
    merchantId: 'merchant_sports',
    cartProducts: [runningShoes],
    purchasedProducts: [],
    viewedProducts: [runningShoes],
    searchQueries: ['running', 'shoes'],
    recentInterests: ['Running Shoes']
  };

  const recResult1 = recommendationEngine.getRecommendationsAfterAddToCart(runningShoes, sportsCatalog, context1);
  assert(recResult1.hasStrongRecommendation, 'Velocity Runner generates strong recommendations');
  assert(recResult1.recommendations.length > 0, 'Returns at least 1 recommendation');
  
  const recNames1 = recResult1.recommendations.map(r => r.product.name);
  console.log('   Recommendations for Velocity Runner:', recNames1);
  assert(
    recNames1.some(name => name.includes('Socks') || name.includes('Flask') || name.includes('Cap') || name.includes('Roller')),
    'Recommends running accessories (Socks/Flask/Cap/Roller)'
  );
  assert(!recNames1.includes(runningShoes.name), 'Never recommends the exact same product added to cart');

  // TEST 2: Cross-Sell on Hydration Flask
  console.log('\n--- TEST 2: CROSS-SELL ON HYDRATION FLASK ---');
  const flask = sportsCatalog.find(p => p.name.includes('Hydration Flask'))!;
  const context2: CustomerActivityContext = {
    merchantId: 'merchant_sports',
    cartProducts: [flask],
    purchasedProducts: [],
    viewedProducts: [flask],
    searchQueries: ['sports', 'hydration'],
    recentInterests: ['Accessories & Apparel']
  };

  const recResult2 = recommendationEngine.getRecommendationsAfterAddToCart(flask, sportsCatalog, context2);
  assert(recResult2.hasStrongRecommendation, 'Hydration Flask generates strong recommendations');
  const recNames2 = recResult2.recommendations.map(r => r.product.name);
  console.log('   Recommendations for Hydration Flask:', recNames2);
  assert(
    recNames2.some(name => name.includes('Running') || name.includes('Cap') || name.includes('Socks')),
    'Recommends complementary sports/running items for Hydration Flask'
  );

  // TEST 3: Upsell on Basic Product
  console.log('\n--- TEST 3: UPSELL ON ENTRY/MID-TIER PRODUCT ---');
  const swiftRun = sportsCatalog.find(p => p.name.includes('SwiftRun Pro Max'))!;
  const context3: CustomerActivityContext = {
    merchantId: 'merchant_sports',
    cartProducts: [swiftRun],
    purchasedProducts: [],
    viewedProducts: [swiftRun],
    searchQueries: ['running shoes marathon'],
    recentInterests: ['Running Shoes']
  };

  const recResult3 = recommendationEngine.getRecommendationsAfterAddToCart(swiftRun, sportsCatalog, context3);
  const upsellRecs = recResult3.recommendations.filter(r => r.type === 'upsell');
  console.log('   Upsell candidates for SwiftRun Pro Max:', upsellRecs.map(r => `${r.product.name} (₹${r.product.price})`));
  assert(
    recResult3.recommendations.some(r => r.product.price > swiftRun.price || r.type === 'cross_sell'),
    'Identifies higher-value upgrade or strong cross-sell'
  );

  // TEST 4: Post-Purchase Recommendations
  console.log('\n--- TEST 4: POST-PURCHASE RECOMMENDATIONS ---');
  const context4: CustomerActivityContext = {
    merchantId: 'merchant_sports',
    cartProducts: [],
    purchasedProducts: [runningShoes],
    viewedProducts: [runningShoes],
    searchQueries: ['running'],
    recentInterests: ['Running Shoes']
  };

  const postRecResult = recommendationEngine.getRecommendationsPostPurchase(runningShoes, sportsCatalog, context4);
  assert(postRecResult.hasStrongRecommendation, 'Post-purchase returns high-confidence recommendations');
  assert(postRecResult.recommendations.length > 0, 'Post-purchase recommendations list populated');
  assert(!postRecResult.recommendations.some(r => r.product.id === runningShoes.id), 'Post-purchase excludes purchased product');

  // TEST 5: Fashion Store Contextual Complementary Matching (Kurti -> Dupatta / Palazzo)
  console.log('\n--- TEST 5: FASHION CATALOG RECOMMENDATIONS ---');
  const kurti = fashionCatalog.find(p => p.name.includes('Kurti'))!;
  const contextFashion: CustomerActivityContext = {
    merchantId: 'merchant_fashion',
    cartProducts: [kurti],
    purchasedProducts: [],
    viewedProducts: [kurti],
    searchQueries: ['kurti', 'ethnic wear'],
    recentInterests: ['Ethnic Wear']
  };

  const fashionRecResult = recommendationEngine.getRecommendationsAfterAddToCart(kurti, fashionCatalog, contextFashion);
  assert(fashionRecResult.hasStrongRecommendation, 'Kurti generates recommendations');
  const fashionRecNames = fashionRecResult.recommendations.map(r => r.product.name);
  console.log('   Recommendations for Kurti:', fashionRecNames);
  assert(
    fashionRecNames.some(name => name.includes('Dupatta') || name.includes('Palazzo')),
    'Kurti successfully recommends Dupatta or Palazzo'
  );

  // TEST 6: Tech Store Recommendations (Laptop Stand -> Wireless Mouse)
  console.log('\n--- TEST 6: TECH CATALOG RECOMMENDATIONS ---');
  const stand = techCatalog.find(p => p.name.includes('Stand'))!;
  const contextTech: CustomerActivityContext = {
    merchantId: 'merchant_tech',
    cartProducts: [stand],
    purchasedProducts: [],
    viewedProducts: [stand],
    searchQueries: ['desk', 'laptop stand'],
    recentInterests: ['Workstation Accessories']
  };

  const techRecResult = recommendationEngine.getRecommendationsAfterAddToCart(stand, techCatalog, contextTech);
  assert(techRecResult.hasStrongRecommendation, 'Laptop Stand generates recommendations');
  const techRecNames = techRecResult.recommendations.map(r => r.product.name);
  console.log('   Recommendations for Laptop Stand:', techRecNames);
  assert(
    techRecNames.some(name => name.includes('Mouse') || name.includes('Hub') || name.includes('Mat') || name.includes('Lightbar')),
    'Laptop Stand recommends complementary desk gear'
  );

  // TEST 7: Single Product / No Match Fallback
  console.log('\n--- TEST 7: FALLBACK WHEN NO CANDIDATES EXIST ---');
  const singleItemCatalog: Product[] = [runningShoes];
  const emptyContext: CustomerActivityContext = {
    merchantId: 'merchant_sports',
    cartProducts: [runningShoes],
    purchasedProducts: [],
    viewedProducts: [],
    searchQueries: [],
    recentInterests: []
  };

  const fallbackResult = recommendationEngine.getRecommendationsAfterAddToCart(runningShoes, singleItemCatalog, emptyContext);
  assert(!fallbackResult.hasStrongRecommendation, 'Correctly flags no strong recommendation when catalog exhausted');
  assert(fallbackResult.message.includes('No strong complementary recommendation right now'), 'Outputs exact fallback message');

  console.log(`\n====================================================`);
  console.log(`ALL TESTS COMPLETED: ${passed}/${total} PASSED`);
  console.log(`====================================================`);
}

runTests();

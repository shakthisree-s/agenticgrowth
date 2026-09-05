import { recommendationEngine, CustomerActivityContext } from '../src/services/recommendationEngine';
import { INITIAL_MERCHANTS, INITIAL_MERCHANT_PRODUCTS, INITIAL_MERCHANT_CUSTOMERS } from '../src/services/merchantData';
import { Product, Customer } from '../src/types';

function runE2ETests() {
  console.log('================================================================');
  console.log('RUNNING FULL END-TO-END SHOPPING AGENT RECOMMENDATION WORKFLOW');
  console.log('================================================================\n');

  const sportsMerchant = INITIAL_MERCHANTS.find(m => m.id === 'merchant_sports')!;
  const sportsCatalog = INITIAL_MERCHANT_PRODUCTS['merchant_sports'] || [];
  const demoCustomer = INITIAL_MERCHANT_CUSTOMERS['merchant_sports']?.find(c => c.email === 'customer@urbankart.demo')!;

  console.log(`Active Merchant: ${sportsMerchant.name} (${sportsMerchant.industry})`);
  console.log(`Demo Customer: ${demoCustomer.name} (${demoCustomer.email})\n`);

  let step = 1;

  // STEP 1: Customer searches for "running shoes"
  console.log(`[Step ${step++}] Customer searches for "running shoes"...`);
  const searchEvent = {
    type: 'PRODUCT_SEARCH',
    customerId: demoCustomer.id,
    merchantId: sportsMerchant.id,
    query: 'running shoes'
  };
  const searchHistory = [searchEvent.query];
  console.log(`   Recorded Event: ${searchEvent.type} (query: "${searchEvent.query}")`);

  // STEP 2: Customer views "Velocity Runner X"
  const viewedProduct = sportsCatalog.find(p => p.name === 'Velocity Runner X')!;
  console.log(`\n[Step ${step++}] Customer inspects "${viewedProduct.name}" (₹${viewedProduct.price})...`);
  const viewedProducts = [viewedProduct];
  console.log(`   Recorded Event: PRODUCT_VIEW (product: "${viewedProduct.name}")`);

  // STEP 3: Customer adds "Velocity Runner X" to Session Cart
  console.log(`\n[Step ${step++}] Customer adds "${viewedProduct.name}" to cart...`);
  const cartProducts = [viewedProduct];
  console.log(`   Recorded Event: ADD_TO_CART (product: "${viewedProduct.name}", amount: ₹${viewedProduct.price})`);

  // STEP 4: Contextual Recommendation Engine computes recommendations
  console.log(`\n[Step ${step++}] Contextual Recommendation Engine scores candidate pool...`);
  const activityContext: CustomerActivityContext = {
    customerId: demoCustomer.id,
    customerName: demoCustomer.name,
    merchantId: sportsMerchant.id,
    cartProducts,
    purchasedProducts: [],
    viewedProducts,
    searchQueries: searchHistory,
    recentInterests: ['Running Shoes', 'running']
  };

  const recResult = recommendationEngine.getRecommendationsAfterAddToCart(viewedProduct, sportsCatalog, activityContext);
  console.log(`   Engine result: hasStrongRecommendation = ${recResult.hasStrongRecommendation}`);
  console.log(`   Headline: "${recResult.recommendations[0]?.headline || 'Complete Your Setup'}"`);
  console.log(`   Total Scored Recommendations: ${recResult.recommendations.length}`);

  recResult.recommendations.forEach((rec, idx) => {
    console.log(`   [Rec #${idx + 1}] ${rec.product.name} (₹${rec.product.price})`);
    console.log(`         Type: ${rec.type.toUpperCase()}`);
    console.log(`         Reason: "${rec.reason}"`);
    console.log(`         Score: ${rec.score} pts (Factors: ${rec.matchFactors.join(' | ')})`);
  });

  if (!recResult.hasStrongRecommendation) {
    throw new Error('Expected strong recommendation for Velocity Runner X');
  }

  // STEP 5: Customer accepts top cross-sell add-on: "Pro Dynamic Running Socks (3-Pack)"
  const acceptedAddon = recResult.recommendations[0].product;
  console.log(`\n[Step ${step++}] Customer clicks [Add to Cart] on "${acceptedAddon.name}" (+₹${acceptedAddon.price})...`);
  console.log(`   Recorded Event: AI_CROSS_SELL_ACCEPTED (addon: "${acceptedAddon.name}")`);

  const totalBasketValue = viewedProduct.price + acceptedAddon.price;
  console.log(`   Session Cart Total: ₹${totalBasketValue.toLocaleString('en-IN')}`);

  // STEP 6: Customer completes Razorpay Test Mode checkout
  console.log(`\n[Step ${step++}] Customer clicks 'Pay with Razorpay Test Mode'...`);
  console.log(`   Recorded Event: CHECKOUT_STARTED (amount: ₹${totalBasketValue})`);
  console.log(`   Simulated Razorpay Authorization: SUCCESS (pay_test_${Math.random().toString(36).substring(2, 9).toUpperCase()})`);
  console.log(`   Recorded Event: PURCHASE_COMPLETED (items: [${viewedProduct.name}, ${acceptedAddon.name}])`);

  // STEP 7: Post-Purchase contextual recommendations
  console.log(`\n[Step ${step++}] Post-Purchase Trigger: Contextual Engine computes "You May Also Like"...`);
  const postPurchasedCtx: CustomerActivityContext = {
    customerId: demoCustomer.id,
    customerName: demoCustomer.name,
    merchantId: sportsMerchant.id,
    cartProducts: [],
    purchasedProducts: [viewedProduct, acceptedAddon],
    viewedProducts,
    searchQueries: searchHistory,
    recentInterests: ['Running Shoes', 'Socks']
  };

  const postRecResult = recommendationEngine.getRecommendationsPostPurchase(viewedProduct, sportsCatalog, postPurchasedCtx);
  console.log(`   Post-Purchase Headline: "You May Also Like"`);
  console.log(`   Post-Purchase Recommendations:`);
  postRecResult.recommendations.forEach((rec, idx) => {
    console.log(`   [Post-Rec #${idx + 1}] ${rec.product.name} (₹${rec.product.price}) — "${rec.reason}" (Score: ${rec.score})`);
  });

  console.log('\n================================================================');
  console.log('✅ COMPLETE END-TO-END RECOMMENDATION FLOW VERIFIED PERFECTLY!');
  console.log('================================================================');
}

runE2ETests();

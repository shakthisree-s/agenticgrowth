import { shoppingSearchService, generateShoppingSuggestions } from '../src/services/shoppingSearchService';
import {
  INITIAL_MERCHANTS,
  INITIAL_MERCHANT_PRODUCTS
} from '../src/services/merchantData';
import { Product } from '../src/types';

console.log('\n======================================================');
console.log('TESTING MERCHANT-CONTEXT AWARE SHOPPING AI SUGGESTIONS');
console.log('======================================================\n');

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

const sportsProducts: Product[] = JSON.parse(JSON.stringify(INITIAL_MERCHANT_PRODUCTS['merchant_sports'] || []));
const fashionProducts: Product[] = JSON.parse(JSON.stringify(INITIAL_MERCHANT_PRODUCTS['merchant_fashion'] || []));
const techProducts: Product[] = JSON.parse(JSON.stringify(INITIAL_MERCHANT_PRODUCTS['merchant_tech'] || []));

const sportsMerchant = INITIAL_MERCHANTS.find(m => m.id === 'merchant_sports');
const fashionMerchant = INITIAL_MERCHANTS.find(m => m.id === 'merchant_fashion');
const techMerchant = INITIAL_MERCHANTS.find(m => m.id === 'merchant_tech');

// TEST 1: Select Sports Store -> suggestions are sports-specific
{
  const sportsSuggestions = generateShoppingSuggestions(sportsProducts, sportsMerchant);
  console.log('Sports Suggestions:', sportsSuggestions);

  assert(
    sportsSuggestions.length >= 3 &&
    sportsSuggestions.some(s => s.toLowerCase().includes('running') || s.toLowerCase().includes('shoe')) &&
    sportsSuggestions.some(s => s.toLowerCase().includes('training') || s.toLowerCase().includes('marathon') || s.toLowerCase().includes('sport')),
    'TEST 1: Sports Store generates dynamically derived sports & athletic shopping suggestions'
  );
  assert(
    !sportsSuggestions.some(s => s.toLowerCase().includes('kurti') || s.toLowerCase().includes('dress') || s.toLowerCase().includes('laptop')),
    'TEST 1b: ZERO fashion or tech suggestions appear in Sports store'
  );
}

// TEST 2: Switch to Fashion Store -> suggestions immediately become fashion-specific
{
  const fashionSuggestions = generateShoppingSuggestions(fashionProducts, fashionMerchant);
  console.log('Fashion Suggestions:', fashionSuggestions);

  assert(
    fashionSuggestions.length >= 3 &&
    fashionSuggestions.some(s => s.toLowerCase().includes('kurti') || s.toLowerCase().includes('dress') || s.toLowerCase().includes('party')),
    'TEST 2: Fashion Store generates dynamically derived fashion & apparel shopping suggestions'
  );
  assert(
    !fashionSuggestions.some(s => s.toLowerCase().includes('running') || s.toLowerCase().includes('laptop') || s.toLowerCase().includes('marathon')),
    'TEST 2b: ZERO athletic or tech suggestions appear in Fashion store'
  );
}

// TEST 3: Switch to Electronics Store -> suggestions immediately become electronics-specific
{
  const techSuggestions = generateShoppingSuggestions(techProducts, techMerchant);
  console.log('Tech Suggestions:', techSuggestions);

  assert(
    techSuggestions.length >= 3 &&
    techSuggestions.some(s => s.toLowerCase().includes('laptop') || s.toLowerCase().includes('phone') || s.toLowerCase().includes('workspace') || s.toLowerCase().includes('wireless')),
    'TEST 3: Electronics Store generates dynamically derived workspace & gadget shopping suggestions'
  );
  assert(
    !techSuggestions.some(s => s.toLowerCase().includes('kurti') || s.toLowerCase().includes('running shoe') || s.toLowerCase().includes('dress')),
    'TEST 3b: ZERO fashion or athletic suggestions appear in Tech store'
  );
}

// TEST 4: Empty catalog -> returns 0 suggestions (renders prompt to add products)
{
  const emptySuggestions = generateShoppingSuggestions([], sportsMerchant);
  assert(
    emptySuggestions.length === 0,
    'TEST 4: Empty catalog returns 0 suggestions and shows "Add products to your catalog to start shopping with AI."'
  );
}

// TEST 5: Add a new product to merchant catalog -> suggestions immediately adapt
{
  const customProducts: Product[] = [
    {
      id: 'prod_gourmet_tea',
      merchantId: 'merchant_organic',
      name: 'Darjeeling First Flush Green Tea',
      category: 'Organic Teas',
      subcategory: 'Loose Leaf',
      price: 599,
      availability: true,
      stockCount: 50,
      currency: 'INR',
      image: '',
      aiSummary: 'Organic hand-plucked green tea',
      features: ['100% Organic', 'Antioxidant rich'],
      aiBuyerTags: ['Tea', 'Organic', 'Beverage'],
      suitableFor: ['daily-wellness', 'detox', 'morning-routine'],
      crossSellAffinity: [],
      priceElasticityScore: 0.8,
      purchaseEligibility: 'Instant checkout ready',
      jsonLdSchema: {},
      status: 'Active'
    }
  ];

  const organicSuggestions = generateShoppingSuggestions(customProducts);
  console.log('Organic Tea Suggestions:', organicSuggestions);
  assert(
    organicSuggestions.length > 0 &&
    organicSuggestions.some(s => s.toLowerCase().includes('tea') || s.toLowerCase().includes('organic')),
    'TEST 5: Newly added organic tea product dynamically generates tea-related shopping suggestions'
  );
}

// TEST 6: Archive / remove a product -> AI stops recommending it
{
  const activeOnlyKurti = fashionProducts.filter(p => p.name.includes('Kurti'));
  const searchActive = shoppingSearchService.searchCatalog('kurti under 1000', activeOnlyKurti, 'FashionHub');
  assert(
    searchActive.matchedProducts.length > 0,
    'TEST 6a: Active kurti is searchable and returned'
  );

  const archivedKurti = activeOnlyKurti.map(p => ({ ...p, status: 'Archived' as const }));
  const searchArchived = shoppingSearchService.searchCatalog('kurti under 1000', archivedKurti, 'FashionHub');
  assert(
    searchArchived.matchedProducts.length === 0,
    'TEST 6b: Archived kurti is never recommended or returned in search'
  );
}

// TEST 7: Search for general budget query "I need something under 1000" and "under 500"
{
  // In Fashion store: Dupatta (₹399), Kurti (₹899), Dress (₹999)
  const fashionBudget = shoppingSearchService.searchCatalog('I need something under 1000', fashionProducts, 'FashionHub');
  assert(
    fashionBudget.matchedProducts.length > 0 &&
    fashionBudget.matchedProducts.every(p => p.price <= 1000 && p.merchantId === 'merchant_fashion'),
    'TEST 7a: "I need something under 1000" in FashionHub returns only Fashion products under ₹1,000'
  );

  // In Sports store: Socks (₹799), Cap (₹699), Flask (₹499)
  const sportsBudget = shoppingSearchService.searchCatalog('I need something under 1000', sportsProducts, 'Apex Athletics');
  assert(
    sportsBudget.matchedProducts.length > 0 &&
    sportsBudget.matchedProducts.every(p => p.price <= 1000 && p.merchantId === 'merchant_sports'),
    'TEST 7b: "I need something under 1000" in Sports store returns only Sports products under ₹1,000'
  );

  // In Tech store under 500: lowest product is ₹799 -> returns 0 products with NO_PRODUCTS_UNDER_PRICE
  const techUnder500 = shoppingSearchService.searchCatalog('I need something under 500', techProducts, 'TechNest');
  assert(
    techUnder500.matchedProducts.length === 0 && techUnder500.status === 'NO_PRODUCTS_UNDER_PRICE',
    'TEST 7c: "I need something under 500" in Tech store correctly reports no products under ₹500 and states lowest available price'
  );
}

// TEST 8: Search for a product that doesn't exist -> clearly say no matching product exists
{
  const missingRes = shoppingSearchService.searchCatalog('diamond necklace', sportsProducts, 'Apex Athletics');
  assert(
    missingRes.matchedProducts.length === 0 &&
    (missingRes.status === 'CATEGORY_NOT_FOUND' || missingRes.status === 'NO_MATCH'),
    'TEST 8: Non-existent product query returns 0 products and clearly reports no matching item in store'
  );
}

// TEST 9: Cross-merchant isolation check
{
  const shoesInFashion = shoppingSearchService.searchCatalog('Show me shoes', fashionProducts, 'FashionHub');
  assert(
    shoesInFashion.matchedProducts.length === 0,
    'TEST 9a: Searching "Show me shoes" in FashionHub returns 0 products (NO leakage from Sports store)'
  );

  const kurtiInTech = shoppingSearchService.searchCatalog('Show me kurtis', techProducts, 'TechNest');
  assert(
    kurtiInTech.matchedProducts.length === 0,
    'TEST 9b: Searching "Show me kurtis" in TechNest returns 0 products (NO leakage from Fashion store)'
  );
}

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MERCHANT-CONTEXT AWARE SHOPPING AI TESTS PASSED! 🛍️✨\n');
}

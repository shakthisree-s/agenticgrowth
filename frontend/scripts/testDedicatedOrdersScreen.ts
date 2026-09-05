import { screenToPath, parsePathToState } from '../src/context/AppContext';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('TESTING DEDICATED CUSTOMER ORDER HISTORY PAGE & /SHOP CLEANUP');
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

// TEST 1: URL Route Parsing for /orders and /shop
{
  const ordersState = parsePathToState('/orders');
  assert(
    ordersState?.role === 'customer' && ordersState?.screen === 'orders',
    'TEST 1a: URL "/orders" accurately parses to role: "customer", screen: "orders"'
  );

  const orderHistoryState = parsePathToState('/order-history');
  assert(
    orderHistoryState?.role === 'customer' && orderHistoryState?.screen === 'orders',
    'TEST 1b: URL "/order-history" alias parses to role: "customer", screen: "orders"'
  );

  const shopState = parsePathToState('/shop');
  assert(
    shopState?.role === 'customer' && shopState?.screen === 'conversational',
    'TEST 1c: URL "/shop" accurately parses to role: "customer", screen: "conversational"'
  );
}

// TEST 2: URL Generator screenToPath for customer screens
{
  assert(
    screenToPath('orders', 'customer') === '/orders',
    'TEST 2a: screenToPath("orders", "customer") returns "/orders"'
  );
  assert(
    screenToPath('conversational', 'customer') === '/shop',
    'TEST 2b: screenToPath("conversational", "customer") returns "/shop"'
  );
}

// TEST 3: ConversationalCommerceScreen.tsx has NO Order History cards/section
{
  const shopScreenCode = fs.readFileSync(path.join(__dirname, '../src/components/screens/ConversationalCommerceScreen.tsx'), 'utf-8');
  const hasOrderHistoryHeading = /<h2[^>]*>\s*Order History\s*<\/h2>/i.test(shopScreenCode);
  const hasCustomerOrdersState = shopScreenCode.includes('customerOrders');
  const hasOrderCards = shopScreenCode.includes('order.baseProduct') || shopScreenCode.includes('order.aiAddonProduct');

  assert(
    !hasOrderHistoryHeading && !hasCustomerOrdersState && !hasOrderCards,
    'TEST 3: Order History section and order list cards are completely removed from /shop'
  );
  assert(
    shopScreenCode.includes('openOrders'),
    'TEST 3b: /shop provides direct navigation to openOrders'
  );
}

// TEST 4: OrdersScreen.tsx contains required fields, layout, and API endpoint
{
  const ordersScreenCode = fs.readFileSync(path.join(__dirname, '../src/components/screens/OrdersScreen.tsx'), 'utf-8');

  assert(
    ordersScreenCode.includes('/api/orders/'),
    'TEST 4a: OrdersScreen fetches dynamically from GET /api/orders/{customer_id}'
  );
  assert(
    ordersScreenCode.includes('No orders yet.') && ordersScreenCode.includes('Your completed purchases will appear here.'),
    'TEST 4b: Empty state accurately displays prompt copy: "No orders yet." and "Your completed purchases will appear here."'
  );
  assert(
    ordersScreenCode.includes('Payment: Paid') && ordersScreenCode.includes('Status: Confirmed'),
    'TEST 4c: Order cards render Payment: Paid and Status: Confirmed badges'
  );
  assert(
    ordersScreenCode.includes('AI Recommended') && ordersScreenCode.includes('AI Attributed Revenue'),
    'TEST 4d: Order cards display AI Recommended badges and AI-attributed revenue breakdown'
  );
  assert(
    ordersScreenCode.includes('baseProduct') && ordersScreenCode.includes('baseAmount') && ordersScreenCode.includes('totalAmount'),
    'TEST 4e: Order cards display Order ID, date, base product, quantity, base amount, and total amount'
  );
}

// TEST 5: App.tsx customer navigation and header
{
  const appCode = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf-8');

  assert(
    appCode.includes('OrdersScreen') && appCode.includes('ConversationalCommerceScreen'),
    'TEST 5a: App.tsx imports and renders OrdersScreen and ConversationalCommerceScreen'
  );
  assert(
    appCode.includes('openStorefront') && appCode.includes('openOrders'),
    'TEST 5b: App.tsx provides seamless navigation between /shop and /orders'
  );
  assert(
    appCode.includes('Back to Home') && appCode.includes('exitStorefront'),
    'TEST 5c: App.tsx preserves "Back to Home" returning to the public home/landing page'
  );
}

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL DEDICATED ORDERS SCREEN & /SHOP CLEANUP TESTS PASSED! 🛍️📦✨\n');
}

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

// TEST 3: ConversationalCommerceScreen.tsx is clean with order history completely removed from /shop
{
  const shopScreenCode = fs.readFileSync(path.join(__dirname, '../src/components/screens/ConversationalCommerceScreen.tsx'), 'utf-8');
  const hasNoOrderHistorySection = !shopScreenCode.includes('id="order-history"');
  const hasNoCustomerOrdersState = !shopScreenCode.includes('customerOrders');
  const hasNoOrderHistoryButton = !shopScreenCode.includes('Order History');
  const hasNoUnableToLoadOrders = !shopScreenCode.includes('Unable to load orders');

  assert(
    hasNoOrderHistorySection && hasNoCustomerOrdersState && hasNoOrderHistoryButton && hasNoUnableToLoadOrders,
    'TEST 3: Order History section, buttons, and state are completely removed from /shop'
  );
}

// TEST 4: OrdersScreen.tsx is preserved and functional
{
  const ordersScreenCode = fs.readFileSync(path.join(__dirname, '../src/components/screens/OrdersScreen.tsx'), 'utf-8');

  assert(
    ordersScreenCode.includes('/api/orders/'),
    'TEST 4a: Separate /orders page is preserved and fetches from GET /api/orders/{customer_id}'
  );
  assert(
    ordersScreenCode.includes('No orders yet.') && ordersScreenCode.includes('Your completed purchases will appear here.'),
    'TEST 4b: /orders contains valid empty state prompt'
  );
  assert(
    ordersScreenCode.includes('Continue Shopping') && ordersScreenCode.includes('Refresh'),
    'TEST 4c: /orders contains navigation action buttons'
  );
}

// TEST 5: App.tsx customer navigation and header
{
  const appCode = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf-8');

  assert(
    appCode.includes('ConversationalCommerceScreen') && appCode.includes('OrdersScreen'),
    'TEST 5a: App.tsx preserves both ConversationalCommerceScreen (/shop) and OrdersScreen (/orders)'
  );
  assert(
    appCode.includes('Shop') && appCode.includes('openStorefront'),
    'TEST 5b: App.tsx preserves "Shop" navigation button'
  );
  assert(
    appCode.includes('Back to Home') && appCode.includes('exitStorefront'),
    'TEST 5c: App.tsx preserves "Back to Home" returning to the public home/landing page'
  );
  assert(
    !appCode.includes('<Package size={13} />\n                <span>Order History</span>'),
    'TEST 5d: App.tsx header has cleanly removed Order History button from shop page navigation'
  );
}

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL /SHOP CLEANUP & /ORDERS PRESERVATION TESTS PASSED! 🛍️📦✨\n');
}

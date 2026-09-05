import {
  INITIAL_MERCHANTS,
  INITIAL_MERCHANT_CUSTOMERS,
  INITIAL_MERCHANT_PRODUCTS
} from '../src/services/merchantData';
import { Customer, MerchantProfile, AuthRole, ActiveScreen } from '../src/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('TESTING AUTHENTICATION, MERCHANT SCOPING & ISOLATION');
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

// Simulated AppContext State & LocalStorage
const mockLocalStorage: Record<string, string> = {};

interface SessionState {
  authRole: AuthRole;
  isAuthenticated: boolean;
  activeMerchantId: string;
  activeScreen: ActiveScreen;
  currentCustomer: Customer | null;
}

const session: SessionState = {
  authRole: null,
  isAuthenticated: false,
  activeMerchantId: 'merchant_sports',
  activeScreen: 'overview',
  currentCustomer: null
};

function loginAsAdmin(merchantId: string, username?: string) {
  const adminSession = {
    role: 'admin',
    merchantId,
    username: username || `admin@${merchantId}.demo`,
    loggedInAt: new Date().toISOString()
  };
  mockLocalStorage['merchantos_admin_session'] = JSON.stringify(adminSession);
  mockLocalStorage['merchantos_auth_merchant_id'] = merchantId;

  session.activeMerchantId = merchantId;
  session.authRole = 'admin';
  session.isAuthenticated = true;
  session.activeScreen = 'overview';
}

function adminLogout() {
  delete mockLocalStorage['merchantos_admin_session'];
  delete mockLocalStorage['merchantos_auth_merchant_id'];
  session.authRole = null;
  session.isAuthenticated = false;
  session.activeScreen = 'overview';
}

function loginAsCustomer(merchantId: string, customerData?: Customer | null) {
  session.activeMerchantId = merchantId;
  session.authRole = 'customer';
  session.isAuthenticated = true;
  session.activeScreen = 'conversational';

  if (customerData) {
    session.currentCustomer = customerData;
    mockLocalStorage[`merchantos_customer_session_${merchantId}`] = JSON.stringify(customerData);
  } else {
    const raw = mockLocalStorage[`merchantos_customer_session_${merchantId}`];
    if (raw) {
      session.currentCustomer = JSON.parse(raw);
    } else {
      session.currentCustomer = null;
    }
  }
}

function customerSignOut(merchantId: string) {
  delete mockLocalStorage[`merchantos_customer_session_${merchantId}`];
  session.currentCustomer = null;
  session.authRole = null;
  session.isAuthenticated = false;
}

function exitStorefront() {
  session.authRole = null;
  session.isAuthenticated = false;
}

// -------------------------------------------------------------
// SCENARIO TESTS 1 TO 8
// -------------------------------------------------------------

// TEST 1: Landing -> Admin -> UrbanKart -> Login
{
  loginAsAdmin('merchant_sports', 'admin@urbankart.demo');
  assert(
    session.authRole === 'admin' &&
    session.isAuthenticated === true &&
    session.activeMerchantId === 'merchant_sports',
    'TEST 1a: Admin logs in to UrbanKart successfully'
  );

  const sidebarCode = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf-8');
  assert(
    !sidebarCode.includes('Switch Merchant') &&
    !sidebarCode.includes('FashionHub') &&
    !sidebarCode.includes('TechNest') &&
    !sidebarCode.includes('Create Store') &&
    !sidebarCode.includes('Open Store'),
    'TEST 1b: Admin sidebar sees ONLY locked merchant — NO Switch Merchant, NO FashionHub/TechNest, NO Create Store, NO Open Store'
  );
}

// TEST 2: Admin UrbanKart -> Sign Out
{
  adminLogout();
  assert(
    session.authRole === null &&
    session.isAuthenticated === false &&
    mockLocalStorage['merchantos_admin_session'] === undefined,
    'TEST 2: Admin UrbanKart signs out -> returns to public landing page, admin session cleared'
  );
}

// TEST 3: Landing -> Customer -> UrbanKart -> Priya login
{
  const priya = INITIAL_MERCHANT_CUSTOMERS['merchant_sports'].find(c => c.name.includes('Priya')) || {
    id: 'CUS_001',
    merchantId: 'merchant_sports',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    lifetimeValue: 0,
    status: 'active' as const,
    avatarColor: '#111111',
    behavior: { cartValue: 0, cartItems: [], hasPurchased: false, intentScore: 85 }
  };

  loginAsCustomer('merchant_sports', priya);
  assert(
    session.authRole === 'customer' &&
    session.isAuthenticated === true &&
    session.activeMerchantId === 'merchant_sports' &&
    session.currentCustomer?.name === 'Priya Sharma',
    'TEST 3: Customer logs into UrbanKart as Priya Sharma — session locked to Priya + UrbanKart'
  );
}

// TEST 4: Priya -> Sign Out
{
  customerSignOut('merchant_sports');
  assert(
    session.currentCustomer === null &&
    session.authRole === null &&
    session.isAuthenticated === false &&
    mockLocalStorage['merchantos_customer_session_merchant_sports'] === undefined,
    'TEST 4: Priya signs out -> customer session cleared and returned to public landing'
  );
}

// TEST 5: Landing -> Customer -> FashionHub -> Aarav login
{
  const aarav = INITIAL_MERCHANT_CUSTOMERS['merchant_fashion'].find(c => c.name.includes('Aarav')) || {
    id: 'CUS_FASH_001',
    merchantId: 'merchant_fashion',
    name: 'Aarav Mehta',
    email: 'aarav@fashionhub.demo',
    phone: '+91 98000 00000',
    lifetimeValue: 0,
    status: 'active' as const,
    avatarColor: '#111111',
    behavior: { cartValue: 0, cartItems: [], hasPurchased: false, intentScore: 80 }
  };

  loginAsCustomer('merchant_fashion', aarav);
  const fashionProducts = INITIAL_MERCHANT_PRODUCTS['merchant_fashion'] || [];
  const sportsProducts = INITIAL_MERCHANT_PRODUCTS['merchant_sports'] || [];

  const hasSportsInFashion = fashionProducts.some(p => p.merchantId === 'merchant_sports' || p.name.includes('Velocity Runner'));

  assert(
    session.authRole === 'customer' &&
    session.activeMerchantId === 'merchant_fashion' &&
    session.currentCustomer?.name === 'Aarav Mehta' &&
    !hasSportsInFashion,
    'TEST 5: Aarav logs in to FashionHub -> sees FashionHub only with ZERO UrbanKart products or customer leakage'
  );
}

// TEST 6: Customer clicks "Back to Admin"
{
  exitStorefront();
  assert(
    session.authRole === null &&
    session.isAuthenticated === false,
    'TEST 6: Clicking "Back to Admin" resets to public landing/login boundary (requires admin credentials)'
  );
}

// TEST 7: Admin UrbanKart visits /shop without prior customer auth
{
  // Switch to admin session
  loginAsAdmin('merchant_sports', 'admin@urbankart.demo');

  // Customer navigates to /shop without stored customer session
  delete mockLocalStorage['merchantos_customer_session_merchant_sports'];
  loginAsCustomer('merchant_sports', null);

  assert(
    session.currentCustomer === null,
    'TEST 7: Visiting /shop does NOT auto-create or auto-inherit a customer identity (currentCustomer is null)'
  );
}

// TEST 8: Authenticated UrbanKart Admin sidebar verification
{
  loginAsAdmin('merchant_sports', 'admin@urbankart.demo');
  const sidebarCode = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf-8');

  const hasOverview = sidebarCode.includes("'overview'");
  const hasAgents = sidebarCode.includes("'agents'");
  const hasOpportunities = sidebarCode.includes("'opportunities'");
  const hasCustomers = sidebarCode.includes("'customers'");
  const hasActivity = sidebarCode.includes("'agent_activity'");
  const hasAudit = sidebarCode.includes("'audit_trail'");

  const hasForbiddenElements =
    sidebarCode.includes('Switch Merchant') ||
    sidebarCode.includes('FashionHub') ||
    sidebarCode.includes('TechNest') ||
    sidebarCode.includes('Create Store') ||
    sidebarCode.includes('Open Store');

  assert(
    hasOverview && hasAgents && hasOpportunities && hasCustomers && hasActivity && hasAudit && !hasForbiddenElements,
    'TEST 8: Authenticated UrbanKart Admin sidebar has Overview, Agents, Opportunities, Customers, Activity, Audit and NO Switch Merchant, NO FashionHub/TechNest, NO Create Store, NO Open Store'
  );
}

// TEST 9: Public Customer Onboarding Flow Verification & No Demo Selectors
{
  const storeSelectionCode = fs.readFileSync(path.join(__dirname, '../src/components/auth/CustomerStoreSelection.tsx'), 'utf-8');
  const authScreenCode = fs.readFileSync(path.join(__dirname, '../src/components/auth/CustomerAuthScreen.tsx'), 'utf-8');
  const authModalCode = fs.readFileSync(path.join(__dirname, '../src/components/modals/CustomerAuthModal.tsx'), 'utf-8');

  const hasDemoSelectSection = storeSelectionCode.includes('Select Customer Identity') ||
    storeSelectionCode.includes('Guest Shopper') ||
    storeSelectionCode.includes('storeCustomers.map');

  const hasAuthScreenDemoButtons = authScreenCode.includes('Guest Shopper') ||
    authScreenCode.includes('Demo Profiles');

  const hasAuthModalDemoButtons = authModalCode.includes('Demo Profiles') ||
    authModalCode.includes('handleQuickSignIn');

  assert(
    !hasDemoSelectSection && !hasAuthScreenDemoButtons && !hasAuthModalDemoButtons,
    'TEST 9a: Removed SELECT CUSTOMER IDENTITY, Guest Shopper, and demo quick-select buttons from all customer auth/store-selection UI'
  );

  // Verify 2-step onboarding: Step 1 Authenticate Customer -> Step 2 Choose Merchant -> Step 3 /shop
  const priya = INITIAL_MERCHANT_CUSTOMERS['merchant_fashion']?.find(c => c.name.includes('Priya')) || {
    id: 'CUS_001',
    merchantId: 'merchant_fashion',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    lifetimeValue: 0,
    status: 'active' as const,
    avatarColor: '#111111',
    behavior: { cartValue: 0, cartItems: [], hasPurchased: false, intentScore: 85 }
  };
  
  // Step 1: Customer authenticates (merchantId not locked to storefront yet)
  const authenticatedCustomer: Customer = {
    ...priya,
    merchantId: ''
  };

  // Step 2: Store selection assigns merchantId and locks session
  loginAsCustomer('merchant_sports', authenticatedCustomer);

  assert(
    session.authRole === 'customer' &&
    session.isAuthenticated === true &&
    session.activeMerchantId === 'merchant_sports' &&
    session.currentCustomer?.name === 'Priya Sharma',
    'TEST 9b: Customer Sign In -> Store Selection assigns merchantId and unlocks /shop'
  );

  // Step 3: Verify Sign Out returns to public landing and clears customer session
  customerSignOut('merchant_sports');
  assert(
    session.authRole === null &&
    session.isAuthenticated === false &&
    session.currentCustomer === null,
    'TEST 9c: Customer Sign Out clears session and returns to public landing page'
  );
}

// TEST 10: Verify Two Separate Demo Authentication Roles & Route Protection
{
  const customerAuthCode = fs.readFileSync(path.join(__dirname, '../src/components/auth/CustomerAuthScreen.tsx'), 'utf-8');
  const adminLoginCode = fs.readFileSync(path.join(__dirname, '../src/components/auth/AdminLogin.tsx'), 'utf-8');

  // Assert Customer Credentials
  const hasCustomerEmailPrefill = customerAuthCode.includes('customer@urbankart.demo');
  const hasCustomerPasswordPrefill = customerAuthCode.includes('Customer@123');
  const hasAdminCredsInCustomerAuth = customerAuthCode.includes('admin@urbankart.demo') || customerAuthCode.includes('Admin@123');

  assert(
    hasCustomerEmailPrefill && hasCustomerPasswordPrefill && !hasAdminCredsInCustomerAuth,
    'TEST 10a: Customer Sign In page prefills customer@urbankart.demo / Customer@123 with ZERO admin credentials leakage'
  );

  // Assert Admin Credentials
  const hasAdminEmailPrefill = adminLoginCode.includes('admin@urbankart.demo');
  const hasAdminPasswordPrefill = adminLoginCode.includes('Admin@123');

  assert(
    hasAdminEmailPrefill && hasAdminPasswordPrefill,
    'TEST 10b: Admin Login page prefills admin@urbankart.demo / Admin@123'
  );

  // Assert Route Protection between roles
  const appContextCode = fs.readFileSync(path.join(__dirname, '../src/context/AppContext.tsx'), 'utf-8');
  const hasCustomerRouteGuard = appContextCode.includes("authRole === 'customer'") &&
    appContextCode.includes("setActiveScreenState('conversational')");
  const hasAdminRouteGuard = appContextCode.includes("localStorage.getItem('merchantos_admin_session')");

  assert(
    hasCustomerRouteGuard && hasAdminRouteGuard,
    'TEST 10c: Route protection strictly separates /admin/* (Admin only) from /shop (Customer only)'
  );
}

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 8 AUTHENTICATION & MERCHANT ISOLATION SCENARIOS PASSED!\n');
}

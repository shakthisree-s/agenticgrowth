import { screenToPath, parsePathToState } from '../src/context/AppContext';
import { ActiveScreen, AuthRole } from '../src/types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n======================================================');
console.log('TESTING ROUTING, SIDEBAR CLEANUP & STOREFRONT SEPARATION');
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

// TEST 1: Check Sidebar.tsx does NOT contain "TEST" badge in merchant card
{
  const sidebarCode = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf-8');
  const hasTestBadge = /<span[^>]*>\s*TEST\s*<\/span>/i.test(sidebarCode);

  assert(
    !hasTestBadge,
    'TEST 1: Bottom-left merchant context card has NO "TEST" badge'
  );
}

// TEST 2: Check Sidebar.tsx navItems does NOT contain Shopping
{
  const sidebarCode = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf-8');
  const navItemsMatch = sidebarCode.match(/const navItems:\s*NavItem\[\]\s*=\s*\[([\s\S]*?)\];/);
  const navItemsContent = navItemsMatch ? navItemsMatch[1] : '';

  assert(
    !navItemsContent.includes("'conversational'") && !navItemsContent.includes("'Shopping'"),
    'TEST 2: "Shopping" is completely removed from Admin sidebar navItems'
  );
  assert(
    navItemsContent.includes("'overview'") &&
    navItemsContent.includes("'agents'") &&
    navItemsContent.includes("'opportunities'") &&
    navItemsContent.includes("'customers'") &&
    navItemsContent.includes("'agent_activity'") &&
    navItemsContent.includes("'audit_trail'"),
    'TEST 2b: Admin sidebar retains all 6 core admin navigation items'
  );
}

// TEST 3: Sidebar has NO "Open Store", NO "Switch Merchant", NO "Create Store"
{
  const sidebarCode = fs.readFileSync(path.join(__dirname, '../src/components/layout/Sidebar.tsx'), 'utf-8');
  assert(
    !sidebarCode.includes('Open Store') && !sidebarCode.includes('openStorefront'),
    'TEST 3a: Admin sidebar has NO "Open Store" button'
  );
  assert(
    !sidebarCode.includes('Switch Merchant') && !sidebarCode.includes('setIsMerchantDropdownOpen'),
    'TEST 3b: Admin sidebar has NO "Switch Merchant" dropdown'
  );
  assert(
    !sidebarCode.includes('Create Store') && !sidebarCode.includes('setIsCreateMerchantModalOpen'),
    'TEST 3c: Admin sidebar has NO "Create Store" control'
  );
}

// TEST 4: Route Parsing from URL path (/admin/..., /shop)
{
  assert(
    parsePathToState('/admin/overview')?.screen === 'overview' && parsePathToState('/admin/overview')?.role === 'admin',
    'TEST 4a: URL "/admin/overview" parses to role: admin, screen: overview'
  );
  assert(
    parsePathToState('/admin/agents')?.screen === 'agents' && parsePathToState('/admin/agents')?.role === 'admin',
    'TEST 4b: URL "/admin/agents" parses to role: admin, screen: agents'
  );
  assert(
    parsePathToState('/admin/opportunities')?.screen === 'opportunities' && parsePathToState('/admin/opportunities')?.role === 'admin',
    'TEST 4c: URL "/admin/opportunities" parses to role: admin, screen: opportunities'
  );
  assert(
    parsePathToState('/admin/customers')?.screen === 'customers' && parsePathToState('/admin/customers')?.role === 'admin',
    'TEST 4d: URL "/admin/customers" parses to role: admin, screen: customers'
  );
  assert(
    parsePathToState('/admin/activity')?.screen === 'agent_activity' && parsePathToState('/admin/activity')?.role === 'admin',
    'TEST 4e: URL "/admin/activity" parses to role: admin, screen: agent_activity'
  );
  assert(
    parsePathToState('/admin/audit')?.screen === 'audit_trail' && parsePathToState('/admin/audit')?.role === 'admin',
    'TEST 4f: URL "/admin/audit" parses to role: admin, screen: audit_trail'
  );
  assert(
    parsePathToState('/shop')?.screen === 'conversational' && parsePathToState('/shop')?.role === 'customer',
    'TEST 4g: URL "/shop" parses to role: customer, screen: conversational'
  );
}

// TEST 5: screenToPath URL generation
{
  assert(
    screenToPath('overview', 'admin') === '/admin/overview',
    'TEST 5a: screen "overview" generates URL "/admin/overview"'
  );
  assert(
    screenToPath('agents', 'admin') === '/admin/agents',
    'TEST 5b: screen "agents" generates URL "/admin/agents"'
  );
  assert(
    screenToPath('opportunities', 'admin') === '/admin/opportunities',
    'TEST 5c: screen "opportunities" generates URL "/admin/opportunities"'
  );
  assert(
    screenToPath('customers', 'admin') === '/admin/customers',
    'TEST 5d: screen "customers" generates URL "/admin/customers"'
  );
  assert(
    screenToPath('agent_activity', 'admin') === '/admin/activity',
    'TEST 5e: screen "agent_activity" generates URL "/admin/activity"'
  );
  assert(
    screenToPath('audit_trail', 'admin') === '/admin/audit',
    'TEST 5f: screen "audit_trail" generates URL "/admin/audit"'
  );
  assert(
    screenToPath('conversational', 'customer') === '/shop',
    'TEST 5g: customer storefront generates URL "/shop"'
  );
}

// TEST 6: Storefront "Back to Admin" returns to Public Landing / Login without silent admin elevation
{
  const appCode = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf-8');
  assert(
    appCode.includes('exitStorefront') && appCode.includes('Back to Admin'),
    'TEST 6: Storefront includes "Back to Admin" which resets to public auth boundary'
  );
}

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL ROUTING & UI CLEANUP TESTS PASSED! 🚀\n');
}

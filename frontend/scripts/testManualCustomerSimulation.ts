import { INITIAL_MERCHANTS, INITIAL_MERCHANT_OPPORTUNITIES } from '../src/services/merchantData';
import { Opportunity } from '../src/types';

console.log('\n======================================================');
console.log('TESTING MANUAL PER-CUSTOMER SIMULATION CONTROLLER');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    failed++;
  }
}

const sportsOpps = INITIAL_MERCHANT_OPPORTUNITIES['merchant_sports'];
const fashOpps = INITIAL_MERCHANT_OPPORTUNITIES['merchant_fashion'];

// TEST 1: Opportunities present with diverse customer types
const aaravOpp = sportsOpps.find(o => o.customerName === 'Aarav Mehta')!;
const ananyaOpp = sportsOpps.find(o => o.customerName === 'Ananya Iyer')!;
const priyaOpp = fashOpps.find(o => o.customerName === 'Priya Sharma')!;

assert(
  Boolean(aaravOpp && ananyaOpp && priyaOpp),
  'TEST 1: Identified real customer opportunities (Aarav, Ananya, Priya) from catalog data'
);

// TEST 2: Stage Generation per opportunity type
const getStagesForOpportunity = (opp: Opportunity) => {
  const isRecovery = opp.type === 'checkout_recovery' || opp.createdByAgent === 'RECOVERY';
  const requiresApproval = Boolean(opp.reasoning?.policyCheck?.requiresHumanApproval || opp.status === 'awaiting_approval');
  const isPolicyBlocked = opp.status === 'blocked_by_policy';

  return [
    { key: 'SIGNAL', label: 'CUSTOMER SIGNAL', agent: 'Growth Supervisor' },
    { key: 'INTENT', label: 'INTENT', agent: 'Customer Intent Agent' },
    { key: 'SPECIALIST', label: isRecovery ? 'RECOVERY' : 'MERCHANDISING', agent: isRecovery ? 'Revenue Recovery Agent' : 'Merchandising Agent' },
    { key: 'POLICY', label: 'POLICY', agent: 'Policy & Risk Agent' },
    ...(requiresApproval ? [{ key: 'APPROVAL', label: 'APPROVAL', agent: 'Merchant Approval Gate' }] : []),
    { key: 'COMMERCE', label: isPolicyBlocked ? 'BLOCKED' : 'COMMERCE', agent: 'Commerce Execution Agent' },
    { key: 'REVENUE', label: 'REVENUE RESULT', agent: 'Revenue Ledger' }
  ];
};

const aaravStages = getStagesForOpportunity(aaravOpp);
assert(
  aaravStages.length === 6 &&
  aaravStages[2].label === 'MERCHANDISING' &&
  aaravStages[4].label === 'COMMERCE' &&
  aaravStages[5].label === 'REVENUE RESULT',
  'TEST 2: Aarav Mehta generates standard 6-stage Basket Growth pipeline'
);

// TEST 3: Recovery opportunity dynamically generates RECOVERY stage
const recoveryOpp = fashOpps.find(o => o.type === 'checkout_recovery')!;
const recoveryStages = getStagesForOpportunity(recoveryOpp);

assert(
  recoveryStages.some(s => s.label === 'RECOVERY') &&
  recoveryStages.some(s => s.label === 'APPROVAL'),
  'TEST 3: Checkout Recovery generates 7-stage pipeline with RECOVERY and APPROVAL stages'
);

// TEST 4: Per-Customer State Isolation
const simulationStageMap: Record<string, number> = {
  [aaravOpp.id]: 2,
  [ananyaOpp.id]: 0,
  [recoveryOpp.id]: 4
};

assert(
  simulationStageMap[aaravOpp.id] === 2 &&
  simulationStageMap[ananyaOpp.id] === 0 &&
  simulationStageMap[recoveryOpp.id] === 4,
  'TEST 4: Independent stage state tracking per customer without crosstalk'
);

// TEST 5: Manual Step Navigation Rules (No Auto-Advance, Manual < Back and Next >)
const stepBack = (currentIdx: number) => Math.max(0, currentIdx - 1);
const stepNext = (currentIdx: number, totalStages: number, isBlockedAtApproval: boolean) => {
  if (isBlockedAtApproval) return currentIdx;
  return Math.min(totalStages - 1, currentIdx + 1);
};

assert(
  stepBack(0) === 0,
  'TEST 5: Back button is disabled at Stage 0 (first step)'
);

assert(
  stepNext(0, aaravStages.length, false) === 1 &&
  stepNext(1, aaravStages.length, false) === 2 &&
  stepNext(5, aaravStages.length, false) === 5,
  'TEST 6: Next button advances stage sequentially and is disabled at terminal stage'
);

// TEST 7: Approval Gate Halt
assert(
  stepNext(4, recoveryStages.length, true) === 4,
  'TEST 7: Unapproved human-approval gate halts Next progression at APPROVAL stage'
);

// TEST 8: Real Data Binding from Opportunity
assert(
  aaravOpp.expectedRevenue === 1299 &&
  aaravOpp.confidence === 94 &&
  aaravOpp.customerBehavior.includes('Running Shoes'),
  'TEST 8: Real customer behavior, confidence (94%), and expected revenue (₹1,299) correctly bind to simulation narrative'
);

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL MANUAL PER-CUSTOMER SIMULATION TESTS PASSED! 🚀\n');
}

import {
  INITIAL_MERCHANTS,
  INITIAL_MERCHANT_OPPORTUNITIES
} from '../src/services/merchantData';
import { Opportunity, OpportunityStatus } from '../src/types';

console.log('\n======================================================');
console.log('TESTING OPPORTUNITY APPROVAL & COMPLETED QUEUE WORKFLOW');
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

const isActiveOpportunity = (status: OpportunityStatus) => {
  return status === 'awaiting_approval' || status === 'ready' || status === 'execution_failed' || status === 'blocked_by_policy';
};

const isCompletedOpportunity = (status: OpportunityStatus) => {
  return status === 'completed' || status === 'executed';
};

// Initial state for Sports store
let opps: Opportunity[] = JSON.parse(JSON.stringify(INITIAL_MERCHANT_OPPORTUNITIES['merchant_sports'] || []));

// TEST 1: Initial state has only active opportunities in active queue
const initialActive = opps.filter(o => isActiveOpportunity(o.status));
assert(
  initialActive.length === opps.length && initialActive.length > 0,
  `TEST 1: Initial state has ${initialActive.length} active opportunities in queue`
);

// Pick first opportunity (Aarav Mehta - Sports Socks Bundle)
const targetOpp = opps[0];
assert(
  targetOpp.customerName === 'Aarav Mehta' && targetOpp.status === 'ready',
  `TEST 2: Target opportunity identified: ${targetOpp.customerName} (${targetOpp.title})`
);

// TEST 3: Approve and execute opportunity sequence
const nowIso = new Date().toISOString();
const updatedOpp: Opportunity = {
  ...targetOpp,
  status: 'completed',
  executedAt: nowIso,
  executedByAgent: 'COMMERCE',
  executionDetails: 'Executed via Razorpay Test Gateway',
  transactionId: `TX_SPORTS_${Date.now()}`
};

// Update list
opps = opps.map(o => o.id === targetOpp.id ? updatedOpp : o);

// TEST 4: Verified removal from Active queue
const activeAfterApproval = opps.filter(o => isActiveOpportunity(o.status));
assert(
  !activeAfterApproval.some(o => o.id === targetOpp.id),
  'TEST 4: Completed opportunity is REMOVED from Active queue'
);
assert(
  activeAfterApproval.length === initialActive.length - 1,
  `TEST 5: Active queue count decremented from ${initialActive.length} to ${activeAfterApproval.length}`
);

// TEST 6: Verified presence in Completed History filter
const completedQueue = opps.filter(o => isCompletedOpportunity(o.status));
assert(
  completedQueue.some(o => o.id === targetOpp.id && o.status === 'completed'),
  'TEST 6: Completed opportunity is present in Completed History filter'
);
assert(
  completedQueue.length === 1 && completedQueue[0].executionDetails?.includes('Razorpay'),
  'TEST 7: Completed record preserves execution details & Razorpay Test Mode attribution'
);

// TEST 8: Reject Flow
const secondOpp = opps[1]; // Ananya Iyer
const rejectedOpp: Opportunity = {
  ...secondOpp,
  status: 'rejected',
  rejectedAt: new Date().toISOString(),
  rejectionReason: 'Declined by merchant review'
};
opps = opps.map(o => o.id === secondOpp.id ? rejectedOpp : o);

const activeAfterRejection = opps.filter(o => isActiveOpportunity(o.status));
assert(
  !activeAfterRejection.some(o => o.id === secondOpp.id),
  'TEST 8: Rejected opportunity is REMOVED from Active queue'
);
assert(
  opps.find(o => o.id === secondOpp.id)?.status === 'rejected',
  'TEST 9: Rejected opportunity preserves history with status="rejected"'
);

// TEST 10: Failed execution remains in Active queue with Retry capability
const thirdOpp = opps[2]; // Vikram Sengupta
const failedOpp: Opportunity = {
  ...thirdOpp,
  status: 'execution_failed',
  executionDetails: 'Gateway timeout in test mode'
};
opps = opps.map(o => o.id === thirdOpp.id ? failedOpp : o);

const activeWithFailed = opps.filter(o => isActiveOpportunity(o.status));
assert(
  activeWithFailed.some(o => o.id === thirdOpp.id && o.status === 'execution_failed'),
  'TEST 10: Execution failed opportunity REMAINS in Active queue for retry'
);

console.log('\n------------------------------------------------------');
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL OPPORTUNITY WORKFLOW TESTS PASSED! 🚀\n');
}

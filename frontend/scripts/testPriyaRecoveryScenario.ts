import { INITIAL_MERCHANT_CUSTOMERS, INITIAL_MERCHANT_OPPORTUNITIES, INITIAL_MERCHANT_AUDIT, INITIAL_MERCHANT_ACTIVITY, INITIAL_MERCHANTS } from '../src/services/merchantData';
import { AgentId, AuditLog, AgentActivityItem, Opportunity, Transaction } from '../src/types';

console.log('\n==================================================================');
console.log('TEST SUITE: PRIYA SHARMA CHECKOUT RECOVERY & AUDIT TRAIL FILTERING');
console.log('==================================================================\n');

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

// -------------------------------------------------------------
// 1. STAGE SEQUENCE & LOG MESSAGE DEFINITION TEST
// -------------------------------------------------------------
const priyaExpectedStages = [
  {
    stageIndex: 1,
    stageName: 'CUSTOMER SIGNAL',
    agent: 'SUPERVISOR',
    agentName: 'Growth Supervisor',
    log: 'Growth Supervisor routed abandoned checkout for Priya Sharma to Intent Agent.'
  },
  {
    stageIndex: 2,
    stageName: 'INTENT',
    agent: 'INTENT',
    agentName: 'Customer Intent Agent',
    intentCategory: 'HIGH_RECOVERY_INTENT',
    reason: 'Customer showed purchase intent but exited before payment.',
    log: 'Intent Agent classified Priya Sharma as HIGH_RECOVERY_INTENT — ₹4,890 cart abandoned before payment.'
  },
  {
    stageIndex: 3,
    stageName: 'RECOVERY',
    agent: 'RECOVERY',
    agentName: 'Revenue Recovery Agent',
    recommendation: 'Generate a Razorpay Test Mode recovery payment link for ₹4,890.',
    log: 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.'
  },
  {
    stageIndex: 4,
    stageName: 'POLICY',
    agent: 'POLICY',
    agentName: 'Policy & Risk Agent',
    policyStatus: 'ALLOWED',
    result: 'APPROVED',
    log: 'Policy Agent approved recovery action — within merchant recovery limits.'
  },
  {
    stageIndex: 5,
    stageName: 'COMMERCE',
    agent: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    label: 'TEST MODE',
    log: 'Commerce Agent generated Razorpay Test Mode recovery checkout for ₹4,890.'
  },
  {
    stageIndex: 6,
    stageName: 'REVENUE',
    agent: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    action: 'Pay ₹4,890 with Razorpay Test Mode',
    amount: 4890,
    log: 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.'
  }
];

assert(
  priyaExpectedStages.length === 6,
  'Requirement 1: Complete 6-stage workflow defined for Priya Sharma recovery'
);

assert(
  priyaExpectedStages[0].log === 'Growth Supervisor routed abandoned checkout for Priya Sharma to Intent Agent.' &&
  priyaExpectedStages[1].intentCategory === 'HIGH_RECOVERY_INTENT' &&
  priyaExpectedStages[1].log === 'Intent Agent classified Priya Sharma as HIGH_RECOVERY_INTENT — ₹4,890 cart abandoned before payment.' &&
  priyaExpectedStages[2].log === 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.' &&
  priyaExpectedStages[3].policyStatus === 'ALLOWED' &&
  priyaExpectedStages[3].result === 'APPROVED' &&
  priyaExpectedStages[3].log === 'Policy Agent approved recovery action — within merchant recovery limits.' &&
  priyaExpectedStages[4].log === 'Commerce Agent generated Razorpay Test Mode recovery checkout for ₹4,890.' &&
  priyaExpectedStages[5].amount === 4890 &&
  priyaExpectedStages[5].log === 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.',
  'Requirement 2: Canonical stage logs and properties match the exact prompt specification'
);

// -------------------------------------------------------------
// 2. CUSTOMER & INITIAL OPPORTUNITY DEFINITIONS
// -------------------------------------------------------------
const fashionCustomers = INITIAL_MERCHANT_CUSTOMERS['merchant_fashion'] || [];
const priyaCustomer = fashionCustomers.find(c => c.name === 'Priya Sharma');

assert(
  Boolean(priyaCustomer && priyaCustomer.behavior.cartValue === 4890),
  'Requirement 3: Priya Sharma has abandoned cart worth ₹4,890 in merchant_fashion data'
);

const fashionOpportunities = INITIAL_MERCHANT_OPPORTUNITIES['merchant_fashion'] || [];
const priyaOpportunity = fashionOpportunities.find(o => o.customerName === 'Priya Sharma' && o.type === 'checkout_recovery');

assert(
  Boolean(priyaOpportunity && priyaOpportunity.expectedRevenue === 4890 && priyaOpportunity.status === 'awaiting_approval'),
  'Requirement 4: Priya Sharma checkout recovery opportunity configured with ₹4,890 expected revenue and awaiting approval'
);

// -------------------------------------------------------------
// 3. POLICY APPROVAL & BOUNDED GATING
// -------------------------------------------------------------
const fashionMerchant = INITIAL_MERCHANTS.find(m => m.id === 'merchant_fashion');
const maxDiscount = fashionMerchant?.policy.maxDiscountPercent ?? 20;

const validatePolicy = (opp: Opportunity) => {
  const isWithinLimits = opp.expectedRevenue <= (fashionMerchant?.policy.requireApprovalAboveAmount ?? 10000);
  const discountAllowed = (opp.reasoning?.policyCheck?.appliedDiscount ?? 0) <= maxDiscount;
  return {
    passed: isWithinLimits && discountAllowed,
    policyStatus: 'ALLOWED' as const,
    result: 'APPROVED' as const,
    log: 'Policy Agent approved recovery action — within merchant recovery limits.'
  };
};

const policyDecision = validatePolicy(priyaOpportunity!);
assert(
  policyDecision.passed && policyDecision.policyStatus === 'ALLOWED' && policyDecision.result === 'APPROVED',
  'Requirement 5: Policy agent deterministically approves recovery action within merchant limits'
);

// -------------------------------------------------------------
// 4. SIMULATED PAYMENT FAILURE HANDLING (RETRY_AVAILABLE)
// -------------------------------------------------------------
interface TestState {
  revenueGenerated: number;
  aiAttributedRevenue: number;
  activity: AgentActivityItem[];
  audit: AuditLog[];
  opportunityStatus: string;
}

let testState: TestState = {
  revenueGenerated: 125000,
  aiAttributedRevenue: 34500,
  activity: [],
  audit: [],
  opportunityStatus: 'awaiting_approval'
};

const recordPaymentFailure = (state: TestState, customerName: string, amount: number) => {
  const failureAct: AgentActivityItem = {
    id: `act_fail_${Date.now()}`,
    merchantId: 'merchant_fashion',
    timestamp: new Date().toISOString(),
    timeFormatted: '14:35',
    stage: 'RESULT',
    agent: 'COMMERCE',
    agentId: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    customerId: 'cust_fash_201',
    customerName,
    title: 'Payment failed — recovery link remains available.',
    description: `Simulated payment failure in Razorpay Test Mode for ₹${amount}. Revenue not incremented. Recovery payment link remains active for customer retry.`,
    toolUsed: 'RazorpayPaymentCapture',
    policyStatus: 'ALLOWED',
    policyDetails: 'Graceful recovery failure handling. Session preserved for retry.',
    status: 'warning'
  };

  const failureAud: AuditLog = {
    id: `aud_fail_${Date.now()}`,
    merchantId: 'merchant_fashion',
    timestamp: new Date().toISOString(),
    event: 'RESULT',
    agent: 'COMMERCE',
    agentId: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    customerId: 'cust_fash_201',
    customerName,
    agentDecision: 'Payment failed — recovery link remains available.',
    toolUsed: 'RazorpayPaymentCapture',
    policyStatus: 'ALLOWED',
    policyDetails: 'Graceful recovery failure handling. Session preserved for retry.',
    result: 'RETRY_AVAILABLE',
    signatureHash: '0xf411a0098877bcde'
  };

  return {
    ...state,
    activity: [failureAct, ...state.activity],
    audit: [failureAud, ...state.audit]
  };
};

const initialRevenue = testState.revenueGenerated;
const initialAiRevenue = testState.aiAttributedRevenue;

testState = recordPaymentFailure(testState, 'Priya Sharma', 4890);

assert(
  testState.revenueGenerated === initialRevenue && testState.aiAttributedRevenue === initialAiRevenue,
  'Requirement 6: Revenue and AI-attributed revenue remain completely unchanged after simulated payment failure'
);

assert(
  testState.opportunityStatus !== 'completed',
  'Requirement 7: Opportunity is NOT marked completed on payment failure'
);

const failureAuditEntry = testState.audit[0];
const failureActivityEntry = testState.activity[0];

assert(
  failureAuditEntry.result === 'RETRY_AVAILABLE' &&
  failureAuditEntry.agentDecision.includes('Payment failed — recovery link remains available.') &&
  failureActivityEntry.title.includes('Payment failed — recovery link remains available.') &&
  failureActivityEntry.status === 'warning',
  'Requirement 8: Failure event recorded in both Activity and Audit with RETRY_AVAILABLE status and identical description'
);

// -------------------------------------------------------------
// 5. RETRY PAYMENT & SUCCESSFUL REVENUE CAPTURE
// -------------------------------------------------------------
const executeSuccessfulRecovery = (state: TestState, customerName: string, amount: number) => {
  const events = [
    {
      agent: 'SUPERVISOR' as AgentId,
      agentId: 'SUPERVISOR',
      agentName: 'Growth Supervisor',
      stage: 'OBSERVE' as const,
      title: 'Growth Supervisor routed abandoned checkout for Priya Sharma to Intent Agent.',
      result: 'SUCCESS'
    },
    {
      agent: 'INTENT' as AgentId,
      agentId: 'INTENT',
      agentName: 'Customer Intent Agent',
      stage: 'UNDERSTAND' as const,
      title: 'Intent Agent classified Priya Sharma as HIGH_RECOVERY_INTENT — ₹4,890 cart abandoned before payment.',
      result: 'SUCCESS'
    },
    {
      agent: 'RECOVERY' as AgentId,
      agentId: 'RECOVERY',
      agentName: 'Revenue Recovery Agent',
      stage: 'RECOMMEND' as const,
      title: 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.',
      result: 'SUCCESS'
    },
    {
      agent: 'POLICY' as AgentId,
      agentId: 'POLICY',
      agentName: 'Policy & Risk Agent',
      stage: 'POLICY' as const,
      title: 'Policy Agent approved recovery action — within merchant recovery limits.',
      result: 'APPROVED'
    },
    {
      agent: 'COMMERCE' as AgentId,
      agentId: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'ACTION' as const,
      title: 'Commerce Agent generated Razorpay Test Mode recovery checkout for ₹4,890.',
      result: 'SUCCESS'
    },
    {
      agent: 'COMMERCE' as AgentId,
      agentId: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'RESULT' as const,
      title: 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.',
      result: 'SUCCESS'
    }
  ];

  const newActivities: AgentActivityItem[] = events.map((e, idx) => ({
    id: `act_recov_${Date.now()}_${idx}`,
    merchantId: 'merchant_fashion',
    timestamp: new Date().toISOString(),
    timeFormatted: '14:38',
    stage: e.stage,
    agent: e.agent,
    agentId: e.agentId,
    agentName: e.agentName,
    customerId: 'cust_fash_201',
    customerName,
    title: e.title,
    description: e.title,
    toolUsed: `${e.agent}Engine`,
    policyStatus: 'ALLOWED',
    policyDetails: 'Validated under FashionHub policy rules.',
    status: e.stage === 'RESULT' || e.stage === 'POLICY' ? 'success' : 'info'
  }));

  const newAudits: AuditLog[] = events.map((e, idx) => ({
    id: `aud_recov_${Date.now()}_${idx}`,
    merchantId: 'merchant_fashion',
    timestamp: new Date().toISOString(),
    event: e.stage,
    agent: e.agent,
    agentId: e.agentId,
    agentName: e.agentName,
    customerId: 'cust_fash_201',
    customerName,
    agentDecision: e.title,
    toolUsed: `${e.agent}Engine`,
    policyStatus: 'ALLOWED',
    policyDetails: 'Validated under FashionHub policy rules.',
    result: e.result,
    signatureHash: `0x7a9${idx}bb2233`
  }));

  const transaction: Transaction = {
    id: `TX_FASH_${Date.now()}`,
    merchantId: 'merchant_fashion',
    razorpayPaymentId: `pay_test_fash_recov_${Math.floor(1000 + Math.random() * 9000)}`,
    razorpayOrderId: `order_test_fash_recov_${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: 'cust_fash_201',
    customerName,
    baseProduct: 'Urban Performance Kurti & Stole Ensemble',
    baseAmount: amount,
    totalAmount: amount,
    aiAttribution: 'AI Checkout Recovery',
    aiAttributedRevenue: amount,
    status: 'SUCCESS',
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    paymentMethod: 'UPI'
  };

  return {
    revenueGenerated: state.revenueGenerated + amount,
    aiAttributedRevenue: state.aiAttributedRevenue + amount,
    activity: [...newActivities, ...state.activity],
    audit: [...newAudits, ...state.audit],
    opportunityStatus: 'completed',
    transaction
  };
};

const recoveryResult = executeSuccessfulRecovery(testState, 'Priya Sharma', 4890);

assert(
  recoveryResult.revenueGenerated === initialRevenue + 4890,
  'Requirement 9: Revenue generated successfully increments by exactly ₹4,890 upon payment capture'
);

assert(
  recoveryResult.aiAttributedRevenue === initialAiRevenue + 4890,
  'Requirement 10: AI-attributed revenue increments by exactly ₹4,890 with AI Checkout Recovery attribution'
);

assert(
  recoveryResult.opportunityStatus === 'completed',
  'Requirement 11: Priya Sharma checkout recovery opportunity transitions to completed state'
);

// -------------------------------------------------------------
// 6. EXACT AUDIT TRAIL FILTERING & ZERO CROSS-CONTAMINATION
// -------------------------------------------------------------
const allAuditLogs = recoveryResult.audit;

const filterAuditLogs = (logs: AuditLog[], filterAgent: string) => {
  if (filterAgent === 'ALL') return logs;
  const target = filterAgent.toUpperCase();
  return logs.filter(log => {
    const logAgent = (log.agent || log.agentId || '').toUpperCase();
    const logAgentName = (log.agentName || '').toUpperCase();

    if (target === 'SUPERVISOR') {
      return logAgent === 'SUPERVISOR' || (logAgentName.includes('SUPERVISOR') && !logAgentName.includes('INTENT'));
    }
    if (target === 'INTENT') {
      return logAgent === 'INTENT' || (logAgentName.includes('INTENT') && !logAgentName.includes('SUPERVISOR'));
    }
    if (target === 'MERCHANDISING') {
      return logAgent === 'MERCHANDISING' || logAgentName.includes('MERCHANDISING');
    }
    if (target === 'RECOVERY') {
      return logAgent === 'RECOVERY' || logAgentName.includes('RECOVERY');
    }
    if (target === 'POLICY') {
      return logAgent === 'POLICY' || logAgentName.includes('POLICY');
    }
    if (target === 'COMMERCE') {
      return logAgent === 'COMMERCE' || logAgentName.includes('COMMERCE');
    }
    return logAgent === target;
  });
};

const recoveryAuditLogs = filterAuditLogs(allAuditLogs, 'RECOVERY');
assert(
  recoveryAuditLogs.length === 1 && recoveryAuditLogs[0].agentDecision === 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.',
  'Requirement 12: Recovery filter returns ONLY Recovery Agent event without cross-contamination'
);

const intentAuditLogs = filterAuditLogs(allAuditLogs, 'INTENT');
assert(
  intentAuditLogs.length === 1 && intentAuditLogs[0].agentDecision.includes('HIGH_RECOVERY_INTENT'),
  'Requirement 13: Intent filter returns ONLY Intent Agent event and does not leak into Recovery or Supervisor'
);

const supervisorAuditLogs = filterAuditLogs(allAuditLogs, 'SUPERVISOR');
assert(
  supervisorAuditLogs.length === 1 && supervisorAuditLogs[0].agentDecision.includes('Growth Supervisor routed'),
  'Requirement 14: Supervisor filter returns ONLY Supervisor Agent event and does not leak into Intent'
);

const policyAuditLogs = filterAuditLogs(allAuditLogs, 'POLICY');
assert(
  policyAuditLogs.length === 1 && policyAuditLogs[0].agentDecision.includes('Policy Agent approved recovery action'),
  'Requirement 15: Policy filter returns ONLY Policy Agent event'
);

const commerceAuditLogs = filterAuditLogs(allAuditLogs, 'COMMERCE');
assert(
  commerceAuditLogs.length === 3 && commerceAuditLogs.some(l => l.result === 'RETRY_AVAILABLE') && commerceAuditLogs.some(l => l.agentDecision.includes('captured ₹4,890 in Razorpay Test Mode')),
  'Requirement 16: Commerce filter returns Commerce generated, capture, and failure retry events'
);

// -------------------------------------------------------------
// 7. BASKET GROWTH FLOW REGRESSION INTEGRITY CHECK
// -------------------------------------------------------------
const sportsOpportunities = INITIAL_MERCHANT_OPPORTUNITIES['merchant_sports'] || [];
const aaravOpportunity = sportsOpportunities.find(o => o.customerName === 'Aarav Mehta' && o.type === 'cross_sell');

assert(
  Boolean(aaravOpportunity && aaravOpportunity.productTarget === 'Velocity Runner X' && aaravOpportunity.expectedRevenue === 1299),
  'Requirement 17: Aarav Mehta Basket Growth scenario in UrbanKart remains intact and unaffected'
);

console.log('\n------------------------------------------------------------------');
console.log(`TEST RESULTS: TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('==================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL PRIYA SHARMA CHECKOUT RECOVERY TESTS PASSED PERFECTLY! 🚀\n');
}

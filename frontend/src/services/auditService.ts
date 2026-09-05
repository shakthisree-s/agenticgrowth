import { AuditLog, AgentStage } from '../types';

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_801',
    timestamp: '2026-09-01T09:42:18.102Z',
    event: 'OBSERVE',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Detected 4 page visits on Velocity Runner X + cart addition without checkout completion.',
    toolUsed: 'BehaviorSignalDetector_v2.4',
    policyStatus: 'ALLOWED',
    policyDetails: 'Customer consent valid; analytics session active.',
    result: 'SUCCESS',
    signatureHash: '0x8f2a99e1c3b77209',
    payloadDiff: { views: 4, item: 'Velocity Runner X', cartValue: 6999 }
  },
  {
    id: 'aud_802',
    timestamp: '2026-09-01T09:42:19.420Z',
    event: 'UNDERSTAND',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Classified customer intent as High Purchase Intent (Score: 94/100). Identified cross-sell compatibility.',
    toolUsed: 'IntentAffinityClassifier',
    policyStatus: 'ALLOWED',
    policyDetails: 'Category affinity matches running gear cluster.',
    result: 'SUCCESS',
    signatureHash: '0x7c41b8a901ff2148',
    payloadDiff: { intentScore: 94, intentCategory: 'running_gear' }
  },
  {
    id: 'aud_803',
    timestamp: '2026-09-01T09:42:20.089Z',
    event: 'RECOMMEND',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Generate complementary sports-socks bundle offer (₹799 value uplift) with 10% bundle coupon.',
    toolUsed: 'RecommendationEngine_v3',
    policyStatus: 'ALLOWED',
    policyDetails: 'Bundle discount 10% <= Merchant Limit 15%.',
    result: 'AWAITING_APPROVAL',
    signatureHash: '0x5e19cc442b08a117',
    payloadDiff: { addon: 'Pro Dynamic Running Socks (3-Pack)', uplift: 799, discountApplied: 10 }
  },
  {
    id: 'aud_804',
    timestamp: '2026-09-01T09:42:21.310Z',
    event: 'POLICY',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Policy evaluation passed with HUMAN_APPROVAL_GATE due to total expected transaction value ₹7,798.',
    toolUsed: 'MerchantPolicyGuard',
    policyStatus: 'FLAGGED',
    policyDetails: 'Expected basket ₹7,798 > Auto-threshold ₹4,000. Approval required.',
    result: 'AWAITING_APPROVAL',
    signatureHash: '0x99a0cb4112e7fe32'
  },
  {
    id: 'aud_805',
    timestamp: '2026-09-01T09:43:10.005Z',
    event: 'APPROVAL',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Merchant UrbanKart reviewed and approved bundle recommendation action.',
    toolUsed: 'MerchantApprovalGateway',
    policyStatus: 'ALLOWED',
    policyDetails: 'Signed off by Admin User (Merchant Key ID: rzp_test_9kX8yN21mBqZaL).',
    result: 'EXECUTED',
    signatureHash: '0x22c98ff0901ab764'
  },
  {
    id: 'aud_806',
    timestamp: '2026-09-01T09:43:12.441Z',
    event: 'ACTION',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Dispatched dynamic bundle prompt into customer checkout stream via Razorpay Smart Cart.',
    toolUsed: 'RazorpayAgenticCommerceTool',
    policyStatus: 'ALLOWED',
    policyDetails: 'Test Mode order token generated: order_test_9892k1Aarav.',
    result: 'SUCCESS',
    signatureHash: '0x10b77e8ca49233dc'
  },
  {
    id: 'aud_807',
    timestamp: '2026-09-01T09:43:15.912Z',
    event: 'RESULT',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    agentDecision: 'Customer accepted bundle and completed Razorpay Test Mode payment. Revenue uplift: ₹799 verified.',
    toolUsed: 'RevenueAttributionEngine',
    policyStatus: 'ALLOWED',
    policyDetails: 'Payment verified: pay_test_778192aAarav. Ledger updated.',
    result: 'SUCCESS',
    signatureHash: '0x34d081f9a672bb19',
    payloadDiff: { totalBasket: 7798, aiAttributedUplift: 799, status: 'CAPTURED' }
  }
];

class AuditService {
  private logs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

  public getLogs(): AuditLog[] {
    return [...this.logs];
  }

  public addLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'signatureHash'>): AuditLog {
    const timestamp = new Date().toISOString();
    const hash = '0x' + Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');
    const newLog: AuditLog = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      signatureHash: hash,
      ...entry
    };

    this.logs.unshift(newLog);
    return newLog;
  }

  public logEvent(entry: Omit<AuditLog, 'id' | 'timestamp' | 'signatureHash'>): AuditLog {
    return this.addLog(entry);
  }

  public exportAsJson(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const auditService = new AuditService();

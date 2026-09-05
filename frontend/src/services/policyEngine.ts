import { MerchantPolicy, PolicyCheckResult } from '../types';

export const DEFAULT_MERCHANT_POLICY: MerchantPolicy = {
  maxDiscountPercent: 15,
  requireApprovalAboveAmount: 4000,
  minConfidenceForAutonomousAction: 90,
  allowAutonomousCheckoutRecovery: true,
  allowAutonomousCrossSell: true,
  razorpayKeyId: 'rzp_test_TYKc8FRrtI6lPR',
  webhookSecret: 'whsec_merchant_os_ai_growth_guard',
  testModeActive: true
};

class PolicyEngineService {
  private policy: MerchantPolicy = { ...DEFAULT_MERCHANT_POLICY };

  public getPolicy(): MerchantPolicy {
    return this.policy;
  }

  public updatePolicy(newPolicy: Partial<MerchantPolicy>): MerchantPolicy {
    this.policy = { ...this.policy, ...newPolicy };
    return this.policy;
  }

  public evaluateAction(params: {
    actionType: string;
    expectedAmount: number;
    discountPercent?: number;
    confidence: number;
    customerRiskScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  }): PolicyCheckResult {
    const discount = params.discountPercent || 0;
    const discountExceeded = discount > this.policy.maxDiscountPercent;
    const amountHigh = params.expectedAmount >= this.policy.requireApprovalAboveAmount;
    const confidenceLow = params.confidence < this.policy.minConfidenceForAutonomousAction;

    if (discountExceeded) {
      return {
        passed: false,
        ruleName: 'DISCOUNT_CEILING_BREACH',
        details: `Requested discount (${discount}%) exceeds merchant maximum policy cap of ${this.policy.maxDiscountPercent}%.`,
        maxDiscountAllowed: this.policy.maxDiscountPercent,
        appliedDiscount: discount,
        requiresHumanApproval: true,
        riskScore: 'HIGH'
      };
    }

    if (amountHigh || confidenceLow) {
      return {
        passed: true,
        ruleName: 'HUMAN_APPROVAL_GATE',
        details: amountHigh
          ? `High-value action (₹${params.expectedAmount.toLocaleString('en-IN')}) exceeds auto-execute threshold of ₹${this.policy.requireApprovalAboveAmount.toLocaleString('en-IN')}. Requires merchant sign-off.`
          : `Confidence score (${params.confidence}%) is below autonomous threshold (${this.policy.minConfidenceForAutonomousAction}%). Human review required.`,
        maxDiscountAllowed: this.policy.maxDiscountPercent,
        appliedDiscount: discount,
        requiresHumanApproval: true,
        riskScore: 'MEDIUM'
      };
    }

    return {
      passed: true,
      ruleName: 'AUTONOMOUS_EXECUTION_SAFE',
      details: `Action is within all merchant guardrails: discount (${discount}% <= ${this.policy.maxDiscountPercent}%), value safe (< ₹${this.policy.requireApprovalAboveAmount.toLocaleString('en-IN')}), confidence (${params.confidence}% >= ${this.policy.minConfidenceForAutonomousAction}%).`,
      maxDiscountAllowed: this.policy.maxDiscountPercent,
      appliedDiscount: discount,
      requiresHumanApproval: false,
      riskScore: 'LOW'
    };
  }
}

export const policyEngine = new PolicyEngineService();

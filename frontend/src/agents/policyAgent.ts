import { PolicyResult, MerchantPolicy } from '../types';
import { policyEngine } from '../services/policyEngine';

export class PolicyAgent {
  public readonly id = 'POLICY' as const;
  public readonly name = 'Policy & Risk Agent';
  public readonly role = 'Enforce merchant safety guardrails, discount caps, and human-in-the-loop approvals';
  public readonly tools = [
    'DiscountCeilingGuard',
    'MarginProtectionEngine',
    'HumanApprovalGateway',
    'RateLimitingValidator'
  ];

  public evaluate(params: {
    actionType: string;
    expectedAmount: number;
    discountPercent?: number;
    confidence: number;
    customPolicy?: MerchantPolicy;
  }): PolicyResult {
    const policy = params.customPolicy || policyEngine.getPolicy();
    const discount = params.discountPercent || 0;
    const reasons: string[] = [];

    // Check 1: Discount Ceiling Breach
    if (discount > policy.maxDiscountPercent) {
      reasons.push(
        `Discount requested (${discount}%) exceeds merchant maximum policy ceiling of ${policy.maxDiscountPercent}%.`
      );
      return {
        decision: 'BLOCKED',
        reasons,
        risk: 'HIGH',
        maxDiscountAllowed: policy.maxDiscountPercent,
        appliedDiscount: discount,
        ruleTriggered: 'DISCOUNT_CEILING_BREACH'
      };
    }

    // Check 2: High Value Transaction Gate
    if (params.expectedAmount >= policy.requireApprovalAboveAmount) {
      reasons.push(
        `Transaction value (₹${params.expectedAmount.toLocaleString('en-IN')}) exceeds autonomous execution threshold (₹${policy.requireApprovalAboveAmount.toLocaleString('en-IN')}).`
      );
      return {
        decision: 'APPROVAL_REQUIRED',
        reasons,
        risk: 'MEDIUM',
        maxDiscountAllowed: policy.maxDiscountPercent,
        appliedDiscount: discount,
        ruleTriggered: 'HIGH_VALUE_TRANSACTION_GATE'
      };
    }

    // Check 3: Low Confidence Gate
    if (params.confidence * 100 < policy.minConfidenceForAutonomousAction && params.confidence < policy.minConfidenceForAutonomousAction) {
      reasons.push(
        `Confidence score (${params.confidence > 1 ? params.confidence : Math.round(params.confidence * 100)}%) is below autonomous threshold (${policy.minConfidenceForAutonomousAction}%).`
      );
      return {
        decision: 'APPROVAL_REQUIRED',
        reasons,
        risk: 'MEDIUM',
        maxDiscountAllowed: policy.maxDiscountPercent,
        appliedDiscount: discount,
        ruleTriggered: 'CONFIDENCE_THRESHOLD_GATE'
      };
    }

    // Pass all checks
    reasons.push(
      `Action complies with all merchant safety policies: discount (${discount}% <= ${policy.maxDiscountPercent}%), value safe (< ₹${policy.requireApprovalAboveAmount.toLocaleString('en-IN')}), confidence verified.`
    );

    return {
      decision: 'AUTO_APPROVE',
      reasons,
      risk: 'LOW',
      maxDiscountAllowed: policy.maxDiscountPercent,
      appliedDiscount: discount,
      ruleTriggered: 'AUTONOMOUS_EXECUTION_SAFE'
    };
  }
}

export const policyAgent = new PolicyAgent();

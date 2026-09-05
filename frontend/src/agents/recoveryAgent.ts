import { RecoveryResult, Customer } from '../types';

export class RevenueRecoveryAgent {
  public readonly id = 'RECOVERY' as const;
  public readonly name = 'Revenue Recovery Agent';
  public readonly role = 'Recover at-risk or lost revenue from abandoned checkouts and payment drop-offs';
  public readonly tools = [
    'CheckoutSessionTracker',
    'PaymentFailureDiagnoser',
    'RazorpaySmartLinkGenerator',
    'DynamicIncentiveCalculator'
  ];

  public decide(customer: Customer, params?: { failedPayment?: boolean }): RecoveryResult {
    const cartVal = customer.behavior.cartValue || 4890;
    const duration = customer.behavior.abandonedAt || '18 minutes ago';

    if (params?.failedPayment) {
      return {
        actionType: 'PAYMENT_RETRY',
        cartValue: cartVal,
        expectedRecovery: cartVal,
        confidence: 0.95,
        abandonedDuration: 'Just now',
        reasoning: `Payment gateway timeout detected. Generate auto-retry link via secondary payment rail (UPI / Netbanking).`,
        recoveryIncentivePct: 0
      };
    }

    // High value cart recovery e.g. Priya Sharma ₹4,890
    if (cartVal >= 4000) {
      return {
        actionType: 'PAYMENT_LINK',
        cartValue: cartVal,
        expectedRecovery: cartVal,
        confidence: 0.91,
        abandonedDuration: duration,
        reasoning: `High-value basket (₹${cartVal.toLocaleString('en-IN')}) abandoned ${duration}. Recommend dispatching personalized Razorpay Smart Link with pre-filled session and 5% recovery incentive.`,
        recoveryIncentivePct: 5
      };
    }

    // Standard reminder
    return {
      actionType: 'REMINDER',
      cartValue: cartVal,
      expectedRecovery: cartVal,
      confidence: 0.88,
      abandonedDuration: duration,
      reasoning: `Standard cart recovery sequence. Dispatch multi-channel WhatsApp reminder with 1-click Razorpay test checkout link.`,
      recoveryIncentivePct: 0
    };
  }
}

export const recoveryAgent = new RevenueRecoveryAgent();

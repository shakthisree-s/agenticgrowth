import { Customer, IntentResult, IntentCategory } from '../types';

export class CustomerIntentAgent {
  public readonly id = 'INTENT' as const;
  public readonly name = 'Customer Intent Agent';
  public readonly role = 'Understand customer behavior, session depth, and purchase intent';
  public readonly tools = [
    'SessionSignalDetector',
    'IntentAffinityClassifier',
    'CartAbandonmentAnalyzer',
    'BehavioralHistoryGraph'
  ];

  public analyze(customer: Customer, customContext?: { query?: string; currentCart?: any }): IntentResult {
    const { behavior } = customer;
    let intent: IntentCategory = 'LOW_INTENT';
    let confidence = 0.85;
    const evidence: string[] = [];
    let nextAgent: 'MERCHANDISING' | 'RECOVERY' | 'SUPERVISOR' = 'MERCHANDISING';

    // 1. Check for Cart Abandonment
    if (behavior.abandonedAt || (behavior.cartValue > 0 && !behavior.hasPurchased && (behavior.daysActive ?? 1) <= 2)) {
      intent = 'CART_ABANDONMENT';
      confidence = Math.min(0.96, 0.85 + (behavior.cartValue > 3000 ? 0.08 : 0.04));
      evidence.push(`High-value basket (₹${behavior.cartValue.toLocaleString('en-IN')}) abandoned in active session`);
      if (behavior.abandonedAt) {
        evidence.push(`Drop-off timestamp recorded: ${behavior.abandonedAt}`);
      }
      evidence.push(`Customer viewed ${behavior.lastViewedProduct || 'catalog items'} ${behavior.viewedTimes ?? 1} times`);
      nextAgent = 'RECOVERY';
    } 
    // 2. High Purchase Intent
    else if ((behavior.viewedTimes ?? 1) >= 3 || ((behavior.intentScore ?? 0) >= 90)) {
      intent = 'HIGH_PURCHASE_INTENT';
      confidence = (behavior.intentScore || 92) / 100;
      evidence.push(`Viewed ${behavior.lastViewedProduct || 'catalog items'} ${behavior.viewedTimes ?? 1} times`);
      if (behavior.cartItems.length > 0) {
        evidence.push(`Added product '${behavior.lastViewedProduct}' to cart`);
      }
      evidence.push(`High engagement: active in ${behavior.daysActive ?? 1} recent sessions`);
      nextAgent = 'MERCHANDISING';
    } 
    // 3. Repeat Buyer / Cross-sell Ready
    else if (behavior.hasPurchased && customer.lifetimeValue > 10000) {
      intent = 'REPEAT_BUYER';
      confidence = 0.92;
      evidence.push(`High lifetime value customer (₹${customer.lifetimeValue.toLocaleString('en-IN')})`);
      evidence.push(`Strong category affinity in ${(behavior.preferredCategories || []).join(', ')}`);
      nextAgent = 'MERCHANDISING';
    }
    // 4. Conversational direct query intent
    else if (customContext?.query) {
      intent = 'HIGH_PURCHASE_INTENT';
      confidence = 0.94;
      evidence.push(`Explicit natural language intent query: "${customContext.query}"`);
      evidence.push(`Target price and category constraints extracted`);
      nextAgent = 'MERCHANDISING';
    } else {
      intent = 'CROSS_SELL_READY';
      confidence = 0.88;
      evidence.push(`Active session browsing ${behavior.lastViewedProduct}`);
      nextAgent = 'MERCHANDISING';
    }

    return {
      customer: customer.name,
      customerId: customer.id,
      intent,
      confidence: Math.round(confidence * 100) / 100,
      evidence,
      nextAgent,
      analyzedAt: new Date().toISOString()
    };
  }
}

export const intentAgent = new CustomerIntentAgent();

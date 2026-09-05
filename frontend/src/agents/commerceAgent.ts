import { ExecutionResult, Transaction } from '../types';
import { commerceService } from '../services/commerceService';

export class CommerceExecutionAgent {
  public readonly id = 'COMMERCE' as const;
  public readonly name = 'Commerce Execution Agent';
  public readonly role = 'Execute approved commerce actions in Razorpay TEST MODE and record revenue attribution';
  public readonly tools = [
    'RazorpayOrderCreator',
    'PaymentGatewaySimulator',
    'SmartLinkDispatcher',
    'RevenueLedgerRecorder',
    'WebhookEmitter'
  ];

  public execute(params: {
    customerId: string;
    customerName: string;
    baseProduct: string;
    baseAmount: number;
    aiAddonProduct?: string;
    aiAddonAmount?: number;
    aiAttribution: 'AI Cross-sell' | 'AI Upsell' | 'AI Checkout Recovery' | 'Direct';
    paymentMethod?: 'UPI' | 'Card' | 'Netbanking';
  }): { executionResult: ExecutionResult; transaction: Transaction } {
    const tx = commerceService.createTestModeTransaction(params);

    const executionResult: ExecutionResult = {
      razorpayOrderId: tx.razorpayOrderId,
      razorpayPaymentId: tx.razorpayPaymentId,
      status: 'PAYMENT_CAPTURED',
      amount: tx.totalAmount,
      aiAttributedRevenue: tx.aiAttributedRevenue,
      paymentMethod: tx.paymentMethod,
      executedAt: new Date().toISOString()
    };

    return { executionResult, transaction: tx };
  }
}

export const commerceAgent = new CommerceExecutionAgent();

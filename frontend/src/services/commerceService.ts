import { Transaction } from '../types';
import { auditService } from './auditService';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TX20481',
    razorpayPaymentId: 'pay_test_9921Ka9124L',
    razorpayOrderId: 'order_test_881920KaL',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    baseProduct: 'Velocity Runner X',
    baseAmount: 6999,
    aiAddonProduct: 'Pro Dynamic Running Socks (3-Pack)',
    aiAddonAmount: 799,
    totalAmount: 7798,
    aiAttribution: 'AI Cross-sell',
    aiAttributedRevenue: 799,
    status: 'SUCCESS',
    timestamp: '2026-09-02 10:34:15',
    paymentMethod: 'UPI'
  },
  {
    id: 'TX20482',
    razorpayPaymentId: 'pay_test_8812Ma0119X',
    razorpayOrderId: 'order_test_771829MaX',
    customerId: 'C103',
    customerName: 'Priya Sharma',
    baseProduct: 'UltraSlim Ergonomic Laptop Stand',
    baseAmount: 4890,
    totalAmount: 4890,
    aiAttribution: 'AI Checkout Recovery',
    aiAttributedRevenue: 4890,
    status: 'SUCCESS',
    timestamp: '2026-09-02 09:12:44',
    paymentMethod: 'Card'
  },
  {
    id: 'TX20483',
    razorpayPaymentId: 'pay_test_7701Nx4481P',
    razorpayOrderId: 'order_test_660211NxP',
    customerId: 'C105',
    customerName: 'Ananya Iyer',
    baseProduct: 'AeroFlex Marathon Ultra',
    baseAmount: 8499,
    totalAmount: 8499,
    aiAttribution: 'Direct',
    aiAttributedRevenue: 0,
    status: 'SUCCESS',
    timestamp: '2026-09-02 08:30:10',
    paymentMethod: 'Netbanking'
  },
  {
    id: 'TX20484',
    razorpayPaymentId: 'pay_test_6691Qz2289R',
    razorpayOrderId: 'order_test_559102QzR',
    customerId: 'C106',
    customerName: 'Vikram Sengupta',
    baseProduct: 'UltraSlim Ergonomic Laptop Stand',
    baseAmount: 3499,
    totalAmount: 3499,
    aiAttribution: 'Direct',
    aiAttributedRevenue: 0,
    status: 'REFUNDED',
    timestamp: '2026-09-02 07:55:22',
    paymentMethod: 'Card'
  },
  {
    id: 'TX20485',
    razorpayPaymentId: 'pay_test_5580Lk3312B',
    razorpayOrderId: 'order_test_448019LkB',
    customerId: 'C104',
    customerName: 'Rahul Verma',
    baseProduct: 'MagShield Kevlar Phone Case',
    baseAmount: 1499,
    aiAddonProduct: '9H DiamondEdge Screen Protector',
    aiAddonAmount: 799,
    totalAmount: 2298,
    aiAttribution: 'AI Cross-sell',
    aiAttributedRevenue: 799,
    status: 'PENDING',
    timestamp: '2026-09-02 06:40:05',
    paymentMethod: 'UPI'
  }
];

class CommerceService {
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public createTestModeTransaction(params: {
    customerId: string;
    customerName: string;
    baseProduct: string;
    baseAmount: number;
    aiAddonProduct?: string;
    aiAddonAmount?: number;
    aiAttribution: 'AI Cross-sell' | 'AI Upsell' | 'AI Checkout Recovery' | 'Direct';
    paymentMethod?: 'UPI' | 'Card' | 'Netbanking';
  }): Transaction {
    const aiAttributedRevenue = params.aiAddonAmount || (params.aiAttribution === 'AI Checkout Recovery' ? params.baseAmount : 0);
    const totalAmount = params.baseAmount + (params.aiAddonAmount || 0);
    const id = `TX${Math.floor(20486 + this.transactions.length + Math.random() * 100)}`;
    const rzpRandom = Math.random().toString(36).substring(2, 9).toUpperCase();
    const razorpayPaymentId = `pay_test_${rzpRandom}92L`;
    const razorpayOrderId = `order_test_${rzpRandom}01R`;

    const tx: Transaction = {
      id,
      razorpayPaymentId,
      razorpayOrderId,
      customerId: params.customerId,
      customerName: params.customerName,
      baseProduct: params.baseProduct,
      baseAmount: params.baseAmount,
      aiAddonProduct: params.aiAddonProduct,
      aiAddonAmount: params.aiAddonAmount,
      totalAmount,
      aiAttribution: params.aiAttribution,
      aiAttributedRevenue,
      status: 'SUCCESS',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentMethod: params.paymentMethod || 'UPI'
    };

    this.transactions.unshift(tx);

    // Audit log
    auditService.logEvent({
      event: 'ACTION',
      customerId: params.customerId,
      customerName: params.customerName,
      agentDecision: `Captured ₹${totalAmount.toLocaleString('en-IN')} in Razorpay Test Mode (${params.aiAttribution})`,
      toolUsed: 'RazorpayPaymentCapture',
      policyStatus: 'ALLOWED',
      policyDetails: 'Transaction verified against merchant policy thresholds.',
      result: 'SUCCESS',
      payloadDiff: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        amount: totalAmount,
        aiAttributed: aiAttributedRevenue,
        method: tx.paymentMethod
      }
    });

    return tx;
  }
}

export const commerceService = new CommerceService();

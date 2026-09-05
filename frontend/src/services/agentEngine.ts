import {
  Opportunity,
  Customer,
  Campaign,
  AgentActivityItem,
  AgentStats
} from '../types';
import { policyEngine } from './policyEngine';
import { auditService } from './auditService';
import { commerceService } from './commerceService';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'C102',
    name: 'Aarav Mehta',
    email: 'aarav.m@example.com',
    phone: '+91 98201 44819',
    location: 'Bengaluru, KA',
    lifetimeValue: 14500,
    status: 'high_intent',
    avatarColor: '#111111',
    behavior: {
      viewedTimes: 4,
      lastViewedProduct: 'Velocity Runner X',
      cartValue: 6999,
      cartItems: ['Velocity Runner X'],
      daysActive: 3,
      hasPurchased: false,
      intentScore: 94,
      preferredCategories: ['Running Shoes', 'Fitness Gear']
    }
  },
  {
    id: 'C103',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 97112 00391',
    location: 'Mumbai, MH',
    lifetimeValue: 28900,
    status: 'at_risk',
    avatarColor: '#262626',
    behavior: {
      viewedTimes: 5,
      lastViewedProduct: 'UltraSlim Ergonomic Laptop Stand',
      cartValue: 4890,
      cartItems: ['UltraSlim Ergonomic Laptop Stand'],
      daysActive: 1,
      hasPurchased: false,
      intentScore: 91,
      abandonedAt: '24 mins ago',
      preferredCategories: ['Workstation Accessories', 'Electronics']
    }
  },
  {
    id: 'C104',
    name: 'Rahul Verma',
    email: 'rahul.v@example.com',
    phone: '+91 98450 77123',
    location: 'Delhi NCR',
    lifetimeValue: 9200,
    status: 'active',
    avatarColor: '#404040',
    behavior: {
      viewedTimes: 3,
      lastViewedProduct: 'MagShield Kevlar Phone Case',
      cartValue: 1999,
      cartItems: ['MagShield Kevlar Phone Case'],
      daysActive: 2,
      hasPurchased: false,
      intentScore: 88,
      preferredCategories: ['Electronics Accessories']
    }
  },
  {
    id: 'C105',
    name: 'Ananya Iyer',
    email: 'ananya.i@example.com',
    phone: '+91 99002 88310',
    location: 'Hyderabad, TS',
    lifetimeValue: 34000,
    status: 'high_intent',
    avatarColor: '#111111',
    behavior: {
      viewedTimes: 6,
      lastViewedProduct: 'AeroFlex Marathon Ultra',
      cartValue: 8499,
      cartItems: ['AeroFlex Marathon Ultra'],
      daysActive: 5,
      hasPurchased: false,
      intentScore: 92,
      preferredCategories: ['Running Shoes', 'Apparel']
    }
  },
  {
    id: 'C106',
    name: 'Vikram Sengupta',
    email: 'vikram.s@example.com',
    phone: '+91 98310 11982',
    location: 'Kolkata, WB',
    lifetimeValue: 18500,
    status: 'active',
    avatarColor: '#555555',
    behavior: {
      viewedTimes: 2,
      lastViewedProduct: 'UltraSlim Ergonomic Laptop Stand',
      cartValue: 3499,
      cartItems: ['UltraSlim Ergonomic Laptop Stand'],
      daysActive: 1,
      hasPurchased: true,
      intentScore: 78,
      preferredCategories: ['Workstation Accessories']
    }
  },
  {
    id: 'C107',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@example.com',
    phone: '+91 99220 55190',
    location: 'Pune, MH',
    lifetimeValue: 8400,
    status: 'lapsed',
    avatarColor: '#777777',
    behavior: {
      viewedTimes: 1,
      lastViewedProduct: '9H DiamondEdge Screen Protector',
      cartValue: 0,
      cartItems: [],
      daysActive: 14,
      hasPurchased: false,
      intentScore: 45,
      preferredCategories: ['Electronics Accessories']
    }
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_101',
    type: 'cross_sell',
    title: 'Sports Socks Bundle Recommendation',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    customerBehavior: 'High Purchase Intent • Viewed Running Shoes 4×',
    productTarget: 'Velocity Runner X',
    aiRecommendation: 'Offer complementary Pro Dynamic Running Socks bundle (+₹799).',
    recommendedItem: {
      id: 'prod_socks_01',
      name: 'Pro Dynamic Running Socks (3-Pack)',
      price: 799,
      discountedPrice: 699
    },
    expectedRevenue: 1299,
    confidence: 94,
    opportunityScore: 94,
    status: 'ready',
    createdAt: '12 mins ago',
    createdByAgent: 'MERCHANDISING',
    reviewedByAgent: 'POLICY',
    executedByAgent: 'COMMERCE',
    reasoning: {
      observation: 'Customer visited Velocity Runner X 4 times in 36 hours and added item to cart.',
      signal: 'High purchase intent with hesitation at final cart step.',
      productRelationship: '78% of sports shoes buyers add anti-blister sports socks when offered as a 1-click bundle.',
      action: 'Recommend bundle with ₹100 instant bundle discount in Razorpay checkout.',
      expectedImpact: '₹1,299 expected net incremental basket value.',
      policyCheck: {
        passed: true,
        ruleName: 'AUTONOMOUS_EXECUTION_SAFE',
        details: 'Discount 10% <= 15% max limit. 0% margin dilution.',
        maxDiscountAllowed: 15,
        appliedDiscount: 10,
        requiresHumanApproval: false,
        riskScore: 'LOW'
      },
      toolUsed: 'CrossSellRecommendationEngine'
    }
  },
  {
    id: 'opp_102',
    type: 'checkout_recovery',
    title: 'Checkout Abandonment Recovery',
    customerId: 'C103',
    customerName: 'Priya Sharma',
    customerBehavior: 'Checkout Abandonment • Dropped cart at gateway stage',
    productTarget: 'UltraSlim Ergonomic Laptop Stand',
    aiRecommendation: 'Dispatch personalized 1-click Razorpay test payment recovery link.',
    expectedRevenue: 4890,
    confidence: 91,
    opportunityScore: 91,
    status: 'awaiting_approval',
    createdAt: '24 mins ago',
    createdByAgent: 'RECOVERY',
    reviewedByAgent: 'POLICY',
    executedByAgent: 'COMMERCE',
    reasoning: {
      observation: 'Customer initiated checkout on Laptop Stand (₹4,890) but dropped off at payment selection.',
      signal: 'High-value basket abandonment with active session token.',
      productRelationship: 'High margin inventory; stock availability guaranteed.',
      action: 'Generate personalized Razorpay payment link with 5% limited-time recovery incentive.',
      expectedImpact: '₹4,890 recovered revenue with projected 68% recovery probability.',
      policyCheck: {
        passed: true,
        ruleName: 'HUMAN_APPROVAL_GATE',
        details: 'Checkout value ₹4,890 exceeds auto-recovery threshold. Requires merchant approval.',
        maxDiscountAllowed: 15,
        appliedDiscount: 5,
        requiresHumanApproval: true,
        riskScore: 'LOW'
      },
      toolUsed: 'CartRecoveryAgent'
    }
  },
  {
    id: 'opp_103',
    type: 'cross_sell',
    title: 'Screen Protector Cross-Sell',
    customerId: 'C104',
    customerName: 'Rahul Verma',
    customerBehavior: 'Purchasing MagShield Kevlar Phone Case',
    productTarget: 'MagShield Kevlar Phone Case',
    aiRecommendation: 'Recommend 9H DiamondEdge Screen Protector at checkout.',
    recommendedItem: {
      id: 'prod_screen_01',
      name: '9H DiamondEdge Screen Protector',
      price: 799
    },
    expectedRevenue: 799,
    confidence: 88,
    opportunityScore: 88,
    status: 'ready',
    createdAt: '45 mins ago',
    createdByAgent: 'MERCHANDISING',
    reviewedByAgent: 'POLICY',
    executedByAgent: 'COMMERCE',
    reasoning: {
      observation: 'Customer has iPhone 15 Pro Kevlar case in active cart session.',
      signal: 'Strong accessory affinity and low price elasticity for device screen protection.',
      productRelationship: '92% co-purchase rate between cases and screen shields.',
      action: 'Present pre-checked add-on item in Razorpay Smart Cart drawer.',
      expectedImpact: '₹799 instantaneous basket expansion with 0 merchant cost.',
      policyCheck: {
        passed: true,
        ruleName: 'AUTONOMOUS_EXECUTION_SAFE',
        details: 'Value < ₹4,000 and 0% margin dilution. Safe for autonomous execution.',
        maxDiscountAllowed: 15,
        appliedDiscount: 0,
        requiresHumanApproval: false,
        riskScore: 'LOW'
      },
      toolUsed: 'AffinityGraphRecommender'
    }
  },
  {
    id: 'opp_104',
    type: 'upsell',
    title: 'VIP Racing Footwear Upsell',
    customerId: 'C105',
    customerName: 'Ananya Iyer',
    customerBehavior: 'High Intent • Viewed Marathon Shoe 6×',
    productTarget: 'SwiftRun Pro Max',
    aiRecommendation: 'Suggest AeroFlex Marathon Ultra with full carbon plate (+₹1,499).',
    expectedRevenue: 1499,
    confidence: 92,
    opportunityScore: 92,
    status: 'ready',
    createdAt: '1 hour ago',
    createdByAgent: 'MERCHANDISING',
    reviewedByAgent: 'POLICY',
    executedByAgent: 'COMMERCE',
    reasoning: {
      observation: 'Customer logged 18+ minutes reading technical specs of marathon carbon plate models.',
      signal: 'Performance-driven runner willing to trade up for speed and energy return.',
      productRelationship: 'AeroFlex Marathon Ultra delivers 3.4x higher energy return.',
      action: 'Trigger in-app spec comparison highlighting carbon propulsion.',
      expectedImpact: '₹1,499 incremental transaction value.',
      policyCheck: {
        passed: true,
        ruleName: 'AUTONOMOUS_EXECUTION_SAFE',
        details: 'Within autonomous price delta tolerance.',
        maxDiscountAllowed: 15,
        appliedDiscount: 8,
        requiresHumanApproval: false,
        riskScore: 'LOW'
      },
      toolUsed: 'CatalogUpsellEngine'
    }
  },
  {
    id: 'opp_105',
    type: 'upsell',
    title: 'Excessive Discount Request',
    customerId: 'C106',
    customerName: 'Vikram Sengupta',
    customerBehavior: 'Requested 30% custom promo code via checkout agent',
    productTarget: 'UltraSlim Ergonomic Aluminum Laptop Stand',
    aiRecommendation: 'Blocked by Policy Agent. Requested discount (30%) exceeds 15% ceiling.',
    expectedRevenue: 2200,
    confidence: 96,
    opportunityScore: 50,
    status: 'blocked_by_policy',
    createdAt: '2 hours ago',
    createdByAgent: 'POLICY',
    reviewedByAgent: 'POLICY',
    executedByAgent: 'COMMERCE',
    reasoning: {
      observation: 'Automated discount coupon injection requested 30% reduction on workstation accessory.',
      signal: 'High price sensitivity exceeding merchant profitability thresholds.',
      productRelationship: 'Hardware accessory has strict 20% minimum gross margin floor.',
      action: 'Policy Agent halted autonomous discount dispatch.',
      expectedImpact: 'Saved merchant from ₹660 margin erosion.',
      policyCheck: {
        passed: false,
        ruleName: 'MAX_DISCOUNT_CEILING_EXCEEDED',
        details: 'Discount 30% exceeds hard merchant limit of 15%. Action BLOCKED.',
        maxDiscountAllowed: 15,
        appliedDiscount: 30,
        requiresHumanApproval: true,
        riskScore: 'HIGH'
      },
      toolUsed: 'PolicyGuard'
    }
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_201',
    title: 'Weekend Running Boost',
    subtitle: 'Target high-intent running shoe viewers before Saturday morning workouts',
    targetAudience: 'Users with 2+ running shoe views in last 7 days',
    audienceSize: 2480,
    triggerCondition: 'Repeat catalog visits + zero purchase in 7 days',
    aiRationale: 'Customers who viewed running shoes 2+ times in the last 7 days convert 2.4× higher when sent a bundle offer before the weekend.',
    recommendedAction: 'Personalized product recommendation with 1-click Razorpay Test Payment link and socks bundle.',
    projectedReach: 2480,
    expectedConversionRate: 8.4,
    projectedRevenue: 218000,
    status: 'APPROVED',
    badge: 'High Impact',
    createdAt: 'Today, 08:30 AM',
    channels: ['WhatsApp', 'Email', 'Razorpay Smart Link']
  },
  {
    id: 'camp_202',
    title: 'Cart Recovery Flash Intercept',
    subtitle: 'Instant recovery sequence for baskets > ₹3,000 abandoned within 2 hours',
    targetAudience: 'Abandoned carts in last 120 minutes',
    audienceSize: 412,
    triggerCondition: 'Cart abandoned at checkout gateway stage',
    aiRationale: 'Immediate WhatsApp payment links with pre-filled Razorpay test sessions recover up to 41% of dropped transactions within 15 minutes.',
    recommendedAction: 'Send automated recovery link with 5% limited-time incentive.',
    projectedReach: 412,
    expectedConversionRate: 22.5,
    projectedRevenue: 164000,
    status: 'APPROVED',
    badge: 'Automated',
    createdAt: 'Today, 07:15 AM',
    channels: ['WhatsApp', 'Razorpay Smart Link']
  }
];

export const INITIAL_ACTIVITY_STREAM: AgentActivityItem[] = [
  {
    id: 'act_101',
    timestamp: '2026-09-02T10:34:10Z',
    timeFormatted: '10:34',
    stage: 'RESULT',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Revenue captured via Razorpay Test Mode',
    description: 'Captured ₹7,798 (₹799 AI cross-sell uplift) for order_test_881920KaL.',
    toolUsed: 'RazorpayPaymentCapture',
    status: 'success'
  },
  {
    id: 'act_102',
    timestamp: '2026-09-02T10:33:45Z',
    timeFormatted: '10:33',
    stage: 'ACTION',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Commerce Agent created test order',
    description: 'Dispatched 1-click checkout with Velocity Runner X + Pro Dynamic Socks.',
    toolUsed: 'RazorpayOrderAPI',
    status: 'success'
  },
  {
    id: 'act_103',
    timestamp: '2026-09-02T10:33:12Z',
    timeFormatted: '10:33',
    stage: 'APPROVAL',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Merchant approved bundle offer',
    description: 'Opportunity approved by merchant for instant checkout dispatch.',
    toolUsed: 'ApprovalRouter',
    status: 'success'
  },
  {
    id: 'act_104',
    timestamp: '2026-09-02T10:32:50Z',
    timeFormatted: '10:32',
    stage: 'POLICY',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Policy Agent verified discount limits',
    description: '10% bundle discount passed merchant ceiling (max 15%). 0% margin risk.',
    toolUsed: 'PolicyGuard',
    status: 'success'
  },
  {
    id: 'act_105',
    timestamp: '2026-09-02T10:32:15Z',
    timeFormatted: '10:32',
    stage: 'RECOMMEND',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Merchandising Agent recommended bundle',
    description: 'Selected Pro Dynamic Running Socks (+₹799) with 94% vector affinity score.',
    toolUsed: 'AffinityGraphRecommender',
    status: 'info'
  },
  {
    id: 'act_106',
    timestamp: '2026-09-02T10:31:40Z',
    timeFormatted: '10:31',
    stage: 'UNDERSTAND',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Intent Agent classified HIGH_PURCHASE_INTENT',
    description: 'Evaluated 4 session page loads and cart additions with 94% confidence.',
    toolUsed: 'IntentClassifier_v2',
    status: 'info'
  },
  {
    id: 'act_107',
    timestamp: '2026-09-02T10:31:00Z',
    timeFormatted: '10:31',
    stage: 'OBSERVE',
    customerId: 'C102',
    customerName: 'Aarav Mehta',
    title: 'Supervisor Agent ingested clickstream signal',
    description: 'Detected 4x repeat visits on Velocity Runner X without checkout completion.',
    toolUsed: 'ClickstreamIntake',
    status: 'info'
  },
  {
    id: 'act_108',
    timestamp: '2026-09-02T10:29:40Z',
    timeFormatted: '10:29',
    stage: 'ACTION',
    customerId: 'C103',
    customerName: 'Priya Sharma',
    title: 'Recovery Agent generated smart payment link',
    description: 'Formulated personalized Razorpay payment link for ₹4,890 abandoned workstation cart.',
    toolUsed: 'RazorpayPaymentLinkAPI',
    status: 'success'
  },
  {
    id: 'act_109',
    timestamp: '2026-09-02T10:28:55Z',
    timeFormatted: '10:28',
    stage: 'POLICY',
    customerId: 'C103',
    customerName: 'Priya Sharma',
    title: 'Policy Agent routed for merchant review',
    description: 'Cart value ₹4,890 exceeds auto-recovery threshold. Requires 1-click confirmation.',
    toolUsed: 'PolicyGuard',
    status: 'warning'
  },
  {
    id: 'act_110',
    timestamp: '2026-09-02T10:28:10Z',
    timeFormatted: '10:28',
    stage: 'UNDERSTAND',
    customerId: 'C103',
    customerName: 'Priya Sharma',
    title: 'Intent Agent classified CHECKOUT_ABANDONMENT',
    description: 'Customer dropped at payment gateway selection 24 minutes ago.',
    toolUsed: 'IntentClassifier_v2',
    status: 'info'
  },
  {
    id: 'act_111',
    timestamp: '2026-09-02T10:25:20Z',
    timeFormatted: '10:25',
    stage: 'POLICY',
    customerId: 'C106',
    customerName: 'Vikram Sengupta',
    title: 'Policy Agent BLOCKED excessive discount',
    description: 'Requested 30% discount exceeded hard 15% merchant limit. Protected ₹660 margin.',
    toolUsed: 'PolicyGuard',
    status: 'warning'
  },
  {
    id: 'act_112',
    timestamp: '2026-09-02T10:22:00Z',
    timeFormatted: '10:22',
    stage: 'RESULT',
    customerId: 'C104',
    customerName: 'Rahul Verma',
    title: 'Revenue captured via Razorpay Test Mode',
    description: 'Captured ₹2,798 (₹799 AI cross-sell uplift) for 9H Screen Protector add-on.',
    toolUsed: 'RazorpayPaymentCapture',
    status: 'success'
  }
];

export const INITIAL_STATS: AgentStats = {
  revenueGenerated: 482640,
  revenueGrowthPercent: 18.4,
  aiAttributedRevenue: 126840,
  aiAttributedGrowthPercent: 24.7,
  opportunitiesFound: 27,
  conversionLiftPercent: 14.8,
  averageBasketUplift: 799,
  actionsToday: 42,
  successfulActions: 39,
  awaitingApprovalCount: 1,
  blockedCount: 1,
  currentTask: 'Monitoring live storefront clickstreams & cart drop-offs',
  status: 'ONLINE'
};

class AgentEngine {
  private opportunities: Opportunity[] = [...INITIAL_OPPORTUNITIES];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private campaigns: Campaign[] = [...INITIAL_CAMPAIGNS];
  private activityStream: AgentActivityItem[] = [...INITIAL_ACTIVITY_STREAM];

  public getOpportunities(): Opportunity[] {
    return [...this.opportunities];
  }

  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public getCampaigns(): Campaign[] {
    return [...this.campaigns];
  }

  public getActivityStream(): AgentActivityItem[] {
    return [...this.activityStream];
  }

  public approveOpportunity(id: string): { success: boolean; opportunity?: Opportunity } {
    const opp = this.opportunities.find(o => o.id === id);
    if (!opp) return { success: false };

    opp.status = 'executed';

    // Record Activity
    const newActivity: AgentActivityItem = {
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      stage: 'ACTION',
      customerId: opp.customerId,
      customerName: opp.customerName,
      title: `Executed ${opp.title} in Razorpay Test Mode`,
      description: `Dispatched approved commerce action via Razorpay Test Gateway with ₹${opp.expectedRevenue.toLocaleString('en-IN')} uplift.`,
      toolUsed: 'CommerceExecutionAgent',
      status: 'success'
    };
    this.activityStream.unshift(newActivity);

    return { success: true, opportunity: opp };
  }

  public rejectOpportunity(id: string, reason?: string): boolean {
    const opp = this.opportunities.find(o => o.id === id);
    if (!opp) return false;
    opp.status = 'rejected';
    return true;
  }

  public getStats(): AgentStats {
    return { ...INITIAL_STATS };
  }

  public approveCampaign(id: string): boolean {
    const camp = this.campaigns.find(c => c.id === id);
    if (!camp) return false;
    camp.status = 'APPROVED';
    return true;
  }

  public executeCampaign(id: string): boolean {
    const camp = this.campaigns.find(c => c.id === id);
    if (!camp) return false;
    camp.status = 'EXECUTED';
    return true;
  }
}

export const agentEngine = new AgentEngine();

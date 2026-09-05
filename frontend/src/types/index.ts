export type OpportunityType = 'upsell' | 'cross_sell' | 'basket_growth' | 'checkout_recovery' | 'campaign' | 'catalog_intelligence';
export type OpportunityStatus = 
  | 'ready' 
  | 'awaiting_approval' 
  | 'approved'
  | 'executing'
  | 'executed' 
  | 'completed' 
  | 'execution_failed'
  | 'rejected' 
  | 'blocked_by_policy';

export type AgentStage = 'OBSERVE' | 'UNDERSTAND' | 'RECOMMEND' | 'POLICY' | 'APPROVAL' | 'ACTION' | 'RESULT';

export type AgentId = 'SUPERVISOR' | 'INTENT' | 'MERCHANDISING' | 'RECOVERY' | 'POLICY' | 'COMMERCE';
export type AgentStatus = 'ONLINE' | 'IDLE' | 'BUSY' | 'ANALYZING' | 'WORKING' | 'CHECKING' | 'EXECUTING' | 'COORDINATING';

export interface MerchantProfile {
  id: string; // e.g. 'merchant_sports', 'merchant_fashion', 'merchant_tech'
  name: string; // e.g. 'UrbanKart'
  storeName: string; // e.g. 'UrbanKart Sports & Running'
  industry: string; // e.g. 'Sports & Fitness', 'Fashion & Apparel', 'Consumer Electronics'
  currency: string; // e.g. 'INR'
  currencySymbol: string; // e.g. '₹'
  logoInitial: string; // e.g. 'U'
  tagline: string; // e.g. 'High-performance footwear & athletic gear'
  policy: MerchantPolicy;
  stats: AgentStats;
  createdAt: string;
}

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string;
  actionsCompleted: number;
  successRate: number; // percentage
  averageConfidence: number; // percentage
  lastActivity: string;
  tools: string[];
  recentDecisions: {
    title: string;
    reason: string;
    timestamp: string;
  }[];
  recentEvents: {
    event: string;
    details: string;
    time: string;
  }[];
}

export type IntentCategory = 
  | 'HIGH_PURCHASE_INTENT'
  | 'HIGH_RECOVERY_INTENT'
  | 'CART_ABANDONMENT'
  | 'REPEAT_BUYER'
  | 'PRICE_SENSITIVE'
  | 'CROSS_SELL_READY'
  | 'LOW_INTENT'
  | 'PAYMENT_FAILURE';

export interface IntentResult {
  customer: string;
  customerId: string;
  intent: IntentCategory;
  confidence: number;
  evidence: string[];
  nextAgent: 'MERCHANDISING' | 'RECOVERY' | 'SUPERVISOR';
  analyzedAt: string;
}

export interface MerchandisingResult {
  type: 'UPSELL' | 'CROSS_SELL' | 'BUNDLE';
  targetProductId?: string;
  targetProductName?: string;
  recommendedProductId: string;
  recommendedProductName: string;
  price: number;
  expectedRevenue: number;
  confidence: number;
  reasoning: string[];
  affinityScore: number;
}

export interface RecoveryResult {
  actionType: 'PAYMENT_RETRY' | 'PAYMENT_LINK' | 'REMINDER' | 'RECOVERY_INCENTIVE' | 'HUMAN_ESCALATION';
  cartValue: number;
  expectedRecovery: number;
  confidence: number;
  abandonedDuration: string;
  reasoning: string;
  recoveryIncentivePct?: number;
}

export interface PolicyResult {
  decision: 'AUTO_APPROVE' | 'APPROVAL_REQUIRED' | 'BLOCKED';
  reasons: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  maxDiscountAllowed: number;
  appliedDiscount: number;
  ruleTriggered: string;
}

export interface ExecutionResult {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'ORDER_CREATED' | 'PAYMENT_CAPTURED' | 'LINK_DISPATCHED' | 'FAILED';
  amount: number;
  aiAttributedRevenue: number;
  paymentMethod?: 'UPI' | 'Card' | 'Netbanking';
  executedAt: string;
}

export interface AgentTask {
  taskId: string;
  merchantId?: string;
  customerId: string;
  customerName: string;
  goal: string;
  context: Record<string, any>;
  currentAgent: AgentId;
  intentResult?: IntentResult;
  merchandisingResult?: MerchandisingResult;
  recoveryResult?: RecoveryResult;
  policyResult?: PolicyResult;
  approvalResult?: {
    approved: boolean;
    approvedBy: 'AUTONOMOUS' | 'MERCHANT';
    timestamp: string;
  };
  executionResult?: ExecutionResult;
  revenueResult?: {
    baseAmount: number;
    aiAttributedUplift: number;
    totalAmount: number;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'AWAITING_APPROVAL' | 'COMPLETED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationEvent {
  id: string;
  merchantId?: string;
  timestamp: string;
  timeFormatted: string;
  agent: AgentId;
  agentName: string;
  action: string;
  message: string;
  taskId: string;
  status: 'info' | 'success' | 'warning' | 'pending' | 'blocked';
  payload?: Record<string, any>;
}

export interface Product {
  id: string;
  merchantId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  availability: boolean;
  stockCount: number;
  stock?: number;
  category: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  margin?: number; // e.g. 42%
  status?: 'Active' | 'Archived' | 'Draft';
  image: string;
  aiSummary: string;
  features: string[];
  aiBuyerTags: string[];
  suitableFor: string[];
  compatibleProducts?: string[];
  crossSellAffinity: {
    productId: string;
    productName: string;
    affinityScore: number;
    price: number;
    reason: string;
  }[];
  priceElasticityScore: number; // 0-1
  purchaseEligibility: string;
  jsonLdSchema: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerMetrics {
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  lastPurchaseAt: string | null;
}

export interface CustomerPurchaseRecord {
  orderId: string;
  amount: number;
  items: string[];
  timestamp: string;
  aiRevenue?: number;
}

export interface CustomerCartAddRecord {
  productId: string;
  productName?: string;
  price: number;
  timestamp: string;
  source?: string;
}

export interface CustomerBehavior {
  viewedTimes?: number;
  lastViewedProduct?: string;
  cartValue: number;
  cartItems: string[];
  daysActive?: number;
  hasPurchased: boolean;
  intentScore: number; // 0 - 100
  abandonedAt?: string;
  preferredCategories?: string[];
  viewedProducts?: string[];
  searchQueries?: string[];
  cartAdds?: CustomerCartAddRecord[];
  abandonedCarts?: { items: string[]; amount: number; timestamp: string }[];
  purchases?: CustomerPurchaseRecord[];
}

export type ShoppingEventType = 
  | 'PRODUCT_VIEW'
  | 'PRODUCT_VIEWED'
  | 'PRODUCT_SEARCH'
  | 'SEARCH_PERFORMED'
  | 'ADD_TO_CART'
  | 'PRODUCT_ADDED_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'AI_RECOMMENDATION_SHOWN'
  | 'AI_RECOMMENDATION_ACCEPTED'
  | 'AI_UPSELL_SHOWN'
  | 'AI_UPSELL_ACCEPTED'
  | 'AI_CROSS_SELL_SHOWN'
  | 'AI_CROSS_SELL_ACCEPTED'
  | 'CHECKOUT_STARTED'
  | 'PURCHASE_COMPLETED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'CART_ABANDONED';

export interface ShoppingEvent {
  id: string;
  type: ShoppingEventType;
  customerId?: string;
  customerName?: string;
  merchantId: string;
  timestamp: string;
  productId?: string;
  productName?: string;
  amount?: number;
  source?: string;
  agent?: AgentId;
  metadata?: Record<string, any>;
}

export interface Customer {
  id: string;
  merchantId?: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  createdAt?: string;
  lifetimeValue: number;
  behavior: CustomerBehavior;
  metrics?: CustomerMetrics;
  status: 'active' | 'at_risk' | 'high_intent' | 'lapsed';
  avatarColor: string;
  currentIntent?: string;
  nextBestAction?: string;
}

export interface PolicyCheckResult {
  passed: boolean;
  ruleName: string;
  details: string;
  maxDiscountAllowed: number;
  appliedDiscount: number;
  requiresHumanApproval: boolean;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Opportunity {
  id: string;
  merchantId?: string;
  type: OpportunityType;
  title: string;
  customerId: string;
  customerName: string;
  customerBehavior: string;
  productTarget?: string;
  aiRecommendation: string;
  recommendedItem?: {
    id: string;
    name: string;
    price: number;
    discountedPrice?: number;
  };
  expectedRevenue: number;
  confidence: number; // 0 - 100
  opportunityScore: number; // 0 - 100
  status: OpportunityStatus;
  createdAt: string;
  createdByAgent: AgentId;
  reviewedByAgent: AgentId;
  executedByAgent: AgentId;
  executedAt?: string;
  executionDetails?: string;
  transactionId?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  // Deep explainability fields
  reasoning?: {
    observation?: string;
    signal?: string;
    productRelationship?: string;
    action?: string;
    expectedImpact?: string;
    policyCheck?: PolicyCheckResult;
    toolUsed?: string;
    [key: string]: any;
  };
}

export interface Campaign {
  id: string;
  merchantId?: string;
  title: string;
  subtitle: string;
  targetAudience: string;
  audienceSize: number;
  triggerCondition: string;
  aiRationale: string;
  recommendedAction: string;
  projectedReach: number;
  expectedConversionRate: number; // percentage
  projectedRevenue: number;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'EXECUTED';
  badge: string;
  createdAt: string;
  executedAt?: string;
  channels: ('WhatsApp' | 'Email' | 'Razorpay Smart Link' | 'Push Notification')[];
}

export interface AgentActivityItem {
  id: string;
  merchantId?: string;
  timestamp: string;
  timeFormatted: string;
  stage: AgentStage;
  agent?: AgentId;
  agentId?: AgentId | string;
  agentName?: string;
  customerId?: string;
  customerName?: string;
  customer?: string;
  opportunityId?: string;
  title: string;
  description: string;
  toolUsed: string;
  policyStatus?: 'ALLOWED' | 'FLAGGED' | 'BLOCKED';
  policyDetails?: string;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'info' | 'pending';
}

export interface Transaction {
  id: string;
  merchantId?: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  customerId: string;
  customerName: string;
  baseProduct: string;
  baseAmount: number;
  aiAddonProduct?: string;
  aiAddonAmount?: number;
  totalAmount: number;
  aiAttribution: 'AI Cross-sell' | 'AI Upsell' | 'AI Checkout Recovery' | 'Direct';
  aiAttributedRevenue: number;
  status: 'SUCCESS' | 'PENDING' | 'REFUNDED';
  timestamp: string;
  paymentMethod: 'UPI' | 'Card' | 'Netbanking';
}

export interface AuditLog {
  id: string;
  merchantId?: string;
  timestamp: string;
  event: AgentStage | string;
  agent?: AgentId;
  agentId?: AgentId | string;
  agentName?: string;
  customerId?: string;
  customerName?: string;
  customer?: string;
  opportunityId?: string;
  agentDecision: string;
  toolUsed: string;
  policyStatus?: 'ALLOWED' | 'FLAGGED' | 'BLOCKED';
  policyDetails?: string;
  policy?: string;
  result?: 'SUCCESS' | 'AWAITING_APPROVAL' | 'REJECTED' | 'EXECUTED' | 'BLOCKED' | 'RETRY_AVAILABLE' | string;
  signatureHash: string;
  payloadDiff?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface MerchantPolicy {
  merchantId?: string;
  maxDiscountPercent: number; // e.g., 15%
  requireApprovalAboveAmount: number; // e.g., 5000
  minConfidenceForAutonomousAction: number; // e.g., 90
  allowAutonomousCheckoutRecovery: boolean;
  allowAutonomousCrossSell: boolean;
  razorpayKeyId: string;
  webhookSecret: string;
  testModeActive: boolean;
}

export interface AgentStats {
  revenueGenerated: number;
  revenueGrowthPercent: number;
  aiAttributedRevenue: number;
  aiAttributedGrowthPercent: number;
  opportunitiesFound: number;
  conversionLiftPercent: number;
  averageBasketUplift: number;
  actionsToday: number;
  successfulActions: number;
  awaitingApprovalCount: number;
  blockedCount: number;
  currentTask: string;
  status: 'ONLINE' | 'ANALYZING' | 'EXECUTING';
}

export interface CartItem {
  product: Product;
  quantity: number;
  isAiRecommended?: boolean;
}

export type AuthRole = 'customer' | 'admin' | null;

export type ActiveScreen = 
  | 'overview' 
  | 'agents'
  | 'opportunities' 
  | 'catalog' 
  | 'conversational'
  | 'orders'
  | 'customers' 
  | 'campaigns' 
  | 'agent_activity' 
  | 'transactions' 
  | 'audit_trail' 
  | 'settings';


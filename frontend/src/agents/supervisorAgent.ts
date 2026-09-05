import {
  AgentId,
  AgentInfo,
  AgentTask,
  CollaborationEvent,
  Customer,
  Product,
  Opportunity
} from '../types';
import { intentAgent } from './intentAgent';
import { merchandisingAgent } from './merchandisingAgent';
import { recoveryAgent } from './recoveryAgent';
import { policyAgent } from './policyAgent';
import { commerceAgent } from './commerceAgent';
import { auditService } from '../services/auditService';

export const INITIAL_AGENTS_INFO: AgentInfo[] = [
  {
    id: 'SUPERVISOR',
    name: 'Growth Supervisor Agent',
    role: 'Central coordinator directing task routing, state management, and multi-agent lifecycle',
    status: 'ONLINE',
    currentTask: 'Coordinating 5 specialist agents across active store traffic',
    actionsCompleted: 142,
    successRate: 98,
    averageConfidence: 96,
    lastActivity: 'Just now',
    tools: ['TaskRouter', 'AgentStateOrchestrator', 'ApprovalGateManager', 'TelemetryAggregator'],
    recentDecisions: [
      {
        title: 'Routed Aarav session to Merchandising Agent',
        reason: 'Intent Agent classified intent as HIGH_PURCHASE_INTENT (94%)',
        timestamp: '4 mins ago'
      },
      {
        title: 'Routed Priya session to Revenue Recovery Agent',
        reason: 'Intent Agent classified intent as CART_ABANDONMENT (91%)',
        timestamp: '18 mins ago'
      }
    ],
    recentEvents: [
      { event: 'TASK_COMPLETED', details: 'Aarav cross-sell task finished with +₹799 uplift', time: '4m ago' },
      { event: 'APPROVAL_REQUESTED', details: 'Priya cart recovery submitted to Merchant Gate', time: '18m ago' }
    ]
  },
  {
    id: 'INTENT',
    name: 'Customer Intent Agent',
    role: 'Analyzes real-time customer behavior, session depth, and classifies purchase intent',
    status: 'ONLINE',
    currentTask: 'Monitoring live page visits and checkout abandonment signals',
    actionsCompleted: 1284,
    successRate: 96,
    averageConfidence: 94,
    lastActivity: '1 min ago',
    tools: ['SessionSignalDetector', 'IntentAffinityClassifier', 'CartAbandonmentAnalyzer', 'BehavioralHistoryGraph'],
    recentDecisions: [
      {
        title: 'Aarav Mehta → HIGH_PURCHASE_INTENT (94%)',
        reason: '4 repeat visits on Velocity Runner X + cart addition in 24h',
        timestamp: '4 mins ago'
      },
      {
        title: 'Priya Sharma → CART_ABANDONMENT (91%)',
        reason: '₹4,890 cart dropped at checkout gateway 18 minutes ago',
        timestamp: '18 mins ago'
      }
    ],
    recentEvents: [
      { event: 'INTENT_DETECTED', details: 'Aarav categorized as HIGH_PURCHASE_INTENT', time: '4m ago' },
      { event: 'INTENT_DETECTED', details: 'Priya categorized as CART_ABANDONMENT', time: '18m ago' }
    ]
  },
  {
    id: 'MERCHANDISING',
    name: 'Merchandising Agent',
    role: 'Maximizes average basket value via catalog affinities, cross-sells, and bundles',
    status: 'ONLINE',
    currentTask: 'Evaluating product graph cross-sell affinities for active footwear carts',
    actionsCompleted: 890,
    successRate: 94,
    averageConfidence: 92,
    lastActivity: '3 mins ago',
    tools: ['CatalogSearchEngine', 'ProductAffinityGraph', 'BundleOptimizer', 'DynamicPriceRules'],
    recentDecisions: [
      {
        title: 'Recommended Pro Dynamic Running Socks for Aarav',
        reason: '78% co-purchase affinity with Velocity Runner X (+₹799)',
        timestamp: '4 mins ago'
      },
      {
        title: 'Recommended 9H DiamondEdge Screen Protector for Rahul',
        reason: '92% affinity with MagShield Phone Case (+₹799)',
        timestamp: '32 mins ago'
      }
    ],
    recentEvents: [
      { event: 'OPPORTUNITY_CREATED', details: 'Cross-sell bundle formed for Velocity Runner X', time: '4m ago' },
      { event: 'OPPORTUNITY_CREATED', details: 'Screen protector add-on paired with phone case', time: '32m ago' }
    ]
  },
  {
    id: 'RECOVERY',
    name: 'Revenue Recovery Agent',
    role: 'Recovers lost or dropped revenue via personalized payment links and recovery sequences',
    status: 'ONLINE',
    currentTask: 'Intercepting abandoned baskets > ₹3,000 within 30-minute window',
    actionsCompleted: 312,
    successRate: 91,
    averageConfidence: 91,
    lastActivity: '12 mins ago',
    tools: ['CheckoutSessionTracker', 'PaymentFailureDiagnoser', 'RazorpaySmartLinkGenerator', 'DynamicIncentiveCalculator'],
    recentDecisions: [
      {
        title: 'Generated recovery action for Priya (₹4,890)',
        reason: 'High-value laptop stand basket abandoned. 5% limited-time link recommended.',
        timestamp: '18 mins ago'
      }
    ],
    recentEvents: [
      { event: 'RECOVERY_ANALYZING', details: 'Synthesized smart payment link for cart recovery', time: '18m ago' }
    ]
  },
  {
    id: 'POLICY',
    name: 'Policy & Risk Agent',
    role: 'Enforces hard merchant guardrails, discount caps (15%), and human approval gates',
    status: 'ONLINE',
    currentTask: 'Verifying margin compliance and high-value transaction gates',
    actionsCompleted: 1420,
    successRate: 100,
    averageConfidence: 99,
    lastActivity: '2 mins ago',
    tools: ['DiscountCeilingGuard', 'MarginProtectionEngine', 'HumanApprovalGateway', 'RateLimitingValidator'],
    recentDecisions: [
      {
        title: 'FLAGGED: Priya Recovery Order (₹4,890) → APPROVAL_REQUIRED',
        reason: 'Exceeds autonomous approval threshold of ₹4,000. Routed to merchant.',
        timestamp: '18 mins ago'
      },
      {
        title: 'AUTO_APPROVE: Aarav Cross-sell (₹799)',
        reason: 'Safe value within discount cap (10% <= 15%) and high confidence.',
        timestamp: '4 mins ago'
      }
    ],
    recentEvents: [
      { event: 'POLICY_APPROVED', details: 'Aarav bundle passed margin safety checks', time: '4m ago' },
      { event: 'HUMAN_APPROVAL_REQUIRED', details: 'Priya recovery halted for merchant sign-off', time: '18m ago' }
    ]
  },
  {
    id: 'COMMERCE',
    name: 'Commerce Execution Agent',
    role: 'Executes approved actions in Razorpay TEST MODE and verifies transaction settlement',
    status: 'ONLINE',
    currentTask: 'Processing test payment tokens and dispatching webhook events',
    actionsCompleted: 642,
    successRate: 99,
    averageConfidence: 98,
    lastActivity: '4 mins ago',
    tools: ['RazorpayOrderCreator', 'PaymentGatewaySimulator', 'SmartLinkDispatcher', 'RevenueLedgerRecorder', 'WebhookEmitter'],
    recentDecisions: [
      {
        title: 'Captured payment pay_test_9921Ka9124L (₹7,798)',
        reason: 'Aarav test checkout completed with ₹799 AI-attributed uplift',
        timestamp: '4 mins ago'
      }
    ],
    recentEvents: [
      { event: 'ORDER_CREATED', details: 'Created test order order_test_881920KaL', time: '4m ago' },
      { event: 'PAYMENT_SUCCESS', details: 'Captured test payment in Razorpay Sandbox', time: '4m ago' }
    ]
  }
];

export const INITIAL_COLLABORATION_EVENTS: CollaborationEvent[] = [
  {
    id: 'evt_1',
    timestamp: '2026-09-01T09:42:18.102Z',
    timeFormatted: '09:42:18',
    agent: 'INTENT',
    agentName: 'Customer Intent Agent',
    action: 'INTENT_DETECTED',
    message: 'Analyzed Aarav Mehta session: 4 page visits on Velocity Runner X. Classified as HIGH_PURCHASE_INTENT (94%).',
    taskId: 'task_aarav_01',
    status: 'info'
  },
  {
    id: 'evt_2',
    timestamp: '2026-09-01T09:42:19.420Z',
    timeFormatted: '09:42:19',
    agent: 'SUPERVISOR',
    agentName: 'Growth Supervisor Agent',
    action: 'SUPERVISOR_ROUTING',
    message: 'Received high purchase intent. Routing task to Merchandising Agent for cross-sell packaging.',
    taskId: 'task_aarav_01',
    status: 'info'
  },
  {
    id: 'evt_3',
    timestamp: '2026-09-01T09:42:20.089Z',
    agent: 'MERCHANDISING',
    agentName: 'Merchandising Agent',
    action: 'OPPORTUNITY_CREATED',
    message: 'Formulated cross-sell recommendation: Pro Dynamic Running Socks (+₹799) with 91% affinity.',
    taskId: 'task_aarav_01',
    status: 'info',
    timeFormatted: '09:42:20'
  },
  {
    id: 'evt_4',
    timestamp: '2026-09-01T09:42:21.310Z',
    agent: 'POLICY',
    agentName: 'Policy & Risk Agent',
    action: 'POLICY_APPROVED',
    message: 'Policy check passed. Total basket ₹7,798 flagged for standard merchant verification.',
    taskId: 'task_aarav_01',
    status: 'warning',
    timeFormatted: '09:42:21'
  },
  {
    id: 'evt_5',
    timestamp: '2026-09-01T09:43:10.005Z',
    agent: 'SUPERVISOR',
    agentName: 'Growth Supervisor Agent',
    action: 'HUMAN_APPROVED',
    message: 'Merchant UrbanKart approved bundle recommendation. Dispatching to Commerce Agent.',
    taskId: 'task_aarav_01',
    status: 'success',
    timeFormatted: '09:43:10'
  },
  {
    id: 'evt_6',
    timestamp: '2026-09-01T09:43:12.441Z',
    agent: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    action: 'ORDER_CREATED',
    message: 'Generated Razorpay Test Mode Order order_test_881920KaL. Awaiting test payment capture.',
    taskId: 'task_aarav_01',
    status: 'info',
    timeFormatted: '09:43:12'
  },
  {
    id: 'evt_7',
    timestamp: '2026-09-01T09:43:15.912Z',
    agent: 'COMMERCE',
    agentName: 'Commerce Execution Agent',
    action: 'PAYMENT_SUCCESS',
    message: 'Captured payment pay_test_9921Ka9124L (₹7,798). AI attributed uplift: ₹799 verified.',
    taskId: 'task_aarav_01',
    status: 'success',
    timeFormatted: '09:43:15'
  },
  {
    id: 'evt_8',
    timestamp: '2026-09-01T09:43:16.200Z',
    agent: 'SUPERVISOR',
    agentName: 'Growth Supervisor Agent',
    action: 'TASK_COMPLETED',
    message: 'Multi-agent commerce workflow successfully closed. Ledger and audit trail updated.',
    taskId: 'task_aarav_01',
    status: 'success',
    timeFormatted: '09:43:16'
  }
];

export class GrowthSupervisorAgent {
  public readonly id = 'SUPERVISOR' as const;
  public readonly name = 'Growth Supervisor Agent';
  public readonly role = 'Coordinating 6 specialist agents';

  private agents: AgentInfo[] = [...INITIAL_AGENTS_INFO];
  private events: CollaborationEvent[] = [...INITIAL_COLLABORATION_EVENTS];
  private tasks: AgentTask[] = [];

  public getAgents(): AgentInfo[] {
    return [...this.agents];
  }

  public getEvents(): CollaborationEvent[] {
    return [...this.events];
  }

  public getTasks(): AgentTask[] {
    return [...this.tasks];
  }

  public logEvent(event: Omit<CollaborationEvent, 'id' | 'timestamp' | 'timeFormatted'>): CollaborationEvent {
    const timestamp = new Date().toISOString();
    const timeFormatted = new Date().toTimeString().substring(0, 8);
    const newEvt: CollaborationEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp,
      timeFormatted,
      ...event
    };

    this.events.unshift(newEvt);

    // Also write to audit trail service
    auditService.addLog({
      event: event.action.includes('POLICY') ? 'POLICY' : event.action.includes('ORDER') || event.action.includes('PAYMENT') ? 'ACTION' : event.action.includes('COMPLETED') || event.action.includes('SUCCESS') ? 'RESULT' : 'OBSERVE',
      agent: event.agent,
      agentName: event.agentName,
      customerId: event.taskId,
      customerName: event.agentName,
      agentDecision: `[${event.agent}] ${event.action}: ${event.message}`,
      toolUsed: `${event.agentName}_Core`,
      policyStatus: event.status === 'blocked' ? 'BLOCKED' : event.status === 'warning' ? 'FLAGGED' : 'ALLOWED',
      policyDetails: `Coordinated by Growth Supervisor on task #${event.taskId}`,
      result: event.status === 'success' ? 'SUCCESS' : event.status === 'blocked' ? 'REJECTED' : 'EXECUTED'
    });

    return newEvt;
  }

  /**
   * Complete End-to-End Orchestration Workflow for a Customer Signal
   */
  public executeCustomerWorkflow(customer: Customer, currentProduct?: Product): AgentTask {
    const taskId = `task_${customer.id.toLowerCase()}_${Date.now()}`;
    const timeStr = new Date().toTimeString().substring(0, 8);

    // 1. Create Task
    const task: AgentTask = {
      taskId,
      customerId: customer.id,
      customerName: customer.name,
      goal: `Turn ${customer.name}'s session into a policy-compliant revenue opportunity`,
      context: { customer, currentProduct },
      currentAgent: 'SUPERVISOR',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.logEvent({
      agent: 'SUPERVISOR',
      agentName: 'Growth Supervisor Agent',
      action: 'TASK_CREATED',
      message: `Initialized growth task for ${customer.name}. Routing to Customer Intent Agent.`,
      taskId,
      status: 'info'
    });

    // 2. Intent Analysis
    task.currentAgent = 'INTENT';
    const intentResult = intentAgent.analyze(customer);
    task.intentResult = intentResult;

    this.logEvent({
      agent: 'INTENT',
      agentName: 'Customer Intent Agent',
      action: 'INTENT_DETECTED',
      message: `Identified ${intentResult.intent} (Confidence: ${Math.round(intentResult.confidence * 100)}%). Evidence: ${intentResult.evidence[0]}`,
      taskId,
      status: 'info'
    });

    // 3. Supervisor Routes to Specialist
    task.currentAgent = 'SUPERVISOR';
    if (intentResult.nextAgent === 'RECOVERY') {
      this.logEvent({
        agent: 'SUPERVISOR',
        agentName: 'Growth Supervisor Agent',
        action: 'SUPERVISOR_ROUTING',
        message: `Cart abandonment detected. Routing to Revenue Recovery Agent.`,
        taskId,
        status: 'info'
      });

      task.currentAgent = 'RECOVERY';
      const recoveryResult = recoveryAgent.decide(customer);
      task.recoveryResult = recoveryResult;

      this.logEvent({
        agent: 'RECOVERY',
        agentName: 'Revenue Recovery Agent',
        action: 'RECOVERY_ANALYZING',
        message: `Formulated recovery action: ${recoveryResult.actionType}. Expected recovery: ₹${recoveryResult.expectedRecovery.toLocaleString('en-IN')}.`,
        taskId,
        status: 'info'
      });

      // 4. Policy Check
      task.currentAgent = 'POLICY';
      const policyResult = policyAgent.evaluate({
        actionType: recoveryResult.actionType,
        expectedAmount: recoveryResult.expectedRecovery,
        discountPercent: recoveryResult.recoveryIncentivePct || 0,
        confidence: recoveryResult.confidence
      });
      task.policyResult = policyResult;

      this.logEvent({
        agent: 'POLICY',
        agentName: 'Policy & Risk Agent',
        action: policyResult.decision === 'AUTO_APPROVE' ? 'POLICY_APPROVED' : policyResult.decision === 'BLOCKED' ? 'POLICY_BLOCKED' : 'HUMAN_APPROVAL_REQUIRED',
        message: `Policy evaluation: ${policyResult.decision}. ${policyResult.reasons[0]}`,
        taskId,
        status: policyResult.decision === 'BLOCKED' ? 'blocked' : policyResult.decision === 'APPROVAL_REQUIRED' ? 'warning' : 'success'
      });

      if (policyResult.decision === 'APPROVAL_REQUIRED') {
        task.status = 'AWAITING_APPROVAL';
      }
    } else {
      this.logEvent({
        agent: 'SUPERVISOR',
        agentName: 'Growth Supervisor Agent',
        action: 'SUPERVISOR_ROUTING',
        message: `High purchase intent detected. Routing to Merchandising Agent for cross-sell packaging.`,
        taskId,
        status: 'info'
      });

      task.currentAgent = 'MERCHANDISING';
      const merchResult = merchandisingAgent.decide({ customer, currentProduct });
      task.merchandisingResult = merchResult;

      this.logEvent({
        agent: 'MERCHANDISING',
        agentName: 'Merchandising Agent',
        action: 'OPPORTUNITY_CREATED',
        message: `Formulated ${merchResult.type}: Recommended ${merchResult.recommendedProductName} (+₹${merchResult.expectedRevenue}).`,
        taskId,
        status: 'info'
      });

      // 4. Policy Check
      task.currentAgent = 'POLICY';
      const policyResult = policyAgent.evaluate({
        actionType: merchResult.type,
        expectedAmount: (currentProduct?.price || 6999) + merchResult.expectedRevenue,
        discountPercent: 10,
        confidence: merchResult.confidence
      });
      task.policyResult = policyResult;

      this.logEvent({
        agent: 'POLICY',
        agentName: 'Policy & Risk Agent',
        action: policyResult.decision === 'AUTO_APPROVE' ? 'POLICY_APPROVED' : policyResult.decision === 'BLOCKED' ? 'POLICY_BLOCKED' : 'HUMAN_APPROVAL_REQUIRED',
        message: `Policy evaluation: ${policyResult.decision}. ${policyResult.reasons[0]}`,
        taskId,
        status: policyResult.decision === 'BLOCKED' ? 'blocked' : policyResult.decision === 'APPROVAL_REQUIRED' ? 'warning' : 'success'
      });

      if (policyResult.decision === 'APPROVAL_REQUIRED') {
        task.status = 'AWAITING_APPROVAL';
      }
    }

    this.tasks.unshift(task);
    return task;
  }
}

export const supervisorAgent = new GrowthSupervisorAgent();

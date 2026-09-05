import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  ActiveScreen,
  AuthRole,
  Opportunity,
  Product,
  Campaign,
  Transaction,
  AuditLog,
  AgentActivityItem,
  AgentStage,
  AgentStats,
  MerchantPolicy,
  Customer,
  ShoppingEvent,
  ShoppingEventType,
  AgentInfo,
  CollaborationEvent,
  AgentTask,
  AgentId,
  MerchantProfile
} from '../types';
import {
  INITIAL_MERCHANTS,
  INITIAL_MERCHANT_PRODUCTS,
  INITIAL_MERCHANT_CUSTOMERS,
  INITIAL_MERCHANT_OPPORTUNITIES,
  INITIAL_MERCHANT_TRANSACTIONS,
  INITIAL_MERCHANT_ACTIVITY,
  INITIAL_MERCHANT_AUDIT
} from '../services/merchantData';
import {
  INITIAL_AGENTS_INFO,
  INITIAL_COLLABORATION_EVENTS
} from '../agents/supervisorAgent';
import { policyEngine } from '../services/policyEngine';
import confetti from 'canvas-confetti';

export interface MultiAgentSimulationStep {
  step: number;
  customerName: string;
  category: string;
  actingAgent: AgentId;
  actionSummary: string;
  policyResult: 'AUTO_APPROVE' | 'APPROVAL_REQUIRED' | 'BLOCKED';
  revenueImpact: number;
  confidence: number;
  isOpportunityCreated: boolean;
}

export interface CanonicalAgentEvent {
  merchantId?: string;
  timestamp?: string;
  agent: AgentId;
  agentName?: string;
  stage?: AgentStage;
  event?: string;
  title: string;
  description?: string;
  customerId?: string;
  customerName?: string;
  customer?: string;
  opportunityId?: string;
  toolUsed?: string;
  policyStatus?: 'ALLOWED' | 'FLAGGED' | 'BLOCKED';
  policyDetails?: string;
  policy?: string;
  result?: 'SUCCESS' | 'AWAITING_APPROVAL' | 'REJECTED' | 'EXECUTED' | 'BLOCKED' | string;
  metadata?: Record<string, any>;
  status?: 'success' | 'warning' | 'info' | 'pending';
}

export interface AppContextType {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;

  // Authentication & Role Session
  authRole: AuthRole;
  isAuthenticated: boolean;
  loginAsCustomer: (merchantId: string, customerData?: Customer | null) => void;
  loginAsAdmin: (merchantId: string, username?: string) => void;
  logout: () => void;
  openStorefront: () => void;
  openOrders: () => void;
  exitStorefront: () => void;
  previousAdminScreen: ActiveScreen;

  // Merchant Management
  merchants: MerchantProfile[];
  activeMerchantId: string;
  activeMerchant: MerchantProfile;
  setActiveMerchantId: (id: string) => void;
  createMerchant: (params: {
    name: string;
    storeName: string;
    industry: string;
    currency: string;
    currencySymbol?: string;
    tagline?: string;
    maxDiscountPercent?: number;
    requireApprovalAboveAmount?: number;
  }) => MerchantProfile;
  updateMerchantPolicy: (policyUpdates: Partial<MerchantPolicy>) => void;

  // Active Merchant Scoped Data
  products: Product[];
  customers: Customer[];
  allCustomers: Record<string, Customer[]>;
  opportunities: Opportunity[];
  campaigns: Campaign[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  activityStream: AgentActivityItem[];
  agentStats: AgentStats;
  policy: MerchantPolicy;
  recordCanonicalEvent: (event: CanonicalAgentEvent) => { activityItem: AgentActivityItem; auditLog: AuditLog };

  // Customer Identity & Storefront Auth Session
  currentCustomer: Customer | null;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  customerAuthMode: 'signin' | 'signup';
  setCustomerAuthMode: (mode: 'signin' | 'signup') => void;
  openCustomerAuth: (mode?: 'signin' | 'signup') => void;
  closeCustomerAuth: () => void;
  signUpCustomer: (params: { name: string; email: string; phone?: string; merchantId?: string }) => Customer;
  signInCustomer: (params: { email: string; merchantId?: string }) => Customer | null;
  signOutCustomer: () => void;
  recordCustomerShoppingEvent: (event: Omit<ShoppingEvent, 'id' | 'timestamp'>) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;

  // Product Catalog Management
  addProduct: (productData: Partial<Product>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  importProductsCsv: (csvContent: string) => { importedCount: number; skippedCount: number; errors: string[] };

  // Multi-Agent Architecture
  agents: AgentInfo[];
  collaborationEvents: CollaborationEvent[];
  tasks: AgentTask[];
  selectedAgentForDetail: AgentInfo | null;
  openAgentDetailDrawer: (agent: AgentInfo) => void;
  isAgentDetailDrawerOpen: boolean;
  setIsAgentDetailDrawerOpen: (open: boolean) => void;
  openAgentTraceModal: () => void;
  isAgentTraceModalOpen: boolean;
  setIsAgentTraceModalOpen: (open: boolean) => void;

  // Decision & Reasoning Modal
  selectedOpportunity: Opportunity | null;
  openReasoningDrawer: (opp: Opportunity) => void;
  isReasoningDrawerOpen: boolean;
  setIsReasoningDrawerOpen: (open: boolean) => void;
  approveOpportunity: (id: string) => void;
  rejectOpportunity: (id: string) => void;

  // Manual Customer Simulation
  selectedSimulationOpportunity: Opportunity | null;
  isCustomerSimulationOpen: boolean;
  openCustomerSimulation: (opp: Opportunity) => void;
  closeCustomerSimulation: () => void;
  simulationStageMap: Record<string, number>;
  setCustomerSimulationStage: (oppId: string, stage: number) => void;

  // Product Modals
  selectedProduct: Product | null;
  openProductProfileModal: (prod: Product) => void;
  isProductProfileModalOpen: boolean;
  setIsProductProfileModalOpen: (open: boolean) => void;
  selectedProductForEdit: Product | null;
  openProductEditModal: (prod?: Product | null) => void;
  isProductEditModalOpen: boolean;
  setIsProductEditModalOpen: (open: boolean) => void;

  // Create Merchant Modal
  isCreateMerchantModalOpen: boolean;
  setIsCreateMerchantModalOpen: (open: boolean) => void;

  // Checkout Modal
  isRazorpayModalOpen: boolean;
  setIsRazorpayModalOpen: (open: boolean) => void;
  checkoutItem: Product | null;
  recommendedAddon: Product | null;
  recoveryDetails: {
    customerName: string;
    amount: number;
    productName: string;
    opportunityId?: string;
    customerId?: string;
    isRecovery: boolean;
  } | null;
  openCheckout: (baseProduct: Product, addon?: Product) => void;
  openRecoveryCheckout: (recoveryData?: {
    customerName?: string;
    amount?: number;
    productName?: string;
    opportunityId?: string;
    customerId?: string;
  }) => void;
  completeCheckout: (paymentMethod: 'UPI' | 'Card' | 'Netbanking') => Transaction;
  completeRecoveryCheckout: (paymentMethod: 'UPI' | 'Card' | 'Netbanking') => Transaction;
  recordRecoveryPaymentFailure: (params?: {
    customerName?: string;
    amount?: number;
    reason?: string;
  }) => void;

  // Multi-Agent Simulation
  isSimulationModalOpen: boolean;
  setIsSimulationModalOpen: (open: boolean) => void;
  simulationProgress: {
    isRunning: boolean;
    currentStep: number;
    totalSteps: number;
    currentScenario: MultiAgentSimulationStep | null;
    completed: boolean;
    opportunitiesCreated: number;
    potentialRevenue: number;
    aiAttributedRevenue: number;
  };
  startBatchSimulation: () => void;
  resetSimulationState: () => void;

  // Demo Scenarios
  triggerAaravStory: () => void;
  triggerPriyaStory: () => void;
  recordLiveDemoCompletion: (params: {
    demoType: 'BASKET_GROWTH' | 'CHECKOUT_RECOVERY';
    customerName: string;
    amount: number;
    productName: string;
    addonName?: string;
    details: string;
  }) => Transaction;

  // Campaign Handlers
  approveCampaign: (id: string) => void;
  executeCampaign: (id: string) => void;
  
  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Notifications
  notifications: { id: string; title: string; time: string; type: 'info' | 'success' | 'warning' }[];
  dismissNotification: (id: string) => void;
  addNotification: (title: string, type?: 'info' | 'success' | 'warning') => void;
}

export const screenToPath = (screen: ActiveScreen, role: AuthRole): string => {
  if (role === 'customer') {
    if (screen === 'orders') return '/orders';
    return '/shop';
  }
  if (screen === 'conversational') return '/shop';
  if (screen === 'orders') return '/orders';
  switch (screen) {
    case 'overview': return '/admin/overview';
    case 'agents': return '/admin/agents';
    case 'opportunities':
    case 'campaigns': return '/admin/opportunities';
    case 'customers': return '/admin/customers';
    case 'agent_activity':
    case 'transactions': return '/admin/activity';
    case 'audit_trail': return '/admin/audit';
    case 'catalog': return '/admin/catalog';
    case 'settings': return '/admin/settings';
    default: return '/admin/overview';
  }
};

export const parsePathToState = (pathname: string): { role: AuthRole; screen: ActiveScreen; isAuth: boolean } | null => {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/orders' || clean === '/order-history') {
    return { role: 'customer', screen: 'orders', isAuth: true };
  }
  if (clean === '/shop' || clean === '/store') {
    return { role: 'customer', screen: 'conversational', isAuth: true };
  }
  if (clean === '/admin/overview' || clean === '/overview') {
    return { role: 'admin', screen: 'overview', isAuth: true };
  }
  if (clean === '/admin/agents' || clean === '/agents') {
    return { role: 'admin', screen: 'agents', isAuth: true };
  }
  if (clean === '/admin/opportunities' || clean === '/opportunities' || clean === '/admin/campaigns' || clean === '/campaigns') {
    return { role: 'admin', screen: 'opportunities', isAuth: true };
  }
  if (clean === '/admin/customers' || clean === '/customers') {
    return { role: 'admin', screen: 'customers', isAuth: true };
  }
  if (clean === '/admin/activity' || clean === '/activity' || clean === '/admin/transactions' || clean === '/transactions') {
    return { role: 'admin', screen: 'agent_activity', isAuth: true };
  }
  if (clean === '/admin/audit' || clean === '/audit' || clean === '/admin/audit_trail' || clean === '/audit_trail') {
    return { role: 'admin', screen: 'audit_trail', isAuth: true };
  }
  if (clean === '/admin/catalog' || clean === '/catalog') {
    return { role: 'admin', screen: 'catalog', isAuth: true };
  }
  if (clean === '/admin/settings' || clean === '/settings') {
    return { role: 'admin', screen: 'settings', isAuth: true };
  }
  return null;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 0. Parse Initial Session & URL
  const initialUrlState = typeof window !== 'undefined' ? parsePathToState(window.location.pathname) : null;

  // Check stored admin session
  const storedAdminSession = (() => {
    try {
      const saved = localStorage.getItem('merchantos_admin_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  // Check stored customer session
  const storedCustomerSession = (() => {
    try {
      const activeMId = localStorage.getItem('merchantos_auth_merchant_id') || 'merchant_sports';
      const saved = localStorage.getItem(`merchantos_customer_session_${activeMId}`) || localStorage.getItem(`merchantos_customer_${activeMId}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  })();

  const initialAuthRole: AuthRole = (() => {
    if (initialUrlState?.role === 'customer') {
      return storedCustomerSession ? 'customer' : null;
    }
    if (initialUrlState?.role === 'admin') {
      return storedAdminSession ? 'admin' : null;
    }
    if (storedAdminSession) return 'admin';
    return null;
  })();

  const initialIsAuth = initialAuthRole !== null;

  const initialMerchantId = (() => {
    if (storedAdminSession?.merchantId) return storedAdminSession.merchantId;
    if (storedCustomerSession?.merchantId) return storedCustomerSession.merchantId;
    try {
      const saved = localStorage.getItem('merchantos_auth_merchant_id');
      if (saved) return saved;
    } catch (e) {}
    return 'merchant_sports';
  })();

  const initialScreen: ActiveScreen = (() => {
    if (initialAuthRole === 'customer') {
      if (initialUrlState?.screen === 'orders') return 'orders';
      return 'conversational';
    }
    if (initialUrlState?.screen && initialAuthRole === 'admin') return initialUrlState.screen;
    return 'overview';
  })();

  const [authRole, setAuthRole] = useState<AuthRole>(initialAuthRole);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialIsAuth);
  const [activeMerchantId, setActiveMerchantIdState] = useState<string>(initialMerchantId);
  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>(initialScreen);
  const [previousAdminScreen, setPreviousAdminScreen] = useState<ActiveScreen>('overview');

  // Sync browser URL whenever activeScreen or authRole changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!isAuthenticated || authRole === null) {
      if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/admin/login') {
        window.history.replaceState(null, '', '/');
      }
      return;
    }

    if (authRole === 'customer') {
      const targetPath = activeScreen === 'orders' ? '/orders' : '/shop';
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      return;
    }

    if (authRole === 'admin') {
      const targetPath = screenToPath(activeScreen, 'admin');
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activeScreen, authRole, isAuthenticated]);

  // Handle browser Back / Forward popstate navigation with route guards
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const parsed = parsePathToState(window.location.pathname);
      if (parsed) {
        if (parsed.role === 'admin') {
          // Route Guard: Admin views require stored admin session
          let adminSession = null;
          try {
            const raw = localStorage.getItem('merchantos_admin_session');
            if (raw) adminSession = JSON.parse(raw);
          } catch (e) {}

          if (adminSession) {
            setAuthRole('admin');
            setIsAuthenticated(true);
            setActiveMerchantIdState(adminSession.merchantId);
            setActiveScreenState(parsed.screen);
          } else {
            // Not authenticated as Admin -> redirect to landing
            setAuthRole(null);
            setIsAuthenticated(false);
            window.history.replaceState(null, '', '/');
          }
        } else if (parsed.role === 'customer') {
          const activeMId = localStorage.getItem('merchantos_auth_merchant_id') || 'merchant_sports';
          let custSession = null;
          try {
            const raw = localStorage.getItem(`merchantos_customer_session_${activeMId}`) || localStorage.getItem(`merchantos_customer_${activeMId}`);
            if (raw) custSession = JSON.parse(raw);
          } catch (e) {}

          if (custSession) {
            setAuthRole('customer');
            setIsAuthenticated(true);
            setActiveScreenState(parsed.screen);
          } else {
            setAuthRole(null);
            setIsAuthenticated(false);
            window.history.replaceState(null, '', '/');
          }
        }
      } else {
        setIsAuthenticated(false);
        setAuthRole(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveMerchantId = (id: string) => {
    setActiveMerchantIdState(id);
    try {
      localStorage.setItem('merchantos_auth_merchant_id', id);
    } catch (e) {}
  };

  const setActiveScreen = (screen: ActiveScreen) => {
    if (authRole === 'customer') {
      // Customer route guard: customer only allowed to view Shopping ('conversational') or Orders ('orders')
      const target = screen === 'orders' ? 'orders' : 'conversational';
      setActiveScreenState(target);
      const targetPath = target === 'orders' ? '/orders' : '/shop';
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      return;
    }
    setActiveScreenState(screen);
    setPreviousAdminScreen(screen);
  };

  const openStorefront = () => {
    setAuthRole('customer');
    setIsAuthenticated(true);
    setActiveScreenState('conversational');
    if (typeof window !== 'undefined' && window.location.pathname !== '/shop') {
      window.history.pushState(null, '', '/shop');
    }
  };

  const openOrders = () => {
    setAuthRole('customer');
    setIsAuthenticated(true);
    setActiveScreenState('orders');
    if (typeof window !== 'undefined' && window.location.pathname !== '/orders') {
      window.history.pushState(null, '', '/orders');
    }
  };

  const exitStorefront = () => {
    // Return to Public Landing / Admin Login entry point without silent admin auto-login
    setAuthRole(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const loginAsCustomer = (merchantId: string, customerData?: Customer | null) => {
    setActiveMerchantIdState(merchantId);
    setAuthRole('customer');
    setIsAuthenticated(true);
    setActiveScreenState('conversational');

    if (customerData) {
      const scopedCustomer: Customer = {
        ...customerData,
        merchantId
      };

      setAllCustomers(prev => {
        const storeCusts = prev[merchantId] || [];
        const exists = storeCusts.some(c => c.id === scopedCustomer.id || c.email.toLowerCase() === scopedCustomer.email.toLowerCase());
        if (exists) {
          return {
            ...prev,
            [merchantId]: storeCusts.map(c => (c.id === scopedCustomer.id || c.email.toLowerCase() === scopedCustomer.email.toLowerCase()) ? scopedCustomer : c)
          };
        }
        return {
          ...prev,
          [merchantId]: [scopedCustomer, ...storeCusts]
        };
      });

      setCurrentCustomer(scopedCustomer);
      try {
        localStorage.setItem(`merchantos_customer_session_${merchantId}`, JSON.stringify(scopedCustomer));
        localStorage.setItem(`merchantos_customer_${merchantId}`, JSON.stringify(scopedCustomer));
        localStorage.setItem('merchantos_auth_merchant_id', merchantId);
      } catch (e) {}
    } else {
      try {
        const stored = localStorage.getItem(`merchantos_customer_session_${merchantId}`) || localStorage.getItem(`merchantos_customer_${merchantId}`);
        if (stored) {
          setCurrentCustomer(JSON.parse(stored));
        } else {
          setCurrentCustomer(null);
        }
      } catch (e) {
        setCurrentCustomer(null);
      }
    }

    if (typeof window !== 'undefined' && window.location.pathname !== '/shop') {
      window.history.pushState(null, '', '/shop');
    }
  };

  const loginAsAdmin = (merchantId: string, username?: string) => {
    const adminSession = {
      role: 'admin',
      merchantId,
      username: username || `admin@${merchantId}.demo`,
      loggedInAt: new Date().toISOString()
    };
    try {
      localStorage.setItem('merchantos_admin_session', JSON.stringify(adminSession));
      localStorage.setItem('merchantos_auth_merchant_id', merchantId);
    } catch (e) {}

    setActiveMerchantIdState(merchantId);
    setAuthRole('admin');
    setIsAuthenticated(true);
    setActiveScreenState('overview');

    if (typeof window !== 'undefined' && window.location.pathname !== '/admin/overview') {
      window.history.pushState(null, '', '/admin/overview');
    }
  };

  const logout = () => {
    setAuthRole(null);
    setIsAuthenticated(false);
    setActiveScreenState('overview');
    try {
      localStorage.removeItem('merchantos_admin_session');
      localStorage.removeItem('merchantos_auth_authenticated');
      localStorage.removeItem('merchantos_auth_role');
      localStorage.removeItem('merchantos_auth_merchant_id');
      localStorage.removeItem('merchantos_previous_admin_screen');
    } catch (e) {}
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  // 1. Multi-Merchant Store Directory State
  const [merchants, setMerchants] = useState<MerchantProfile[]>(INITIAL_MERCHANTS);

  // 2. Data Stores grouped by merchantId
  const [allProducts, setAllProducts] = useState<Record<string, Product[]>>(INITIAL_MERCHANT_PRODUCTS);
  const [allCustomers, setAllCustomers] = useState<Record<string, Customer[]>>(INITIAL_MERCHANT_CUSTOMERS);
  const [allOpportunities, setAllOpportunities] = useState<Record<string, Opportunity[]>>(INITIAL_MERCHANT_OPPORTUNITIES);
  const [allTransactions, setAllTransactions] = useState<Record<string, Transaction[]>>(INITIAL_MERCHANT_TRANSACTIONS);
  const [allActivity, setAllActivity] = useState<Record<string, AgentActivityItem[]>>(INITIAL_MERCHANT_ACTIVITY);
  const [allAudit, setAllAudit] = useState<Record<string, AuditLog[]>>(INITIAL_MERCHANT_AUDIT);

  // Active Merchant Profile
  const activeMerchant = useMemo(() => {
    return merchants.find(m => m.id === activeMerchantId) || merchants[0];
  }, [merchants, activeMerchantId]);

  // Derived Active Data (Strictly isolated by merchantId)
  const products = useMemo(() => allProducts[activeMerchantId] || [], [allProducts, activeMerchantId]);
  const customers = useMemo(() => allCustomers[activeMerchantId] || [], [allCustomers, activeMerchantId]);
  const opportunities = useMemo(() => allOpportunities[activeMerchantId] || [], [allOpportunities, activeMerchantId]);
  const transactions = useMemo(() => allTransactions[activeMerchantId] || [], [allTransactions, activeMerchantId]);
  const activityStream = useMemo(() => allActivity[activeMerchantId] || [], [allActivity, activeMerchantId]);
  const auditLogs = useMemo(() => allAudit[activeMerchantId] || [], [allAudit, activeMerchantId]);
  const policy = activeMerchant.policy;

  // Dynamically compute real stats from actual merchant data
  const agentStats: AgentStats = useMemo(() => {
    const totalRev = transactions.reduce((acc, tx) => acc + (tx.status === 'SUCCESS' ? tx.totalAmount : 0), 0);
    const aiRev = transactions.reduce((acc, tx) => acc + (tx.status === 'SUCCESS' ? tx.aiAttributedRevenue : 0), 0);
    const oppsCount = opportunities.length;
    const awaitingCount = opportunities.filter(o => o.status === 'awaiting_approval').length;
    const blockedCount = opportunities.filter(o => o.status === 'blocked_by_policy').length;

    // Use baseline from merchant stats or live calculated
    return {
      revenueGenerated: totalRev > 0 ? totalRev + activeMerchant.stats.revenueGenerated : activeMerchant.stats.revenueGenerated,
      revenueGrowthPercent: activeMerchant.stats.revenueGrowthPercent,
      aiAttributedRevenue: aiRev > 0 ? aiRev + activeMerchant.stats.aiAttributedRevenue : activeMerchant.stats.aiAttributedRevenue,
      aiAttributedGrowthPercent: activeMerchant.stats.aiAttributedGrowthPercent,
      opportunitiesFound: oppsCount > 0 ? oppsCount : activeMerchant.stats.opportunitiesFound,
      conversionLiftPercent: activeMerchant.stats.conversionLiftPercent,
      averageBasketUplift: activeMerchant.stats.averageBasketUplift,
      actionsToday: activeMerchant.stats.actionsToday,
      successfulActions: activeMerchant.stats.successfulActions,
      awaitingApprovalCount: awaitingCount,
      blockedCount: blockedCount,
      currentTask: activeMerchant.stats.currentTask,
      status: activeMerchant.stats.status
    };
  }, [transactions, opportunities, activeMerchant]);

  // Multi-Agent State
  const [agents] = useState<AgentInfo[]>(INITIAL_AGENTS_INFO);
  const [collaborationEvents] = useState<CollaborationEvent[]>(INITIAL_COLLABORATION_EVENTS);
  const [tasks] = useState<AgentTask[]>([]);
  const [selectedAgentForDetail, setSelectedAgentForDetail] = useState<AgentInfo | null>(null);
  const [isAgentDetailDrawerOpen, setIsAgentDetailDrawerOpen] = useState(false);
  const [isAgentTraceModalOpen, setIsAgentTraceModalOpen] = useState(false);

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isReasoningDrawerOpen, setIsReasoningDrawerOpen] = useState<boolean>(false);
  
  // Manual Per-Customer Simulation State
  const [selectedSimulationOpportunity, setSelectedSimulationOpportunity] = useState<Opportunity | null>(null);
  const [isCustomerSimulationOpen, setIsCustomerSimulationOpen] = useState<boolean>(false);
  const [simulationStageMap, setSimulationStageMap] = useState<Record<string, number>>({});

  const openCustomerSimulation = (opp: Opportunity) => {
    setSelectedSimulationOpportunity(opp);
    setIsCustomerSimulationOpen(true);
  };

  const closeCustomerSimulation = () => {
    setIsCustomerSimulationOpen(false);
  };

  const setCustomerSimulationStage = (oppId: string, stage: number) => {
    setSimulationStageMap(prev => ({
      ...prev,
      [oppId]: stage
    }));
  };
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductProfileModalOpen, setIsProductProfileModalOpen] = useState<boolean>(false);

  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState<boolean>(false);

  const [isCreateMerchantModalOpen, setIsCreateMerchantModalOpen] = useState<boolean>(false);

  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);
  const [checkoutItem, setCheckoutItem] = useState<Product | null>(null);
  const [recommendedAddon, setRecommendedAddon] = useState<Product | null>(null);
  const [recoveryDetails, setRecoveryDetails] = useState<{
    customerName: string;
    amount: number;
    productName: string;
    opportunityId?: string;
    customerId?: string;
    isRecovery: boolean;
  } | null>(null);

  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<{
    isRunning: boolean;
    currentStep: number;
    totalSteps: number;
    currentScenario: MultiAgentSimulationStep | null;
    completed: boolean;
    opportunitiesCreated: number;
    potentialRevenue: number;
    aiAttributedRevenue: number;
  }>({
    isRunning: false,
    currentStep: 0,
    totalSteps: 3,
    currentScenario: null,
    completed: false,
    opportunitiesCreated: 3,
    potentialRevenue: 6490,
    aiAttributedRevenue: 2890
  });

  // Customer Identity & Auth Session (Explicit session only, never auto-assign)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const stored = localStorage.getItem(`merchantos_customer_session_${activeMerchantId}`) || localStorage.getItem(`merchantos_customer_${activeMerchantId}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  });
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState<boolean>(false);
  const [customerAuthMode, setCustomerAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sync currentCustomer on activeMerchantId change (ONLY load explicitly authenticated customer)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`merchantos_customer_session_${activeMerchantId}`) || localStorage.getItem(`merchantos_customer_${activeMerchantId}`);
      if (stored) {
        setCurrentCustomer(JSON.parse(stored));
      } else {
        setCurrentCustomer(null);
      }
    } catch (e) {
      setCurrentCustomer(null);
    }
  }, [activeMerchantId]);

  const openCustomerAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setCustomerAuthMode(mode);
    setIsCustomerAuthModalOpen(true);
  };

  const closeCustomerAuth = () => {
    setIsCustomerAuthModalOpen(false);
  };

  const signUpCustomer = (params: { name: string; email: string; phone?: string; merchantId?: string }): Customer => {
    const mId = params.merchantId || activeMerchantId;
    const existingList = allCustomers[mId] || [];
    const cleanEmail = params.email.trim().toLowerCase();
    
    // Check if customer with this email already exists
    const existing = existingList.find(c => c.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentCustomer(existing);
      try {
        localStorage.setItem(`merchantos_customer_${mId}`, JSON.stringify(existing));
      } catch (e) {}
      setIsCustomerAuthModalOpen(false);
      addNotification(`Welcome, ${existing.name}! Signed in to ${activeMerchant.name}.`, 'info');
      return existing;
    }

    // Generate stable customer ID: CUS_001, CUS_002, etc.
    const custIndex = existingList.length + 1;
    const stableId = `CUS_${custIndex.toString().padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newCust: Customer = {
      id: stableId,
      merchantId: mId,
      name: params.name.trim(),
      email: cleanEmail,
      phone: params.phone?.trim() || '+91 98000 00000',
      location: 'Online Storefront',
      createdAt: nowIso,
      lifetimeValue: 0,
      status: 'active',
      avatarColor: '#111111',
      currentIntent: 'STOREFRONT_VISITOR',
      nextBestAction: 'Explore store catalog with AI Shopping Agent',
      metrics: {
        totalOrders: 0,
        totalSpend: 0,
        averageOrderValue: 0,
        lastPurchaseAt: null
      },
      behavior: {
        viewedTimes: 1,
        lastViewedProduct: '',
        cartValue: 0,
        cartItems: [],
        daysActive: 1,
        hasPurchased: false,
        intentScore: 50,
        preferredCategories: [],
        viewedProducts: [],
        searchQueries: [],
        cartAdds: [],
        abandonedCarts: [],
        purchases: []
      }
    };

    setAllCustomers(prev => ({
      ...prev,
      [mId]: [newCust, ...(prev[mId] || [])]
    }));

    setCurrentCustomer(newCust);
    try {
      localStorage.setItem(`merchantos_customer_${mId}`, JSON.stringify(newCust));
    } catch (e) {}

    // Record canonical registration event
    recordCanonicalEvent({
      agent: 'INTENT',
      agentName: 'Customer Intent Agent',
      stage: 'OBSERVE',
      customerId: newCust.id,
      customerName: newCust.name,
      title: `New customer registered: ${newCust.name}`,
      description: `Customer ${newCust.name} (${newCust.email}) created account on ${activeMerchant.name} storefront.`,
      toolUsed: 'CustomerSessionTracker',
      policyStatus: 'ALLOWED',
      policyDetails: 'Customer consent verified. Identity token issued.',
      result: 'SUCCESS',
      status: 'info'
    });

    addNotification(`Welcome, ${newCust.name}! Account created on ${activeMerchant.name}.`, 'success');
    setIsCustomerAuthModalOpen(false);
    return newCust;
  };

  const signInCustomer = (params: { email: string; merchantId?: string }): Customer | null => {
    const mId = params.merchantId || activeMerchantId;
    const existingList = allCustomers[mId] || [];
    const cleanEmail = params.email.trim().toLowerCase();
    
    let cust = existingList.find(c => c.email.toLowerCase() === cleanEmail);
    if (!cust) {
      // Auto-create profile for demo ease
      const inferredName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Shopper';
      cust = signUpCustomer({ name: inferredName, email: cleanEmail, merchantId: mId });
      return cust;
    }

    setCurrentCustomer(cust);
    try {
      localStorage.setItem(`merchantos_customer_${mId}`, JSON.stringify(cust));
    } catch (e) {}

    recordCanonicalEvent({
      agent: 'INTENT',
      agentName: 'Customer Intent Agent',
      stage: 'OBSERVE',
      customerId: cust.id,
      customerName: cust.name,
      title: `Customer signed in: ${cust.name}`,
      description: `Active session authenticated for ${cust.name} (${cust.email}). Scoped to ${activeMerchant.name}.`,
      toolUsed: 'CustomerSessionTracker',
      policyStatus: 'ALLOWED',
      policyDetails: 'Active shopper authentication token verified.',
      result: 'SUCCESS',
      status: 'info'
    });

    addNotification(`Welcome back, ${cust.name}!`, 'success');
    setIsCustomerAuthModalOpen(false);
    return cust;
  };

  const signOutCustomer = () => {
    setCurrentCustomer(null);
    setAuthRole(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(`merchantos_customer_session_${activeMerchantId}`);
      localStorage.removeItem(`merchantos_customer_${activeMerchantId}`);
    } catch (e) {}
    addNotification('Signed out of customer account.', 'info');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const updateCustomer = (customerId: string, updates: Partial<Customer>) => {
    setAllCustomers(prev => ({
      ...prev,
      [activeMerchantId]: (prev[activeMerchantId] || []).map(c => {
        if (c.id === customerId) {
          const updated = { ...c, ...updates };
          if (currentCustomer && currentCustomer.id === customerId) {
            setCurrentCustomer(updated);
            try {
              localStorage.setItem(`merchantos_customer_${activeMerchantId}`, JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        }
        return c;
      })
    }));
  };

  const recordCustomerShoppingEvent = (eventData: Omit<ShoppingEvent, 'id' | 'timestamp'>) => {
    const mId = eventData.merchantId || activeMerchantId;
    const nowIso = new Date().toISOString();
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const custId = eventData.customerId || currentCustomer?.id;
    const custName = eventData.customerName || currentCustomer?.name || 'Customer';

    // 1. Update Customer behavior in allCustomers
    if (custId) {
      setAllCustomers(prev => {
        const list = prev[mId] || [];
        const updatedList = list.map(c => {
          if (c.id === custId) {
            const behavior = { ...(c.behavior || {}) };
            let updatedIntent = c.currentIntent;
            let updatedStatus = c.status;
            let updatedNextBestAction = c.nextBestAction;

            if ((eventData.type === 'SEARCH_PERFORMED' || eventData.type === 'PRODUCT_SEARCH') && eventData.metadata?.query) {
              behavior.searchQueries = [...(behavior.searchQueries || []), eventData.metadata.query];
            } else if ((eventData.type === 'PRODUCT_VIEWED' || eventData.type === 'PRODUCT_VIEW') && eventData.productName) {
              behavior.viewedProducts = Array.from(new Set([...(behavior.viewedProducts || []), eventData.productName]));
              behavior.lastViewedProduct = eventData.productName;
              behavior.viewedTimes = (behavior.viewedTimes || 0) + 1;
            } else if ((eventData.type === 'PRODUCT_ADDED_TO_CART' || eventData.type === 'ADD_TO_CART') && eventData.productName) {
              behavior.cartItems = Array.from(new Set([...(behavior.cartItems || []), eventData.productName]));
              behavior.cartValue = (behavior.cartValue || 0) + (eventData.amount || 0);
              behavior.cartAdds = [
                ...(behavior.cartAdds || []),
                {
                  productId: eventData.productId || 'prod',
                  productName: eventData.productName,
                  price: eventData.amount || 0,
                  timestamp: 'Just now',
                  source: eventData.source || 'STOREFRONT'
                }
              ];
              behavior.intentScore = Math.max(behavior.intentScore || 70, 85);
              updatedIntent = 'HIGH_PURCHASE_INTENT';
              updatedStatus = 'high_intent';
            } else if (eventData.type === 'REMOVE_FROM_CART' && eventData.productName) {
              behavior.cartItems = (behavior.cartItems || []).filter(item => item !== eventData.productName);
              behavior.cartValue = Math.max(0, (behavior.cartValue || 0) - (eventData.amount || 0));
            } else if (eventData.type === 'AI_RECOMMENDATION_SHOWN' || eventData.type === 'AI_UPSELL_SHOWN' || eventData.type === 'AI_CROSS_SELL_SHOWN') {
              behavior.intentScore = Math.min(100, (behavior.intentScore || 80) + 5);
              updatedNextBestAction = `Offer ${eventData.productName || 'recommended add-on'} (+₹${(eventData.amount || 0).toLocaleString('en-IN')})`;
            } else if (eventData.type === 'AI_RECOMMENDATION_ACCEPTED' || eventData.type === 'AI_UPSELL_ACCEPTED' || eventData.type === 'AI_CROSS_SELL_ACCEPTED') {
              if (eventData.productName) {
                behavior.cartItems = Array.from(new Set([...(behavior.cartItems || []), eventData.productName]));
                behavior.cartValue = (behavior.cartValue || 0) + (eventData.amount || 0);
                behavior.cartAdds = [
                  ...(behavior.cartAdds || []),
                  {
                    productId: eventData.productId || 'prod_addon',
                    productName: eventData.productName,
                    price: eventData.amount || 0,
                    timestamp: 'Just now',
                    source: eventData.source || 'AI_CROSS_SELL'
                  }
                ];
              }
              behavior.intentScore = Math.min(100, (behavior.intentScore || 85) + 10);
              updatedIntent = 'HIGH_PURCHASE_INTENT';
            } else if (eventData.type === 'CHECKOUT_STARTED') {
              updatedIntent = 'HIGH_PURCHASE_INTENT';
            } else if (eventData.type === 'PURCHASE_COMPLETED' || eventData.type === 'PAYMENT_SUCCESS') {
              behavior.hasPurchased = true;
              behavior.cartItems = [];
              behavior.cartValue = 0;
              updatedIntent = 'HIGH_PURCHASE_INTENT';
              updatedStatus = 'active';
            } else if (eventData.type === 'CART_ABANDONED') {
              behavior.abandonedCarts = [
                ...(behavior.abandonedCarts || []),
                {
                  items: behavior.cartItems || [],
                  amount: behavior.cartValue || eventData.amount || 0,
                  timestamp: 'Just now'
                }
              ];
              updatedIntent = 'HIGH_RECOVERY_INTENT';
              updatedStatus = 'at_risk';
              updatedNextBestAction = `Dispatch Razorpay recovery payment link for ₹${(behavior.cartValue || eventData.amount || 0).toLocaleString('en-IN')}`;
            }

            const updatedCustomer: Customer = {
              ...c,
              behavior,
              currentIntent: updatedIntent,
              status: updatedStatus,
              nextBestAction: updatedNextBestAction
            };

            if (currentCustomer && currentCustomer.id === c.id) {
              setCurrentCustomer(updatedCustomer);
              try {
                localStorage.setItem(`merchantos_customer_${mId}`, JSON.stringify(updatedCustomer));
              } catch (e) {}
            }

            return updatedCustomer;
          }
          return c;
        });
        return { ...prev, [mId]: updatedList };
      });
    }

    // 2. Emit corresponding Activity Item in real-time
    let agent: AgentId = 'INTENT';
    let title = `${custName} performed action`;
    let desc = `Activity on ${activeMerchant.name} storefront.`;
    let tool = 'StorefrontTelemetry';

    if (eventData.type === 'SEARCH_PERFORMED' || eventData.type === 'PRODUCT_SEARCH') {
      agent = 'INTENT';
      title = `Search: "${eventData.metadata?.query || ''}"`;
      desc = `${custName} searched catalog for "${eventData.metadata?.query || ''}".`;
      tool = 'ShoppingSearchAgent';
    } else if (eventData.type === 'PRODUCT_VIEWED' || eventData.type === 'PRODUCT_VIEW') {
      agent = 'INTENT';
      title = `Viewed ${eventData.productName}`;
      desc = `${custName} inspected product specifications for ${eventData.productName}.`;
      tool = 'CustomerIntentAgent';
    } else if (eventData.type === 'PRODUCT_ADDED_TO_CART' || eventData.type === 'ADD_TO_CART') {
      agent = 'INTENT';
      title = `PRODUCT_ADDED_TO_CART`;
      desc = `${custName} added ${eventData.productName} (₹${(eventData.amount || 0).toLocaleString('en-IN')}) to cart.`;
      tool = 'SessionCartEngine';
    } else if (eventData.type === 'REMOVE_FROM_CART') {
      agent = 'INTENT';
      title = `REMOVE_FROM_CART`;
      desc = `${custName} removed ${eventData.productName} from cart.`;
      tool = 'SessionCartEngine';
    } else if (eventData.type === 'AI_RECOMMENDATION_SHOWN' || eventData.type === 'AI_CROSS_SELL_SHOWN' || eventData.type === 'AI_UPSELL_SHOWN') {
      agent = 'MERCHANDISING';
      title = eventData.type === 'AI_UPSELL_SHOWN' ? `AI_UPSELL` : `AI_CROSS_SELL`;
      desc = `Recommended ${eventData.productName} (₹${(eventData.amount || 0).toLocaleString('en-IN')}) to ${custName}.`;
      tool = 'MerchandisingAgent';
    } else if (eventData.type === 'AI_RECOMMENDATION_ACCEPTED' || eventData.type === 'AI_CROSS_SELL_ACCEPTED' || eventData.type === 'AI_UPSELL_ACCEPTED') {
      agent = 'MERCHANDISING';
      title = `AI_RECOMMENDATION_ACCEPTED`;
      desc = `${custName} accepted recommendation: ${eventData.productName} (+₹${(eventData.amount || 0).toLocaleString('en-IN')}).`;
      tool = 'MerchandisingAgent';
    } else if (eventData.type === 'CHECKOUT_STARTED') {
      agent = 'COMMERCE';
      title = `CHECKOUT_STARTED`;
      desc = `${custName} initiated Razorpay Test Mode checkout (₹${(eventData.amount || 0).toLocaleString('en-IN')}).`;
      tool = 'RazorpayOrderAPI';
    } else if (eventData.type === 'PURCHASE_COMPLETED' || eventData.type === 'PAYMENT_SUCCESS') {
      agent = 'COMMERCE';
      title = `PURCHASE_COMPLETED`;
      desc = `${custName} completed order for ${eventData.productName || 'items'} (₹${(eventData.amount || 0).toLocaleString('en-IN')}).`;
      tool = 'RazorpayPaymentGateway';
    }

    const actItem: AgentActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      merchantId: mId,
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      timeFormatted: nowIso.substring(11, 16),
      agent,
      agentName: agent === 'INTENT' ? 'Customer Intent Agent' : agent === 'MERCHANDISING' ? 'Merchandising Agent' : 'Commerce Execution Agent',
      stage: 'OBSERVE',
      customerId: custId,
      customerName: custName,
      title,
      description: desc,
      toolUsed: tool,
      status: 'info'
    };

    setAllActivity(prev => ({
      ...prev,
      [mId]: [actItem, ...(prev[mId] || [])]
    }));
  };

  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [notifications, setNotifications] = useState<
    { id: string; title: string; time: string; type: 'info' | 'success' | 'warning' }[]
  >([
    { id: 'notif_1', title: `[${activeMerchant.name}] Active store catalog & policies loaded.`, time: 'Just now', type: 'info' }
  ]);

  const addNotification = (title: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random()}`,
      title,
      time: 'Just now',
      type
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Create Merchant
  const createMerchant = (params: {
    name: string;
    storeName: string;
    industry: string;
    currency: string;
    currencySymbol?: string;
    tagline?: string;
    maxDiscountPercent?: number;
    requireApprovalAboveAmount?: number;
  }): MerchantProfile => {
    const id = `merchant_${params.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString().slice(-4)}`;
    const symbol = params.currencySymbol || (params.currency === 'USD' ? '$' : '₹');
    
    const newMerchant: MerchantProfile = {
      id,
      name: params.name,
      storeName: params.storeName || `${params.name} Store`,
      industry: params.industry,
      currency: params.currency,
      currencySymbol: symbol,
      logoInitial: params.name.charAt(0).toUpperCase(),
      tagline: params.tagline || `AI Autonomous Commerce Store for ${params.industry}`,
      policy: {
        merchantId: id,
        maxDiscountPercent: params.maxDiscountPercent || 15,
        requireApprovalAboveAmount: params.requireApprovalAboveAmount || 5000,
        minConfidenceForAutonomousAction: 80,
        allowAutonomousCheckoutRecovery: true,
        allowAutonomousCrossSell: true,
        razorpayKeyId: `rzp_test_${id.slice(-6)}`,
        webhookSecret: `whsec_${id.slice(-6)}`,
        testModeActive: true
      },
      stats: {
        revenueGenerated: 0,
        revenueGrowthPercent: 0,
        aiAttributedRevenue: 0,
        aiAttributedGrowthPercent: 0,
        opportunitiesFound: 0,
        conversionLiftPercent: 0,
        averageBasketUplift: 0,
        actionsToday: 0,
        successfulActions: 0,
        awaitingApprovalCount: 0,
        blockedCount: 0,
        currentTask: 'Initialized AI commerce agent fleet. Ready for catalog sync.',
        status: 'ONLINE'
      },
      createdAt: new Date().toISOString()
    };

    setMerchants(prev => [...prev, newMerchant]);
    setAllProducts(prev => ({ ...prev, [id]: [] }));
    setAllCustomers(prev => ({ ...prev, [id]: [] }));
    setAllOpportunities(prev => ({ ...prev, [id]: [] }));
    setAllTransactions(prev => ({ ...prev, [id]: [] }));
    setAllActivity(prev => ({ ...prev, [id]: [] }));
    setAllAudit(prev => ({ ...prev, [id]: [] }));

    loginAsAdmin(id);
    addNotification(`Store "${newMerchant.storeName}" created successfully.`, 'success');
    return newMerchant;
  };

  const updateMerchantPolicy = (policyUpdates: Partial<MerchantPolicy>) => {
    setMerchants(prev => prev.map(m => {
      if (m.id === activeMerchantId) {
        return {
          ...m,
          policy: { ...m.policy, ...policyUpdates }
        };
      }
      return m;
    }));
    addNotification(`Policy guardrails updated for ${activeMerchant.name}.`, 'success');
  };

  // Canonical Shared Event Logger (Activity + Audit Link)
  const recordCanonicalEvent = (event: CanonicalAgentEvent): { activityItem: AgentActivityItem; auditLog: AuditLog } => {
    const targetMerchantId = event.merchantId || activeMerchantId;
    const isoTimestamp = event.timestamp || new Date().toISOString();
    const timeFormatted = new Date(isoTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const randSuffix = Math.floor(1000 + Math.random() * 9000);

    const defaultAgentNames: Record<AgentId, string> = {
      SUPERVISOR: 'Growth Supervisor Agent',
      INTENT: 'Customer Intent Agent',
      MERCHANDISING: 'Merchandising Agent',
      RECOVERY: 'Revenue Recovery Agent',
      POLICY: 'Policy & Risk Agent',
      COMMERCE: 'Commerce Execution Agent'
    };

    const defaultStages: Record<AgentId, AgentStage> = {
      SUPERVISOR: 'OBSERVE',
      INTENT: 'UNDERSTAND',
      MERCHANDISING: 'RECOMMEND',
      RECOVERY: 'RECOMMEND',
      POLICY: 'POLICY',
      COMMERCE: 'ACTION'
    };

    const stage = event.stage || defaultStages[event.agent] || 'OBSERVE';
    const agentName = event.agentName || defaultAgentNames[event.agent] || `${event.agent} Agent`;
    const custId = event.customerId || 'cust_live';
    const custName = event.customerName || event.customer || 'Live Shopper';
    const policyStat = event.policyStatus || 'ALLOWED';
    const polDetails = event.policyDetails || event.policy || `Validated under ${activeMerchant.name} policy limits.`;
    const res = event.result || (event.status === 'warning' ? 'AWAITING_APPROVAL' : policyStat === 'BLOCKED' ? 'BLOCKED' : 'SUCCESS');

    // 1. Create canonical activity stream item
    const newAct: AgentActivityItem = {
      id: `act_${Date.now()}_${randSuffix}`,
      merchantId: targetMerchantId,
      timestamp: isoTimestamp,
      timeFormatted,
      stage,
      agent: event.agent,
      agentId: event.agent,
      agentName,
      customerId: custId,
      customerName: custName,
      customer: custName,
      opportunityId: event.opportunityId,
      title: event.title,
      description: event.description || event.title,
      toolUsed: event.toolUsed || `${event.agent}Tool`,
      policyStatus: policyStat,
      policyDetails: polDetails,
      status: event.status || (policyStat === 'BLOCKED' ? 'warning' : 'success'),
      metadata: event.metadata
    };

    // 2. Create canonical traceable cryptographic audit log
    const hash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
    const newAud: AuditLog = {
      id: `aud_${Date.now()}_${randSuffix}`,
      merchantId: targetMerchantId,
      timestamp: isoTimestamp,
      event: stage,
      agent: event.agent,
      agentId: event.agent,
      agentName,
      customerId: custId,
      customerName: custName,
      customer: custName,
      opportunityId: event.opportunityId,
      agentDecision: event.title + (event.description && event.description !== event.title ? ` — ${event.description}` : ''),
      toolUsed: event.toolUsed || `${event.agent}Tool`,
      policyStatus: policyStat,
      policyDetails: polDetails,
      policy: polDetails,
      result: res,
      signatureHash: hash,
      metadata: event.metadata
    };

    setAllActivity(prev => ({
      ...prev,
      [targetMerchantId]: [newAct, ...(prev[targetMerchantId] || [])]
    }));

    setAllAudit(prev => ({
      ...prev,
      [targetMerchantId]: [newAud, ...(prev[targetMerchantId] || [])]
    }));

    return { activityItem: newAct, auditLog: newAud };
  };

  // Product Catalog CRUD
  const addProduct = (productData: Partial<Product>): Product => {
    const id = `prod_${activeMerchantId.slice(-4)}_${Date.now().toString().slice(-5)}`;
    const newProd: Product = {
      id,
      merchantId: activeMerchantId,
      name: productData.name || 'New Product',
      price: productData.price || 999,
      originalPrice: productData.originalPrice || (productData.price ? Math.round(productData.price * 1.25) : 1299),
      currency: activeMerchant.currency,
      availability: true,
      stockCount: productData.stockCount || 50,
      category: productData.category || 'General',
      subcategory: productData.subcategory || 'Catalog Items',
      margin: productData.margin || 40,
      status: 'Active',
      image: productData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      aiSummary: productData.aiSummary || productData.description || `High-quality ${productData.category || 'product'} optimized for automated agentic commerce.`,
      features: productData.features || ['Premium construction', 'Quality inspected', 'Direct merchant dispatch'],
      aiBuyerTags: productData.aiBuyerTags || [productData.category || 'General', 'In-Stock', 'Under-1k'],
      suitableFor: productData.suitableFor || ['daily-use'],
      crossSellAffinity: productData.crossSellAffinity || [],
      priceElasticityScore: 0.85,
      purchaseEligibility: 'Instant checkout ready in Razorpay Test Mode.',
      jsonLdSchema: { '@type': 'Product', name: productData.name, price: productData.price },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAllProducts(prev => ({
      ...prev,
      [activeMerchantId]: [newProd, ...(prev[activeMerchantId] || [])]
    }));

    // Record canonical event
    recordCanonicalEvent({
      agent: 'SUPERVISOR',
      agentName: 'Catalog Intelligence Agent',
      stage: 'OBSERVE',
      title: `Added "${newProd.name}" to ${activeMerchant.name} catalog`,
      description: `Catalog intelligence indexed item (₹${newProd.price}). Immediately searchable by Shopping Agent.`,
      toolUsed: 'CatalogIntelligenceAgent',
      policyStatus: 'ALLOWED',
      policyDetails: `Catalog indexing verified: Price and margin parameters within merchant rules.`,
      result: 'SUCCESS',
      status: 'info'
    });

    addNotification(`Added "${newProd.name}" to ${activeMerchant.name} catalog.`, 'success');
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setAllProducts(prev => ({
      ...prev,
      [activeMerchantId]: (prev[activeMerchantId] || []).map(p => {
        if (p.id === id) {
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    }));
    addNotification('Product updated. AI agent index refreshed.', 'success');
  };

  const archiveProduct = (id: string) => {
    setAllProducts(prev => ({
      ...prev,
      [activeMerchantId]: (prev[activeMerchantId] || []).map(p => {
        if (p.id === id) {
          return { ...p, status: 'Archived', availability: false };
        }
        return p;
      })
    }));
    addNotification('Product archived.', 'info');
  };

  // CSV Import
  const importProductsCsv = (csvContent: string): { importedCount: number; skippedCount: number; errors: string[] } => {
    const lines = csvContent.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length <= 1) {
      return { importedCount: 0, skippedCount: 0, errors: ['CSV contains no data rows.'] };
    }

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('title'));
    const categoryIdx = header.findIndex(h => h.includes('cat'));
    const priceIdx = header.findIndex(h => h.includes('price') || h.includes('amount'));
    const descIdx = header.findIndex(h => h.includes('desc') || h.includes('summary'));
    const stockIdx = header.findIndex(h => h.includes('stock') || h.includes('qty'));
    const tagsIdx = header.findIndex(h => h.includes('tag'));
    const marginIdx = header.findIndex(h => h.includes('margin'));

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const newItems: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      const name = nameIdx !== -1 ? row[nameIdx] : `Product ${i}`;
      const rawPrice = priceIdx !== -1 ? row[priceIdx] : undefined;
      const price = rawPrice ? parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) : NaN;

      if (!name || name.length < 2) {
        skippedCount++;
        errors.push(`Row ${i}: Missing product name`);
        continue;
      }
      if (isNaN(price) || price <= 0) {
        skippedCount++;
        errors.push(`Row ${i} (${name}): Missing or invalid price`);
        continue;
      }

      const category = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'General';
      const desc = descIdx !== -1 && row[descIdx] ? row[descIdx] : `${name} in ${category}`;
      const stock = stockIdx !== -1 && !isNaN(parseInt(row[stockIdx], 10)) ? parseInt(row[stockIdx], 10) : 50;
      const tags = tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].split(';').map(t => t.trim()) : [category, name];
      const margin = marginIdx !== -1 && !isNaN(parseInt(row[marginIdx], 10)) ? parseInt(row[marginIdx], 10) : 40;

      const pId = `prod_${activeMerchantId.slice(-4)}_csv_${Date.now().toString().slice(-4)}_${i}`;
      newItems.push({
        id: pId,
        merchantId: activeMerchantId,
        name,
        price,
        originalPrice: Math.round(price * 1.2),
        currency: activeMerchant.currency,
        availability: true,
        stockCount: stock,
        category,
        margin,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        aiSummary: desc,
        features: ['Imported via CSV', 'Verified in merchant catalog'],
        aiBuyerTags: tags,
        suitableFor: ['general'],
        crossSellAffinity: [],
        priceElasticityScore: 0.85,
        purchaseEligibility: 'Ready for 1-click Razorpay Test Mode checkout.',
        jsonLdSchema: { '@type': 'Product', name, price }
      });
      importedCount++;
    }

    if (newItems.length > 0) {
      setAllProducts(prev => ({
        ...prev,
        [activeMerchantId]: [...newItems, ...(prev[activeMerchantId] || [])]
      }));
      addNotification(`Imported ${importedCount} products into ${activeMerchant.name} catalog.`, 'success');
    }

    return { importedCount, skippedCount, errors };
  };

  // Opportunity Actions
  const approveOpportunity = (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    if (!opp) return;

    const txId = `TX_${activeMerchantId.slice(-4)}_${Date.now().toString().slice(-5)}`;
    const nowIso = new Date().toISOString();

    // 1. Mark Opportunity as COMPLETED with execution metadata
    setAllOpportunities(prev => ({
      ...prev,
      [activeMerchantId]: (prev[activeMerchantId] || []).map(o => {
        if (o.id === id) {
          return {
            ...o,
            status: 'completed',
            executedAt: nowIso,
            executedByAgent: 'COMMERCE',
            executionDetails: 'Executed via Razorpay Test Gateway',
            transactionId: txId
          };
        }
        return o;
      })
    }));

    // 2. Record Transaction in Razorpay Test Mode
    const newTx: Transaction = {
      id: txId,
      merchantId: activeMerchantId,
      razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(2, 9)}`,
      razorpayOrderId: `order_test_${Math.random().toString(36).substring(2, 9)}`,
      customerId: opp.customerId,
      customerName: opp.customerName,
      baseProduct: opp.productTarget || 'Catalog Product',
      baseAmount: opp.expectedRevenue,
      aiAddonProduct: opp.recommendedItem?.name,
      aiAddonAmount: opp.recommendedItem?.price,
      totalAmount: opp.expectedRevenue + (opp.recommendedItem?.price || 0),
      aiAttribution: opp.type === 'checkout_recovery' ? 'AI Checkout Recovery' : 'AI Cross-sell',
      aiAttributedRevenue: opp.expectedRevenue,
      status: 'SUCCESS',
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      paymentMethod: 'UPI'
    };

    setAllTransactions(prev => ({
      ...prev,
      [activeMerchantId]: [newTx, ...(prev[activeMerchantId] || [])]
    }));

    // 3. Record Canonical Approval Event (Merchant / Supervisor)
    recordCanonicalEvent({
      agent: 'SUPERVISOR',
      agentName: 'Growth Supervisor Agent',
      stage: 'APPROVAL',
      customerId: opp.customerId,
      customerName: opp.customerName,
      opportunityId: opp.id,
      title: 'Merchant approved recommendation',
      description: `Merchant approved ${opp.title} (+₹${opp.expectedRevenue.toLocaleString('en-IN')} uplift). Routed to Commerce Agent.`,
      toolUsed: 'MerchantApprovalGateway',
      policyStatus: 'ALLOWED',
      policyDetails: `Policy check passed. Merchant sign-off recorded under ${activeMerchant.name} guardrails.`,
      result: 'EXECUTED',
      status: 'success'
    });

    // 4. Record Canonical Policy Verification Event
    recordCanonicalEvent({
      agent: 'POLICY',
      agentName: 'Policy & Risk Agent',
      stage: 'POLICY',
      customerId: opp.customerId,
      customerName: opp.customerName,
      opportunityId: opp.id,
      title: 'Policy Agent approved discount within merchant limit',
      description: `Verified discount and margin safeguards for ${opp.customerName}.`,
      toolUsed: 'PolicyGuard',
      policyStatus: 'ALLOWED',
      policyDetails: `Autonomous guardrail check verified under ${activeMerchant.name} policy limits.`,
      result: 'SUCCESS',
      status: 'success'
    });

    // 5. Record Canonical Commerce Agent Execution Event
    recordCanonicalEvent({
      agent: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'ACTION',
      customerId: opp.customerId,
      customerName: opp.customerName,
      opportunityId: opp.id,
      title: 'Commerce Agent generated 1-click test checkout',
      description: `Dispatched commerce action via Razorpay Test Gateway (Order: ${newTx.razorpayOrderId}).`,
      toolUsed: 'RazorpayOrderAPI',
      policyStatus: 'ALLOWED',
      policyDetails: `Generated Razorpay Test Mode token in sandbox.`,
      result: 'SUCCESS',
      status: 'success'
    });

    // 6. Record Canonical Payment Capture & Revenue Attribution Event
    recordCanonicalEvent({
      agent: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'RESULT',
      customerId: opp.customerId,
      customerName: opp.customerName,
      opportunityId: opp.id,
      title: `Captured ₹${newTx.totalAmount.toLocaleString('en-IN')} in Razorpay Test Mode`,
      description: `Captured ₹${opp.expectedRevenue.toLocaleString('en-IN')} AI-attributed revenue on ${opp.title}. Payment ID: ${newTx.razorpayPaymentId}.`,
      toolUsed: 'RazorpayPaymentCapture',
      policyStatus: 'ALLOWED',
      policyDetails: `Settlement verified in Razorpay Test Sandbox. Ledger updated.`,
      result: 'SUCCESS',
      status: 'success'
    });

    // 7. Update Merchant & Global Stats
    setMerchants(prev => prev.map(m => {
      if (m.id === activeMerchantId) {
        return {
          ...m,
          stats: {
            ...m.stats,
            revenueGenerated: m.stats.revenueGenerated + opp.expectedRevenue,
            aiAttributedRevenue: m.stats.aiAttributedRevenue + opp.expectedRevenue,
            actionsToday: m.stats.actionsToday + 1,
            successfulActions: m.stats.successfulActions + 1,
            awaitingApprovalCount: Math.max(0, m.stats.awaitingApprovalCount - 1)
          }
        };
      }
      return m;
    }));

    // 8. Close reasoning drawer and clear selected opportunity
    setIsReasoningDrawerOpen(false);
    setSelectedOpportunity(null);

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {}

    addNotification(`Approved & executed ${opp.title} (+₹${opp.expectedRevenue.toLocaleString('en-IN')}) in Razorpay Test Mode.`, 'success');
  };

  const rejectOpportunity = (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    const nowIso = new Date().toISOString();

    setAllOpportunities(prev => ({
      ...prev,
      [activeMerchantId]: (prev[activeMerchantId] || []).map(o => {
        if (o.id === id) {
          return {
            ...o,
            status: 'rejected',
            rejectedAt: nowIso,
            rejectionReason: 'Declined by merchant review'
          };
        }
        return o;
      })
    }));

    if (opp) {
      // Record Canonical Rejection Event
      recordCanonicalEvent({
        agent: 'SUPERVISOR',
        agentName: 'Growth Supervisor Agent',
        stage: 'APPROVAL',
        customerId: opp.customerId,
        customerName: opp.customerName,
        opportunityId: opp.id,
        title: 'Merchant rejected recommendation',
        description: `Declined ${opp.title} for ${opp.customerName}. Action will not be dispatched.`,
        toolUsed: 'MerchantApprovalGateway',
        policyStatus: 'BLOCKED',
        policyDetails: `Merchant manually rejected action for ${opp.customerName}.`,
        result: 'REJECTED',
        status: 'warning'
      });

      // Update awaiting approval count
      setMerchants(prev => prev.map(m => {
        if (m.id === activeMerchantId) {
          return {
            ...m,
            stats: {
              ...m.stats,
              awaitingApprovalCount: Math.max(0, m.stats.awaitingApprovalCount - 1)
            }
          };
        }
        return m;
      }));
    }

    setIsReasoningDrawerOpen(false);
    setSelectedOpportunity(null);
    addNotification('Opportunity rejected.', 'info');
  };

  // Modals helpers
  const openAgentDetailDrawer = (agent: AgentInfo) => {
    setSelectedAgentForDetail(agent);
    setIsAgentDetailDrawerOpen(true);
  };

  const openAgentTraceModal = () => {
    setIsAgentTraceModalOpen(true);
  };

  const openReasoningDrawer = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsReasoningDrawerOpen(true);
  };

  const openProductProfileModal = (prod: Product) => {
    setSelectedProduct(prod);
    setIsProductProfileModalOpen(true);
  };

  const openProductEditModal = (prod?: Product | null) => {
    setSelectedProductForEdit(prod || null);
    setIsProductEditModalOpen(true);
  };

  const openCheckout = (baseProduct: Product, addon?: Product) => {
    setRecoveryDetails(null);
    setCheckoutItem(baseProduct);
    setRecommendedAddon(addon || null);
    setIsRazorpayModalOpen(true);
  };

  const openRecoveryCheckout = (recoveryData?: {
    customerName?: string;
    amount?: number;
    productName?: string;
    opportunityId?: string;
    customerId?: string;
  }) => {
    const custName = recoveryData?.customerName || 'Priya Sharma';
    const amount = recoveryData?.amount || 4890;
    const prodName = recoveryData?.productName || 'Urban Performance Kurti & Stole Ensemble (Abandoned Cart)';

    setRecoveryDetails({
      customerName: custName,
      amount,
      productName: prodName,
      opportunityId: recoveryData?.opportunityId || 'opp_fash_201',
      customerId: recoveryData?.customerId || 'cust_fash_201',
      isRecovery: true
    });
    setCheckoutItem({
      id: 'prod_recov_cart',
      merchantId: activeMerchantId,
      name: prodName,
      price: amount,
      currency: 'INR',
      availability: true,
      stockCount: 1,
      category: 'Abandoned Cart Recovery',
      margin: 40,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
      aiSummary: 'Customer abandoned cart recovery session pre-filled for 1-click Razorpay Test Mode checkout.',
      features: ['Pre-filled customer session', 'Razorpay Test Mode recovery rail'],
      aiBuyerTags: ['Abandoned Cart', 'High Intent', 'Checkout Recovery'],
      suitableFor: ['cart-recovery', '1-click-checkout'],
      crossSellAffinity: [],
      priceElasticityScore: 0.85,
      purchaseEligibility: 'Ready for 1-click Razorpay Test Mode checkout.',
      jsonLdSchema: { '@type': 'Product', name: prodName, price: amount }
    });
    setRecommendedAddon(null);
    setIsRazorpayModalOpen(true);
  };

  const recordRecoveryPaymentFailure = (params?: {
    customerName?: string;
    amount?: number;
    reason?: string;
  }) => {
    const custName = params?.customerName || 'Priya Sharma';
    const amount = params?.amount || 4890;

    // Record failure in both Activity and traceable Audit without incrementing revenue
    recordCanonicalEvent({
      agent: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'RESULT',
      customerId: 'cust_fash_201',
      customerName: custName,
      title: 'Payment failed — recovery link remains available.',
      description: `Simulated payment failure in Razorpay Test Mode for ₹${amount.toLocaleString('en-IN')}. Revenue not incremented. Recovery payment link remains active for customer retry.`,
      toolUsed: 'RazorpayPaymentCapture',
      policyStatus: 'ALLOWED',
      policyDetails: `Graceful recovery failure handling. Session preserved for retry.`,
      result: 'RETRY_AVAILABLE',
      status: 'warning'
    });

    addNotification('Payment failed — recovery link remains available.', 'warning');
  };

  const completeRecoveryCheckout = (paymentMethod: 'UPI' | 'Card' | 'Netbanking'): Transaction => {
    const custName = recoveryDetails?.customerName || 'Priya Sharma';
    const amount = recoveryDetails?.amount || 4890;
    const prodName = recoveryDetails?.productName || 'Urban Performance Kurti & Stole Ensemble';

    return recordLiveDemoCompletion({
      demoType: 'CHECKOUT_RECOVERY',
      customerName: custName,
      amount,
      productName: prodName,
      details: `Commerce Agent captured ₹${amount.toLocaleString('en-IN')} in Razorpay Test Mode — checkout recovery successful.`
    });
  };

  const completeCheckout = (paymentMethod: 'UPI' | 'Card' | 'Netbanking'): Transaction => {
    if (recoveryDetails?.isRecovery) {
      return completeRecoveryCheckout(paymentMethod);
    }

    const baseAmount = checkoutItem?.price || 0;
    const aiAddonAmount = recommendedAddon ? recommendedAddon.price : 0;
    const totalAmount = baseAmount + aiAddonAmount;

    // Identify active customer
    const targetCust = currentCustomer || customers.find(c => c.name.includes('Aarav') || c.name.includes('Priya')) || customers[0] || {
      id: 'CUS_001',
      name: 'Priya Sharma',
      email: 'priya@example.com'
    };

    const rzpRandom = Math.random().toString(36).substring(2, 9).toUpperCase();
    const nowIso = new Date().toISOString();
    const txId = `TX_${activeMerchantId.slice(-4)}_${Math.floor(10000 + Math.random() * 90000)}`;

    const tx: Transaction = {
      id: txId,
      merchantId: activeMerchantId,
      razorpayPaymentId: `pay_test_${rzpRandom}92L`,
      razorpayOrderId: `order_test_${rzpRandom}01R`,
      customerId: targetCust.id,
      customerName: targetCust.name,
      baseProduct: checkoutItem?.name || 'Store Item',
      baseAmount,
      aiAddonProduct: recommendedAddon?.name,
      aiAddonAmount: aiAddonAmount > 0 ? aiAddonAmount : undefined,
      totalAmount,
      aiAttribution: aiAddonAmount > 0 ? 'AI Cross-sell' : 'Direct',
      aiAttributedRevenue: aiAddonAmount,
      status: 'SUCCESS',
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      paymentMethod
    };

    setAllTransactions(prev => ({
      ...prev,
      [activeMerchantId]: [tx, ...(prev[activeMerchantId] || [])]
    }));

    // 1. Update Customer Record in Canonical Store
    setAllCustomers(prev => {
      const list = prev[activeMerchantId] || [];
      const updatedList = list.map(c => {
        if (c.id === targetCust.id || (targetCust.email && c.email.toLowerCase() === targetCust.email.toLowerCase())) {
          const prevOrders = c.metrics?.totalOrders || (c.behavior.hasPurchased ? 1 : 0);
          const prevSpend = c.metrics?.totalSpend || 0;
          const newOrders = prevOrders + 1;
          const newSpend = prevSpend + totalAmount;
          const newAOV = Math.round(newSpend / newOrders);

          const updatedCustomer: Customer = {
            ...c,
            lifetimeValue: (c.lifetimeValue || 0) + totalAmount,
            status: 'active',
            currentIntent: 'HIGH_PURCHASE_INTENT',
            metrics: {
              totalOrders: newOrders,
              totalSpend: newSpend,
              averageOrderValue: newAOV,
              lastPurchaseAt: nowIso
            },
            behavior: {
              ...c.behavior,
              cartValue: 0,
              cartItems: [],
              hasPurchased: true,
              purchases: [
                ...(c.behavior.purchases || []),
                {
                  orderId: tx.razorpayOrderId,
                  amount: totalAmount,
                  items: [tx.baseProduct, ...(tx.aiAddonProduct ? [tx.aiAddonProduct] : [])],
                  timestamp: nowIso,
                  aiRevenue: aiAddonAmount
                }
              ]
            }
          };

          if (currentCustomer && (currentCustomer.id === c.id || (currentCustomer.email && currentCustomer.email.toLowerCase() === c.email.toLowerCase()))) {
            setCurrentCustomer(updatedCustomer);
            try {
              localStorage.setItem(`merchantos_customer_${activeMerchantId}`, JSON.stringify(updatedCustomer));
            } catch (e) {}
          }

          return updatedCustomer;
        }
        return c;
      });
      return { ...prev, [activeMerchantId]: updatedList };
    });

    // 2. Update or Create Opportunity in Canonical Store
    setAllOpportunities(prev => {
      const list = prev[activeMerchantId] || [];
      const oppExists = list.find(o => (o.customerId === targetCust.id || o.customerName === targetCust.name) && o.status !== 'completed');
      if (oppExists) {
        return {
          ...prev,
          [activeMerchantId]: list.map(o => o.id === oppExists.id ? {
            ...o,
            status: 'completed' as const,
            expectedRevenue: aiAddonAmount > 0 ? aiAddonAmount : o.expectedRevenue,
            executedAt: nowIso,
            executedByAgent: 'COMMERCE',
            executionDetails: `Executed via Razorpay Test Gateway (Payment ID: ${tx.razorpayPaymentId})`,
            transactionId: tx.id
          } : o)
        };
      } else if (aiAddonAmount > 0) {
        const newOpp: Opportunity = {
          id: `opp_${activeMerchantId.slice(-4)}_${Date.now().toString().slice(-4)}`,
          merchantId: activeMerchantId,
          type: 'basket_growth',
          title: `${targetCust.name} — AI Cross-sell`,
          customerId: targetCust.id,
          customerName: targetCust.name,
          customerBehavior: `Accepted AI cross-sell recommendation for ${recommendedAddon?.name}`,
          productTarget: checkoutItem?.name,
          aiRecommendation: `Recommended ${recommendedAddon?.name} (+₹${aiAddonAmount}) as complementary add-on`,
          recommendedItem: recommendedAddon ? {
            id: recommendedAddon.id,
            name: recommendedAddon.name,
            price: recommendedAddon.price
          } : undefined,
          expectedRevenue: aiAddonAmount,
          confidence: 96,
          opportunityScore: 94,
          status: 'completed',
          createdAt: nowIso,
          createdByAgent: 'MERCHANDISING',
          reviewedByAgent: 'POLICY',
          executedByAgent: 'COMMERCE',
          executedAt: nowIso,
          executionDetails: `Captured in Razorpay Test Mode`,
          transactionId: tx.id,
          reasoning: {
            intentSignal: 'High purchase affinity for complementary accessory',
            merchandisingLogic: 'High cross-sell score verified by Merchandising Agent',
            policyEvaluation: 'Within autonomous discount and checkout limits',
            executionPlan: 'Generated 1-click Razorpay Test Mode payment token'
          }
        };
        return {
          ...prev,
          [activeMerchantId]: [newOpp, ...list]
        };
      }
      return prev;
    });

    // 3. Record Commerce Agent Checkout Event
    recordCanonicalEvent({
      agent: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'ACTION',
      customerId: tx.customerId,
      customerName: tx.customerName,
      title: 'Commerce Agent generated 1-click test checkout',
      description: `Prepared checkout session for ${tx.baseProduct}${tx.aiAddonProduct ? ` + ${tx.aiAddonProduct}` : ''} (${tx.razorpayOrderId}).`,
      toolUsed: 'RazorpayOrderAPI',
      policyStatus: 'ALLOWED',
      policyDetails: `Validated against ${activeMerchant.name} checkout security rules.`,
      result: 'SUCCESS',
      status: 'success'
    });

    // 4. Record Commerce Agent Payment Capture Event
    recordCanonicalEvent({
      agent: 'COMMERCE',
      agentName: 'Commerce Execution Agent',
      stage: 'RESULT',
      customerId: tx.customerId,
      customerName: tx.customerName,
      title: `Captured ₹${totalAmount.toLocaleString('en-IN')} in Razorpay Test Mode`,
      description: aiAddonAmount > 0
        ? `Captured ₹${aiAddonAmount.toLocaleString('en-IN')} AI cross-sell uplift on ${tx.baseProduct} + ${tx.aiAddonProduct}.`
        : `Captured direct payment for ${tx.baseProduct}.`,
      toolUsed: 'RazorpayPaymentCapture',
      policyStatus: 'ALLOWED',
      policyDetails: `Validated under ${activeMerchant.name} policy limits. Payment ID: ${tx.razorpayPaymentId}.`,
      result: 'SUCCESS',
      status: 'success'
    });

    // 5. Update Merchant Stats
    setMerchants(prev => prev.map(m => {
      if (m.id === activeMerchantId) {
        return {
          ...m,
          stats: {
            ...m.stats,
            revenueGenerated: m.stats.revenueGenerated + totalAmount,
            aiAttributedRevenue: m.stats.aiAttributedRevenue + aiAddonAmount,
            actionsToday: m.stats.actionsToday + 1,
            successfulActions: m.stats.successfulActions + 1
          }
        };
      }
      return m;
    }));

    // 6. Record Customer Telemetry Shopping Event
    recordCustomerShoppingEvent({
      type: 'PURCHASE_COMPLETED',
      customerId: targetCust.id,
      customerName: targetCust.name,
      merchantId: activeMerchantId,
      productId: checkoutItem?.id,
      productName: checkoutItem?.name,
      amount: totalAmount,
      metadata: {
        baseProduct: checkoutItem?.name,
        addon: recommendedAddon?.name,
        orderId: tx.razorpayOrderId
      }
    });

    // 7. Persist Order in FastAPI SQLite Backend
    try {
      const orderPayload = {
        customerId: targetCust.id,
        customerName: targetCust.name,
        merchantId: activeMerchantId,
        baseProductId: checkoutItem?.id || 'prod_vel_01',
        aiAddonProductId: recommendedAddon?.id || null,
        paymentMethod: paymentMethod || 'UPI'
      };

      const persistOrder = async () => {
        const endpoints = [
          '/api/orders',
          'http://127.0.0.1:8001/api/orders',
          'http://127.0.0.1:8000/api/orders'
        ];
        for (const url of endpoints) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderPayload)
            });
            if (res.ok) break;
          } catch {
            // try next endpoint
          }
        }
      };
      persistOrder().catch(() => {});
    } catch (e) {}

    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    addNotification(`Payment of ₹${totalAmount.toLocaleString('en-IN')} captured in Razorpay Test Mode. Admin metrics updated.`, 'success');
    return tx;
  };

  // Simulation runner adapted to active merchant
  const startBatchSimulation = () => {
    setIsSimulationModalOpen(true);
    setSimulationProgress(prev => ({
      ...prev,
      isRunning: true,
      completed: false
    }));
  };

  const resetSimulationState = () => {
    setSimulationProgress({
      isRunning: false,
      currentStep: 0,
      totalSteps: 5,
      currentScenario: null,
      completed: false,
      opportunitiesCreated: opportunities.length,
      potentialRevenue: opportunities.reduce((acc, o) => acc + o.expectedRevenue, 0),
      aiAttributedRevenue: transactions.reduce((acc, t) => acc + t.aiAttributedRevenue, 0)
    });
  };

  const triggerAaravStory = () => {
    addNotification(`[Supervisor Agent] Initiated Basket Growth workflow for ${activeMerchant.name}.`, 'info');
  };

  const triggerPriyaStory = () => {
    addNotification(`[Recovery Agent] Dispatched Cart Recovery flow for ${activeMerchant.name}.`, 'warning');
  };

  const recordLiveDemoCompletion = (params: {
    demoType: 'BASKET_GROWTH' | 'CHECKOUT_RECOVERY';
    customerName: string;
    amount: number;
    productName: string;
    addonName?: string;
    details: string;
  }): Transaction => {
    const txId = `TX_${activeMerchantId.slice(-4)}_${Date.now().toString().slice(-5)}`;
    const nowIso = new Date().toISOString();

    const newTx: Transaction = {
      id: txId,
      merchantId: activeMerchantId,
      razorpayPaymentId: `pay_test_${Math.random().toString(36).substring(2, 9)}`,
      razorpayOrderId: `order_test_${Math.random().toString(36).substring(2, 9)}`,
      customerId: params.customerName === 'Aarav Mehta' ? 'cust_sports_102' : 'cust_fash_201',
      customerName: params.customerName,
      baseProduct: params.productName,
      baseAmount: params.demoType === 'BASKET_GROWTH' ? 6999 : params.amount,
      aiAddonProduct: params.addonName,
      aiAddonAmount: params.demoType === 'BASKET_GROWTH' ? params.amount : undefined,
      totalAmount: params.demoType === 'BASKET_GROWTH' ? 6999 + params.amount : params.amount,
      aiAttribution: params.demoType === 'BASKET_GROWTH' ? 'AI Cross-sell' : 'AI Checkout Recovery',
      aiAttributedRevenue: params.amount,
      status: 'SUCCESS',
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      paymentMethod: 'UPI'
    };

    setAllTransactions(prev => ({
      ...prev,
      [activeMerchantId]: [newTx, ...(prev[activeMerchantId] || [])]
    }));

    // Update Customer metrics in allCustomers
    setAllCustomers(prev => {
      const list = prev[activeMerchantId] || [];
      const updated = list.map(c => {
        if (c.id === newTx.customerId || c.name === params.customerName) {
          const prevOrders = c.metrics?.totalOrders || 0;
          const prevSpend = c.metrics?.totalSpend || 0;
          const newOrders = prevOrders + 1;
          const newSpend = prevSpend + params.amount;
          const newAOV = Math.round(newSpend / newOrders);
          return {
            ...c,
            lifetimeValue: (c.lifetimeValue || 0) + params.amount,
            status: 'active' as const,
            currentIntent: params.demoType === 'CHECKOUT_RECOVERY' ? 'HIGH_RECOVERY_INTENT' : 'HIGH_PURCHASE_INTENT',
            metrics: {
              totalOrders: newOrders,
              totalSpend: newSpend,
              averageOrderValue: newAOV,
              lastPurchaseAt: nowIso
            },
            behavior: {
              ...c.behavior,
              cartValue: 0,
              cartItems: [],
              hasPurchased: true,
              purchases: [
                ...(c.behavior.purchases || []),
                {
                  orderId: newTx.razorpayOrderId,
                  amount: params.amount,
                  items: [params.productName, ...(params.addonName ? [params.addonName] : [])],
                  timestamp: nowIso,
                  aiRevenue: params.amount
                }
              ]
            }
          };
        }
        return c;
      });
      return { ...prev, [activeMerchantId]: updated };
    });

    if (params.demoType === 'CHECKOUT_RECOVERY') {
      // 1. Growth Supervisor
      recordCanonicalEvent({
        agent: 'SUPERVISOR',
        agentName: 'Growth Supervisor',
        stage: 'OBSERVE',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Growth Supervisor routed abandoned checkout for Priya Sharma to Intent Agent.',
        description: `Customer Priya Sharma added products to cart (₹${params.amount.toLocaleString('en-IN')}) but abandoned checkout before payment.`,
        toolUsed: 'SupervisorSessionRouter',
        policyStatus: 'ALLOWED',
        policyDetails: `Routed customer signal to Customer Intent Agent.`,
        result: 'SUCCESS',
        status: 'info'
      });

      // 2. Intent Agent
      recordCanonicalEvent({
        agent: 'INTENT',
        agentName: 'Customer Intent Agent',
        stage: 'UNDERSTAND',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Intent Agent classified Priya Sharma as HIGH_RECOVERY_INTENT — ₹4,890 cart abandoned before payment.',
        description: `Detected checkout abandonment — cart ₹${params.amount.toLocaleString('en-IN')}, payment not completed.`,
        toolUsed: 'CartAbandonmentDetector',
        policyStatus: 'ALLOWED',
        policyDetails: `Classified as HIGH_RECOVERY_INTENT. Routed to Revenue Recovery Agent.`,
        result: 'SUCCESS',
        status: 'info'
      });

      // 3. Recovery Agent
      recordCanonicalEvent({
        agent: 'RECOVERY',
        agentName: 'Revenue Recovery Agent',
        stage: 'RECOMMEND',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Recovery Agent recommended a Razorpay recovery payment link for ₹4,890.',
        description: `Customer showed purchase intent but exited before payment.`,
        toolUsed: 'RazorpaySmartLinkGenerator',
        policyStatus: 'ALLOWED',
        policyDetails: `Generated recovery action within merchant recovery limits.`,
        result: 'SUCCESS',
        status: 'info'
      });

      // 4. Policy & Risk Agent
      recordCanonicalEvent({
        agent: 'POLICY',
        agentName: 'Policy & Risk Agent',
        stage: 'POLICY',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Policy Agent approved recovery action — within merchant recovery limits.',
        description: `POLICY: ALLOWED · RESULT: APPROVED. Recovery payment link verified within merchant policy limits.`,
        toolUsed: 'PolicyGuard',
        policyStatus: 'ALLOWED',
        policyDetails: `Recovery payment link is within allowed limits. POLICY: ALLOWED · RESULT: APPROVED.`,
        result: 'APPROVED',
        status: 'success'
      });

      // 5. Commerce Execution Agent (Action)
      recordCanonicalEvent({
        agent: 'COMMERCE',
        agentName: 'Commerce Execution Agent',
        stage: 'ACTION',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Commerce Agent generated Razorpay Test Mode recovery checkout for ₹4,890.',
        description: `Commerce Agent prepared Razorpay Test Mode recovery checkout — ₹${params.amount.toLocaleString('en-IN')}.`,
        toolUsed: 'RazorpayOrderAPI',
        policyStatus: 'ALLOWED',
        policyDetails: `Executed in Razorpay Test Mode under ${activeMerchant.name} policies.`,
        result: 'SUCCESS',
        status: 'success'
      });

      // 6. Commerce Execution Agent (Capture)
      recordCanonicalEvent({
        agent: 'COMMERCE',
        agentName: 'Commerce Execution Agent',
        stage: 'RESULT',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Commerce Agent captured ₹4,890 in Razorpay Test Mode — checkout recovery successful.',
        description: `Settled ₹${params.amount.toLocaleString('en-IN')} recovered revenue in Razorpay Test Mode. Recorded in Activity and Audit Trail.`,
        toolUsed: 'RazorpayPaymentCapture',
        policyStatus: 'ALLOWED',
        policyDetails: `Captured in Razorpay Test Mode sandbox. Ledger updated with ₹4,890 recovered revenue.`,
        result: 'SUCCESS',
        status: 'success'
      });

      // Mark Priya Sharma opportunity as RECOVERED / SUCCESS (completed)
      setAllOpportunities(prev => {
        const currentList = prev[activeMerchantId] || [];
        const updated = currentList.map(opp => {
          if (opp.customerName === 'Priya Sharma' || opp.type === 'checkout_recovery') {
            return {
              ...opp,
              status: 'completed' as const,
              reviewedAt: nowIso
            };
          }
          return opp;
        });
        return {
          ...prev,
          [activeMerchantId]: updated
        };
      });
    } else {
      // 1. Record Commerce Agent Action (Basket Growth)
      recordCanonicalEvent({
        agent: 'COMMERCE',
        agentName: 'Commerce Execution Agent',
        stage: 'ACTION',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: 'Commerce Agent generated 1-click test checkout',
        description: params.details,
        toolUsed: 'RazorpayOrderAPI',
        policyStatus: 'ALLOWED',
        policyDetails: `Executed in Razorpay Test Mode under ${activeMerchant.name} policies.`,
        result: 'SUCCESS',
        status: 'success'
      });

      // 2. Record Commerce Agent Payment Capture & Settlement (Basket Growth)
      recordCanonicalEvent({
        agent: 'COMMERCE',
        agentName: 'Commerce Execution Agent',
        stage: 'RESULT',
        customerId: newTx.customerId,
        customerName: params.customerName,
        title: `Captured ₹${newTx.totalAmount.toLocaleString('en-IN')} in Razorpay Test Mode`,
        description: `Captured ₹${params.amount.toLocaleString('en-IN')} AI cross-sell uplift on ${params.productName} + ${params.addonName}.`,
        toolUsed: 'RazorpayPaymentCapture',
        policyStatus: 'ALLOWED',
        policyDetails: `Captured in Razorpay Sandbox. Ledger updated with attribution.`,
        result: 'SUCCESS',
        status: 'success'
      });
    }

    // Update Stats consistently
    setMerchants(prev => prev.map(m => {
      if (m.id === activeMerchantId) {
        return {
          ...m,
          stats: {
            ...m.stats,
            revenueGenerated: m.stats.revenueGenerated + params.amount,
            aiAttributedRevenue: m.stats.aiAttributedRevenue + params.amount,
            actionsToday: m.stats.actionsToday + 1,
            successfulActions: m.stats.successfulActions + 1
          }
        };
      }
      return m;
    }));

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (e) {}

    const successMsg = params.demoType === 'CHECKOUT_RECOVERY'
      ? `Checkout recovery completed: +₹${params.amount.toLocaleString('en-IN')} recovered for ${activeMerchant.name}.`
      : `Collaboration completed: +₹${params.amount.toLocaleString('en-IN')} attributed to ${activeMerchant.name}.`;

    addNotification(successMsg, 'success');
    return newTx;
  };

  const approveCampaign = (id: string) => {
    addNotification('Campaign approved.', 'success');
  };

  const executeCampaign = (id: string) => {
    addNotification('Campaign executed in Razorpay Test Mode.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,

        authRole,
        isAuthenticated,
        loginAsCustomer,
        loginAsAdmin,
        logout,
        openStorefront,
        openOrders,
        exitStorefront,
        previousAdminScreen,

        merchants,
        activeMerchantId,
        activeMerchant,
        setActiveMerchantId,
        createMerchant,
        updateMerchantPolicy,

        products,
        customers,
        allCustomers,
        opportunities,
        campaigns: [],
        transactions,
        auditLogs,
        activityStream,
        agentStats,
        policy,
        recordCanonicalEvent,

        currentCustomer,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        customerAuthMode,
        setCustomerAuthMode,
        openCustomerAuth,
        closeCustomerAuth,
        signUpCustomer,
        signInCustomer,
        signOutCustomer,
        recordCustomerShoppingEvent,
        updateCustomer,

        addProduct,
        updateProduct,
        archiveProduct,
        importProductsCsv,

        agents,
        collaborationEvents,
        tasks,
        selectedAgentForDetail,
        openAgentDetailDrawer,
        isAgentDetailDrawerOpen,
        setIsAgentDetailDrawerOpen,
        openAgentTraceModal,
        isAgentTraceModalOpen,
        setIsAgentTraceModalOpen,

        selectedOpportunity,
        openReasoningDrawer,
        isReasoningDrawerOpen,
        setIsReasoningDrawerOpen,
        approveOpportunity,
        rejectOpportunity,

        selectedSimulationOpportunity,
        isCustomerSimulationOpen,
        openCustomerSimulation,
        closeCustomerSimulation,
        simulationStageMap,
        setCustomerSimulationStage,

        selectedProduct,
        openProductProfileModal,
        isProductProfileModalOpen,
        setIsProductProfileModalOpen,
        selectedProductForEdit,
        openProductEditModal,
        isProductEditModalOpen,
        setIsProductEditModalOpen,

        isCreateMerchantModalOpen,
        setIsCreateMerchantModalOpen,

        isRazorpayModalOpen,
        setIsRazorpayModalOpen,
        checkoutItem,
        recommendedAddon,
        recoveryDetails,
        openCheckout,
        openRecoveryCheckout,
        completeCheckout,
        completeRecoveryCheckout,
        recordRecoveryPaymentFailure,

        isSimulationModalOpen,
        setIsSimulationModalOpen,
        simulationProgress,
        startBatchSimulation,
        resetSimulationState,

        triggerAaravStory,
        triggerPriyaStory,
        recordLiveDemoCompletion,

        approveCampaign,
        executeCampaign,

        globalSearchQuery,
        setGlobalSearchQuery,

        notifications,
        dismissNotification,
        addNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

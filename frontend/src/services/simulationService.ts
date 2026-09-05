import { Opportunity, AgentActivityItem, AuditLog } from '../types';

export interface SimulationStep {
  step: number;
  totalSteps: number;
  customerName: string;
  category: string;
  actionSummary: string;
  type: 'upsell' | 'cross_sell' | 'checkout_recovery' | 'campaign' | 'policy_warning';
  revenueImpact: number;
  confidence: number;
  policyStatus: 'AUTO_PASSED' | 'REQUIRES_APPROVAL' | 'BLOCKED';
}

export const SIMULATION_BATCH_DATA: SimulationStep[] = [
  {
    step: 1,
    totalSteps: 20,
    customerName: 'Kavita Menon',
    category: 'Running Shoes',
    actionSummary: 'Upsell to Carbon-fiber Velocity Runner X Pro (+₹1,500)',
    type: 'upsell',
    revenueImpact: 1500,
    confidence: 96,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 2,
    totalSteps: 20,
    customerName: 'Dev Patel',
    category: 'Electronics Accessories',
    actionSummary: 'Cross-sell 9H DiamondEdge Screen Protector at checkout (+₹799)',
    type: 'cross_sell',
    revenueImpact: 799,
    confidence: 94,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 3,
    totalSteps: 20,
    customerName: 'Sneha Roy',
    category: 'Apparel',
    actionSummary: 'Cart recovery trigger for ₹3,450 cart abandoned 18 mins ago',
    type: 'checkout_recovery',
    revenueImpact: 3450,
    confidence: 91,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 4,
    totalSteps: 20,
    customerName: 'Manish Gupta',
    category: 'Running Shoes',
    actionSummary: 'Cross-sell Pro Dynamic Running Socks 3-Pack (+₹799)',
    type: 'cross_sell',
    revenueImpact: 799,
    confidence: 93,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 5,
    totalSteps: 20,
    customerName: 'Pooja Hegde',
    category: 'Workstation',
    actionSummary: 'Upsell Dual-Arm Monitor Stand (+₹2,200)',
    type: 'upsell',
    revenueImpact: 2200,
    confidence: 89,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 6,
    totalSteps: 20,
    customerName: 'Arjun Singhania',
    category: 'Audio Gear',
    actionSummary: 'Cart recovery for Noise-Cancelling Pro Earbuds (₹8,999)',
    type: 'checkout_recovery',
    revenueImpact: 8999,
    confidence: 95,
    policyStatus: 'REQUIRES_APPROVAL'
  },
  {
    step: 7,
    totalSteps: 20,
    customerName: 'Tanvi Joshi',
    category: 'Fitness Apparel',
    actionSummary: 'Cross-sell Ergonomic Hydration Flask 500ml (+₹999)',
    type: 'cross_sell',
    revenueImpact: 999,
    confidence: 92,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 8,
    totalSteps: 20,
    customerName: 'Karan Mehra',
    category: 'Running Shoes',
    actionSummary: 'Upsell Speedwork Racing Flat Upgrade (+₹1,800)',
    type: 'upsell',
    revenueImpact: 1800,
    confidence: 95,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 9,
    totalSteps: 20,
    customerName: 'Bhavna Kulkarni',
    category: 'Electronics',
    actionSummary: 'Cart recovery for MagSafe Wireless Charging Hub (₹2,799)',
    type: 'checkout_recovery',
    revenueImpact: 2799,
    confidence: 90,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 10,
    totalSteps: 20,
    customerName: 'Siddharth Rao',
    category: 'Running Shoes',
    actionSummary: 'Upsell High-Mileage Endurance Bundle (+₹2,499)',
    type: 'upsell',
    revenueImpact: 2499,
    confidence: 94,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 11,
    totalSteps: 20,
    customerName: 'Cohort: Marathon Prep',
    category: 'Catalog Campaign',
    actionSummary: 'Generate automated Razorpay Smart Link campaign for 1,200 runners',
    type: 'campaign',
    revenueImpact: 98000,
    confidence: 93,
    policyStatus: 'REQUIRES_APPROVAL'
  },
  {
    step: 12,
    totalSteps: 20,
    customerName: 'Neha Bhattacharya',
    category: 'Electronics',
    actionSummary: 'Cross-sell Kevlar Cable 100W Fast-Charging (+₹699)',
    type: 'cross_sell',
    revenueImpact: 699,
    confidence: 91,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 13,
    totalSteps: 20,
    customerName: 'Zubair Khan',
    category: 'Footwear',
    actionSummary: 'Upsell Orthopedic Memory Insole Kit (+₹899)',
    type: 'upsell',
    revenueImpact: 899,
    confidence: 90,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 14,
    totalSteps: 20,
    customerName: 'Aishwarya Nair',
    category: 'Electronics',
    actionSummary: 'Cart recovery for UltraSlim Leather Sleeve (₹1,999)',
    type: 'checkout_recovery',
    revenueImpact: 1999,
    confidence: 88,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 15,
    totalSteps: 20,
    customerName: 'Gaurav Aggarwal',
    category: 'Tech Accessories',
    actionSummary: 'Cross-sell Camera Lens Protector 3-Pack (+₹499)',
    type: 'cross_sell',
    revenueImpact: 499,
    confidence: 96,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 16,
    totalSteps: 20,
    customerName: 'Ritu Varma',
    category: 'Running Gear',
    actionSummary: 'Upsell Reflective Night-Runner Safety Vest (+₹1,299)',
    type: 'upsell',
    revenueImpact: 1299,
    confidence: 92,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 17,
    totalSteps: 20,
    customerName: 'Cohort: Tech Upgrades',
    category: 'Segment Campaign',
    actionSummary: 'Automated 1-click Razorpay payment link dispatch to 850 VIPs',
    type: 'campaign',
    revenueImpact: 64000,
    confidence: 91,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 18,
    totalSteps: 20,
    customerName: 'Harish Choudhury',
    category: 'Footwear',
    actionSummary: 'Upsell Pro Trail Edition Waterproofing (+₹1,499)',
    type: 'upsell',
    revenueImpact: 1499,
    confidence: 93,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 19,
    totalSteps: 20,
    customerName: 'Divya Nambiar',
    category: 'Apparel',
    actionSummary: 'Upsell 2-Pack Performance Tank Bundle (+₹1,199)',
    type: 'upsell',
    revenueImpact: 1199,
    confidence: 94,
    policyStatus: 'AUTO_PASSED'
  },
  {
    step: 20,
    totalSteps: 20,
    customerName: 'Tarun Bansal',
    category: 'High Value Checkout',
    actionSummary: 'Flagged 35% discount requested — Blocked by Merchant Policy Guard',
    type: 'policy_warning',
    revenueImpact: 0,
    confidence: 98,
    policyStatus: 'BLOCKED'
  }
];

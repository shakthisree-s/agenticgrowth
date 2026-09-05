import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_vel_01',
    name: 'Velocity Runner X',
    price: 6999,
    originalPrice: 8499,
    currency: 'INR',
    availability: true,
    stockCount: 42,
    category: 'Running Shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Lightweight carbon-infused running shoe engineered for high-cadence daily road training and half-marathon pacing.',
    features: [
      'Carbon-fiber infused propulsive plate',
      'Breathable engineered micro-mesh upper',
      'Dual-density nitrogen-infused foam',
      'Targeted rubber high-abrasion outsole'
    ],
    aiBuyerTags: ['Running', 'Lightweight', 'Men', 'Women', 'Daily Training', '₹5K–₹8K', 'High-Cadence', 'Marathon-Prep'],
    suitableFor: ['daily-training', 'long-distance', 'tempo-runs', 'road-running'],
    crossSellAffinity: [
      {
        productId: 'prod_socks_01',
        productName: 'Pro Dynamic Running Socks (3-Pack)',
        affinityScore: 0.94,
        price: 799,
        reason: '78% of Velocity Runner buyers add anti-blister compression socks.'
      },
      {
        productId: 'prod_foam_01',
        productName: 'Deep Recovery Foam Roller',
        affinityScore: 0.82,
        price: 1299,
        reason: 'Frequently bundled for post-run muscle recovery.'
      }
    ],
    priceElasticityScore: 0.76,
    purchaseEligibility: 'Instant checkout ready in Razorpay Test Mode with automated bundle uplift.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'Velocity Runner X',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      description: 'Lightweight running shoe designed for daily training and long-distance comfort.',
      brand: { '@type': 'Brand', name: 'UrbanKart Velocity' },
      sku: 'UK-RUN-VEL-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 6999,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['daily-training', 'long-distance'],
        intent_cluster: 'running_endurance',
        upsell_target_id: 'prod_vel_pro_02',
        cross_sell_candidate_ids: ['prod_socks_01', 'prod_foam_01'],
        max_dynamic_discount_pct: 12
      }
    }
  },
  {
    id: 'prod_swift_02',
    name: 'SwiftRun Pro Max',
    price: 5999,
    originalPrice: 6999,
    currency: 'INR',
    availability: true,
    stockCount: 18,
    category: 'Running Shoes',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Ultra-cushioned stability shoe ideal for entry-to-intermediate runners seeking maximum joint protection.',
    features: [
      'Extra-wide ergonomic toe box',
      'High-rebound EVA sole',
      'Reflective nocturnal accents',
      'Orthopedic arch support'
    ],
    aiBuyerTags: ['Running', 'Cushioned', 'Stability', 'Daily Training', 'Entry-Level', 'Under-6k'],
    suitableFor: ['recovery-runs', 'daily-jogging', 'gym-cardio', 'walking'],
    crossSellAffinity: [
      {
        productId: 'prod_socks_01',
        productName: 'Pro Dynamic Running Socks (3-Pack)',
        affinityScore: 0.88,
        price: 799,
        reason: 'Recommended for arch blister prevention.'
      }
    ],
    priceElasticityScore: 0.81,
    purchaseEligibility: 'Ready for autonomous cross-sell recommendation in Razorpay Test Mode.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'SwiftRun Pro Max',
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
      description: 'Ultra-cushioned stability shoe for high impact absorption.',
      brand: { '@type': 'Brand', name: 'UrbanKart Swift' },
      sku: 'UK-RUN-SWF-02',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 5999,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['recovery-runs', 'daily-jogging'],
        intent_cluster: 'cushion_comfort',
        upsell_target_id: 'prod_vel_01',
        cross_sell_candidate_ids: ['prod_socks_01'],
        max_dynamic_discount_pct: 10
      }
    }
  },
  {
    id: 'prod_aero_03',
    name: 'AeroFlex Marathon Ultra',
    price: 8499,
    originalPrice: 9999,
    currency: 'INR',
    availability: true,
    stockCount: 12,
    category: 'Running Shoes',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Elite race-day shoe with full-length carbon propulsion rocker designed for sub-3 marathon attempts.',
    features: [
      'Full curved rigid carbon plate',
      'PEBA ultralight energy-return foam',
      'Featherweight 178g chassis',
      'Laser-perforated competition upper'
    ],
    aiBuyerTags: ['Racing', 'Marathon', 'Carbon-Plate', 'Elite', 'Fast-Paced'],
    suitableFor: ['race-day', 'marathon-pace', 'track-intervals', 'sub-3-attempts'],
    crossSellAffinity: [
      {
        productId: 'prod_foam_01',
        productName: 'Deep Recovery Foam Roller',
        affinityScore: 0.91,
        price: 1299,
        reason: 'Essential post-race fascial release bundle.'
      }
    ],
    priceElasticityScore: 0.65,
    purchaseEligibility: 'Ready for 1-click Razorpay Test Mode checkout.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'AeroFlex Marathon Ultra',
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
      description: 'Elite racing shoe with full carbon plate.',
      brand: { '@type': 'Brand', name: 'UrbanKart Aero' },
      sku: 'UK-RUN-AERO-03',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 8499,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['race-day', 'marathon-pace'],
        intent_cluster: 'elite_racing',
        cross_sell_candidate_ids: ['prod_foam_01'],
        max_dynamic_discount_pct: 8
      }
    }
  },
  {
    id: 'prod_socks_01',
    name: 'Pro Dynamic Running Socks (3-Pack)',
    price: 799,
    originalPrice: 999,
    currency: 'INR',
    availability: true,
    stockCount: 150,
    category: 'Accessories & Apparel',
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Anti-blister seamless compression socks engineered specifically for long-distance endurance runners.',
    features: [
      'Targeted arch compression band',
      'CoolMax moisture-wicking synthetic fiber',
      'Seamless friction-free toe box',
      'Reinforced heel cushion zone'
    ],
    aiBuyerTags: ['Accessories', 'Socks', 'Anti-Blister', 'Compression', 'Bundle-Addon', 'Under-1k'],
    suitableFor: ['daily-training', 'long-distance', 'blister-prevention'],
    crossSellAffinity: [],
    priceElasticityScore: 0.92,
    purchaseEligibility: 'High-affinity 1-click bundle add-on for footwear checkout.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'Pro Dynamic Running Socks (3-Pack)',
      image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600',
      description: 'Anti-blister compression running socks 3-pack.',
      brand: { '@type': 'Brand', name: 'UrbanKart Active' },
      sku: 'UK-ACC-SCK-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 799,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['daily-training', 'blister-prevention'],
        intent_cluster: 'accessories_cross_sell',
        cross_sell_candidate_ids: [],
        max_dynamic_discount_pct: 15
      }
    }
  },
  {
    id: 'prod_foam_01',
    name: 'Deep Recovery High-Density Foam Roller',
    price: 1299,
    originalPrice: 1699,
    currency: 'INR',
    availability: true,
    stockCount: 60,
    category: 'Accessories & Apparel',
    image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Grid-textured trigger point muscle massager for IT band and calf tightness relief.',
    features: [
      'Multi-density grid matrix',
      'Rigid hollow core construction',
      'Sweat-resistant EVA outer shell',
      'Compact 33cm travel length'
    ],
    aiBuyerTags: ['Recovery', 'Mobility', 'Muscle-Relief', 'Bundle-Addon'],
    suitableFor: ['post-workout', 'it-band-release', 'hamstring-tightness'],
    crossSellAffinity: [],
    priceElasticityScore: 0.85,
    purchaseEligibility: 'Ready for automated post-checkout upsell.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'Deep Recovery High-Density Foam Roller',
      image: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=600',
      description: 'High-density foam roller for deep muscle recovery.',
      brand: { '@type': 'Brand', name: 'UrbanKart Recovery' },
      sku: 'UK-ACC-FMR-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 1299,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['post-workout', 'muscle-relief'],
        intent_cluster: 'recovery_accessories',
        cross_sell_candidate_ids: [],
        max_dynamic_discount_pct: 12
      }
    }
  },
  {
    id: 'prod_case_01',
    name: 'MagShield Kevlar Phone Case (iPhone 15 Pro)',
    price: 1499,
    originalPrice: 1999,
    currency: 'INR',
    availability: true,
    stockCount: 85,
    category: 'Tech Accessories',
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Aerospace-grade 600D Aramid fiber case with embedded high-strength MagSafe magnetic ring array.',
    features: [
      'Genuine 600D Kevlar / Aramid fiber weave',
      'Ultra-thin 0.85mm featherweight profile',
      'Military grade 10ft drop tested protection',
      'Integrated N52 neodymium magnetic ring'
    ],
    aiBuyerTags: ['Electronics', 'iPhone 15 Pro', 'Phone Case', 'MagSafe', 'Kevlar'],
    suitableFor: ['daily-protection', 'wireless-charging', 'minimalist-gadgets'],
    crossSellAffinity: [
      {
        productId: 'prod_screen_01',
        productName: '9H DiamondEdge Screen Protector',
        affinityScore: 0.92,
        price: 799,
        reason: '92% of Kevlar case buyers add 9H tempered screen protection.'
      }
    ],
    priceElasticityScore: 0.88,
    purchaseEligibility: 'Ready for 1-click Razorpay Test Mode checkout.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'MagShield Kevlar Phone Case (iPhone 15 Pro)',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600',
      description: 'Aerospace-grade Kevlar case with MagSafe compatibility.',
      brand: { '@type': 'Brand', name: 'UrbanKart Shield' },
      sku: 'UK-TECH-CASE-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 1499,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['daily-protection', 'wireless-charging'],
        intent_cluster: 'phone_accessories',
        cross_sell_candidate_ids: ['prod_screen_01'],
        max_dynamic_discount_pct: 15
      }
    }
  },
  {
    id: 'prod_screen_01',
    name: '9H DiamondEdge Screen Protector',
    price: 799,
    originalPrice: 999,
    currency: 'INR',
    availability: true,
    stockCount: 110,
    category: 'Tech Accessories',
    image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'Edge-to-edge shatterproof tempered glass with oleophobic anti-fingerprint coating.',
    features: [
      '9H hardness scratch-resistant tempered glass',
      'Oleophobic nano-coating prevents fingerprints',
      'TrueTouch high-sensitivity glass',
      'Easy alignment tray included'
    ],
    aiBuyerTags: ['Electronics', 'Screen-Protector', 'iPhone 15 Pro', 'Cross-Sell'],
    suitableFor: ['screen-protection', 'scratch-resistance'],
    crossSellAffinity: [],
    priceElasticityScore: 0.94,
    purchaseEligibility: 'Instant checkout cross-sell item.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: '9H DiamondEdge Screen Protector',
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600',
      description: 'Edge-to-edge 9H tempered glass screen protector.',
      brand: { '@type': 'Brand', name: 'UrbanKart Shield' },
      sku: 'UK-TECH-SCR-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 799,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['screen-protection'],
        intent_cluster: 'screen_protection',
        cross_sell_candidate_ids: [],
        max_dynamic_discount_pct: 15
      }
    }
  },
  {
    id: 'prod_stand_01',
    name: 'UltraSlim Ergonomic Aluminum Laptop Stand',
    price: 3499,
    originalPrice: 4299,
    currency: 'INR',
    availability: true,
    stockCount: 30,
    category: 'Workstation Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    aiSummary: 'CNC-machined anodized aluminum foldaway laptop riser designed for posture alignment and thermal cooling.',
    features: [
      'Precision CNC anodized aerospace aluminum',
      'Dual-axis stepless height & tilt adjustment',
      'Open-back ventilated airflow cooling design',
      'Non-slip silicone grip pads'
    ],
    aiBuyerTags: ['Workstation', 'Desk Setup', 'Ergonomic', 'Laptop Stand', 'Aluminum'],
    suitableFor: ['home-office', 'ergonomic-posture', 'macbook-setup', 'workstation'],
    crossSellAffinity: [],
    priceElasticityScore: 0.82,
    purchaseEligibility: 'Ready for 1-click Razorpay Test Mode checkout.',
    jsonLdSchema: {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: 'UltraSlim Ergonomic Aluminum Laptop Stand',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
      description: 'Ergonomic foldable aluminum laptop stand.',
      brand: { '@type': 'Brand', name: 'UrbanKart Desk' },
      sku: 'UK-DESK-STND-01',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: 3499,
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'Organization', name: 'UrbanKart' }
      },
      agenticCommerce: {
        suitable_for: ['home-office', 'ergonomic-posture'],
        intent_cluster: 'desk_accessories',
        cross_sell_candidate_ids: [],
        max_dynamic_discount_pct: 12
      }
    }
  }
];

export class CatalogService {
  private products: Product[] = INITIAL_PRODUCTS;

  public getAllProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  public getProductsByCategory(category: string): Product[] {
    if (category.toLowerCase() === 'all') return this.products;
    return this.products.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  public searchProducts(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.aiSummary.toLowerCase().includes(q) ||
      p.aiBuyerTags.some(tag => tag.toLowerCase().includes(q)) ||
      p.suitableFor.some(s => s.toLowerCase().includes(q))
    );
  }

  public getCrossSellProducts(productId: string): Product[] {
    const product = this.getProductById(productId);
    if (!product || !product.crossSellAffinity.length) return [];
    const candidateIds = product.crossSellAffinity.map(a => a.productId);
    return this.products.filter(p => candidateIds.includes(p.id));
  }

  public getAiCatalogSchema(): any[] {
    return this.products.map(p => p.jsonLdSchema);
  }
}

export const catalogService = new CatalogService();

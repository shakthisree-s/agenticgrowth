import { Product, Customer } from '../types';

export type RecommendationType = 'cross_sell' | 'upsell' | 'frequently_paired' | 'activity_based';

export interface CustomerActivityContext {
  customerId?: string;
  customerName?: string;
  merchantId: string;
  cartProducts: Product[];
  purchasedProducts: Product[];
  viewedProducts: Product[];
  searchQueries: string[];
  recentInterests: string[];
  budgetPreference?: {
    min?: number;
    max?: number;
  };
}

export interface RecommendationItem {
  product: Product;
  type: RecommendationType;
  headline: string;
  reason: string;
  score: number;
  matchFactors: string[];
}

export interface RecommendationResult {
  primaryRecommendation?: RecommendationItem;
  recommendations: RecommendationItem[];
  contextSummary: string;
  hasStrongRecommendation: boolean;
  message: string;
}

// Known complementary category pair affinities across domains
const COMPLEMENTARY_CATEGORY_PAIRS: [string, string, number, string][] = [
  // Sports Domain
  ['running shoes', 'socks', 35, 'Pairs with your running shoes to prevent blisters on daily runs.'],
  ['running shoes', 'accessories & apparel', 25, 'Essential running accessories for your training kit.'],
  ['running shoes', 'recovery gear', 25, 'High-affinity post-run recovery gear.'],
  ['running shoes', 'hydration', 25, 'Essential on-the-run hydration gear.'],
  ['hydration', 'running shoes', 25, 'Complete your running setup.'],
  ['hydration', 'accessories & apparel', 30, 'Pairs with your hydration setup.'],
  ['recovery gear', 'running shoes', 25, 'Complements your endurance running kit.'],
  ['headwear', 'running shoes', 25, 'Sun protection for outdoor runs.'],

  // Fashion Domain
  ['kurtis', 'dupattas', 40, 'Matching coordinated dupatta to complete your ethnic ensemble.'],
  ['kurtis', 'palazzos', 35, 'Matching wide-leg cotton palazzo pants.'],
  ['ethnic wear', 'bottom wear', 35, 'Pairs with your ethnic top for a complete outfit.'],
  ['ethnic wear', 'dupattas', 35, 'Coordinating lightweight dupatta.'],
  ['dresses', 'tops & shirts', 30, 'Frequently layered as a chic open shrug/jacket over dresses.'],
  ['western wear', 'accessories', 25, 'Complements your western styling.'],

  // Tech Domain
  ['laptop stands', 'wireless mouse', 40, 'External ergonomic mouse for your elevated laptop setup.'],
  ['workstation accessories', 'tech accessories', 35, 'Enhances your clean desk workstation.'],
  ['phone cases', 'screen protector', 45, 'Complete 360° drop and scratch protection bundle.'],
  ['tech accessories', 'tech accessories', 25, 'Frequently paired device protection.'],
  ['usb_hub', 'laptop stands', 30, 'Multiport connectivity for your laptop desk setup.']
];

export class RecommendationEngine {
  /**
   * Calculates a granular recommendation score for candidate product against context and reference product.
   * Score = category_match + complementary_match + activity_match + purchase_history_match + price_fit + recency
   */
  public scoreCandidate(
    candidate: Product,
    referenceProduct: Product | undefined,
    context: CustomerActivityContext,
    candidatePool: Product[]
  ): { score: number; type: RecommendationType; reason: string; factors: string[] } {
    let score = 0;
    const factors: string[] = [];
    let type: RecommendationType = 'cross_sell';
    let defaultReason = `Recommended addition for your ${referenceProduct?.name || 'session'}.`;

    const candidateCat = (candidate.category + ' ' + (candidate.subcategory || '')).toLowerCase();
    const candidateName = candidate.name.toLowerCase();
    const candidateText = `${candidate.name} ${candidate.category} ${candidate.subcategory || ''} ${(candidate.tags || []).join(' ')} ${(candidate.aiBuyerTags || []).join(' ')} ${(candidate.features || []).join(' ')} ${(candidate.suitableFor || []).join(' ')}`.toLowerCase();

    // 1. Direct Explicit Cross-Sell Affinity Match from Catalog Data (Highest Weight)
    if (referenceProduct && referenceProduct.crossSellAffinity && referenceProduct.crossSellAffinity.length > 0) {
      const explicitAffinity = referenceProduct.crossSellAffinity.find(a => a.productId === candidate.id);
      if (explicitAffinity) {
        const affinityBonus = Math.round(explicitAffinity.affinityScore * 40);
        score += affinityBonus;
        factors.push(`Explicit catalog affinity (${Math.round(explicitAffinity.affinityScore * 100)}%)`);
        defaultReason = explicitAffinity.reason;
        type = 'cross_sell';
      }
    }

    // 2. Complementary Category Relationship
    if (referenceProduct) {
      const refCat = (referenceProduct.category + ' ' + (referenceProduct.subcategory || '')).toLowerCase();

      for (const [catA, catB, weight, reason] of COMPLEMENTARY_CATEGORY_PAIRS) {
        if (
          (refCat.includes(catA) && candidateCat.includes(catB)) ||
          (refCat.includes(catB) && candidateCat.includes(catA))
        ) {
          score += weight;
          factors.push(`Complementary relationship (${catA} ↔ ${catB})`);
          defaultReason = reason;
          type = 'cross_sell';
          break;
        }
      }

      // Check for UPSELL opportunity:
      // Same category/subcategory, higher price (+10% to +80%), and superior features
      const isSameCategory = referenceProduct.category.toLowerCase() === candidate.category.toLowerCase();
      const isHigherPriced = candidate.price > referenceProduct.price && candidate.price <= referenceProduct.price * 1.8;

      if (isSameCategory && isHigherPriced) {
        score += 28;
        factors.push(`Upsell upgrade option (+₹${(candidate.price - referenceProduct.price).toLocaleString('en-IN')})`);
        defaultReason = `Premium upgrade from ${referenceProduct.name} with advanced features.`;
        type = 'upsell';
      }
    }

    // 3. Shared Intent & Semantic Tags Match
    if (referenceProduct) {
      const refTags = [...(referenceProduct.aiBuyerTags || []), ...(referenceProduct.tags || []), ...(referenceProduct.suitableFor || [])].map(t => t.toLowerCase());
      const candTags = [...(candidate.aiBuyerTags || []), ...(candidate.tags || []), ...(candidate.suitableFor || [])].map(t => t.toLowerCase());

      const commonTags = refTags.filter(t => candTags.includes(t) && t.length > 2);
      if (commonTags.length > 0) {
        const tagScore = Math.min(20, commonTags.length * 5);
        score += tagScore;
        factors.push(`Shared tags: ${commonTags.slice(0, 3).join(', ')}`);
      }
    }

    // 4. Customer Activity Context Match (Search Queries & Browsing)
    if (context.searchQueries.length > 0) {
      const recentQueries = context.searchQueries.slice(-4);
      let queryMatchCount = 0;

      for (const q of recentQueries) {
        const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 2);
        for (const w of words) {
          if (candidateText.includes(w)) {
            queryMatchCount++;
          }
        }
      }

      if (queryMatchCount > 0) {
        const actScore = Math.min(25, queryMatchCount * 6);
        score += actScore;
        factors.push(`Activity search match`);
        if (!defaultReason.includes('Pairs') && !defaultReason.includes('Matching')) {
          defaultReason = `Matches your recent search for ${context.searchQueries[context.searchQueries.length - 1]}.`;
          type = 'activity_based';
        }
      }
    }

    // 5. Customer Viewed Products History
    if (context.viewedProducts.length > 0) {
      const isRecentlyViewed = context.viewedProducts.some(p => p.id === candidate.id);
      if (isRecentlyViewed) {
        score += 15;
        factors.push(`Recently viewed item`);
      }
    }

    // 6. Purchase History Synergy
    if (context.purchasedProducts.length > 0) {
      for (const purchased of context.purchasedProducts) {
        const pCat = (purchased.category + ' ' + (purchased.subcategory || '')).toLowerCase();
        for (const [catA, catB, weight, reason] of COMPLEMENTARY_CATEGORY_PAIRS) {
          if (
            (pCat.includes(catA) && candidateCat.includes(catB)) ||
            (pCat.includes(catB) && candidateCat.includes(catA))
          ) {
            score += 18;
            factors.push(`Complements prior purchase of ${purchased.name}`);
            defaultReason = reason || `Pairs with your previous purchase of ${purchased.name}.`;
            break;
          }
        }
      }
    }

    // 7. Price Fit Bonus
    if (referenceProduct && type === 'cross_sell') {
      // Add-ons between 10% and 50% of the main product price are ideal bundle candidates
      const priceRatio = candidate.price / referenceProduct.price;
      if (priceRatio >= 0.08 && priceRatio <= 0.6) {
        score += 10;
        factors.push(`Ideal add-on price ratio (${Math.round(priceRatio * 100)}%)`);
      }
    }

    return {
      score,
      type,
      reason: defaultReason,
      factors
    };
  }

  /**
   * Generates ranked contextual recommendations after a customer adds a product to their cart.
   */
  public getRecommendationsAfterAddToCart(
    addedProduct: Product,
    catalog: Product[],
    context: CustomerActivityContext
  ): RecommendationResult {
    // 1. Filter out candidate items that cannot be recommended:
    // - Exact item currently added
    // - Items already in cart
    // - Archived or Out of Stock items
    const cartIds = new Set(context.cartProducts.map(p => p.id));
    cartIds.add(addedProduct.id);

    const availableCandidates = catalog.filter(p => {
      if (cartIds.has(p.id)) return false;
      if (p.status?.toLowerCase() === 'archived') return false;
      const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
      if (isOutOfStock) return false;
      return true;
    });

    if (availableCandidates.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No other active items in catalog.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    // 2. Score every candidate product
    const scoredList: RecommendationItem[] = availableCandidates.map(candidate => {
      const evaluation = this.scoreCandidate(candidate, addedProduct, context, availableCandidates);
      return {
        product: candidate,
        type: evaluation.type,
        headline: evaluation.type === 'upsell' ? 'Upgrade Option' : 'Complete Your Setup',
        reason: evaluation.reason,
        score: evaluation.score,
        matchFactors: evaluation.factors
      };
    });

    // 3. Filter by minimum relevance threshold (score >= 20)
    const qualified = scoredList
      .filter(item => item.score >= 20)
      .sort((a, b) => b.score - a.score);

    if (qualified.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No high-confidence recommendation found.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    const primary = qualified[0];
    const topRecommendations = qualified.slice(0, 3);

    let messageText = '';
    if (topRecommendations.length === 1) {
      messageText = `Since you added ${addedProduct.name}, you may also like:\n\n${primary.product.name} — ₹${primary.product.price.toLocaleString('en-IN')}\n${primary.reason}`;
    } else {
      messageText = `Complete your ${addedProduct.category.toLowerCase()} setup with these complementary items:`;
    }

    return {
      primaryRecommendation: primary,
      recommendations: topRecommendations,
      contextSummary: `Recommended ${topRecommendations.length} items based on ${addedProduct.name} and customer intent.`,
      hasStrongRecommendation: true,
      message: messageText
    };
  }

  /**
   * Generates contextual recommendations after a customer completes a purchase.
   */
  public getRecommendationsPostPurchase(
    purchasedProduct: Product,
    catalog: Product[],
    context: CustomerActivityContext
  ): RecommendationResult {
    const purchasedIds = new Set(context.purchasedProducts.map(p => p.id));
    purchasedIds.add(purchasedProduct.id);

    const availableCandidates = catalog.filter(p => {
      if (purchasedIds.has(p.id)) return false;
      if (p.status?.toLowerCase() === 'archived') return false;
      const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
      if (isOutOfStock) return false;
      return true;
    });

    if (availableCandidates.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No other active items in catalog.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    const scoredList: RecommendationItem[] = availableCandidates.map(candidate => {
      const evaluation = this.scoreCandidate(candidate, purchasedProduct, context, availableCandidates);
      return {
        product: candidate,
        type: 'frequently_paired',
        headline: 'You May Also Like',
        reason: evaluation.reason,
        score: evaluation.score,
        matchFactors: evaluation.factors
      };
    });

    const qualified = scoredList
      .filter(item => item.score >= 18)
      .sort((a, b) => b.score - a.score);

    if (qualified.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No high-confidence post-purchase recommendation found.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    const primary = qualified[0];
    const topRecommendations = qualified.slice(0, 3);

    return {
      primaryRecommendation: primary,
      recommendations: topRecommendations,
      contextSummary: `Post-purchase recommendations tailored to ${purchasedProduct.name}.`,
      hasStrongRecommendation: true,
      message: `Thank you for your order! Since you purchased ${purchasedProduct.name}, customers also pair these items:`
    };
  }

  /**
   * Generates activity-based recommendations from browsing/search history.
   */
  public getRecommendationsForBrowsing(
    catalog: Product[],
    context: CustomerActivityContext
  ): RecommendationResult {
    const cartOrPurchasedIds = new Set([
      ...context.cartProducts.map(p => p.id),
      ...context.purchasedProducts.map(p => p.id)
    ]);

    const availableCandidates = catalog.filter(p => {
      if (cartOrPurchasedIds.has(p.id)) return false;
      if (p.status?.toLowerCase() === 'archived') return false;
      const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
      if (isOutOfStock) return false;
      return true;
    });

    if (availableCandidates.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No candidates available.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    const reference = context.viewedProducts[context.viewedProducts.length - 1];

    const scoredList: RecommendationItem[] = availableCandidates.map(candidate => {
      const evaluation = this.scoreCandidate(candidate, reference, context, availableCandidates);
      return {
        product: candidate,
        type: 'activity_based',
        headline: 'Recommended for You',
        reason: evaluation.reason,
        score: evaluation.score,
        matchFactors: evaluation.factors
      };
    });

    const qualified = scoredList
      .filter(item => item.score >= 15)
      .sort((a, b) => b.score - a.score);

    if (qualified.length === 0) {
      return {
        recommendations: [],
        contextSummary: 'No browsing recommendation found.',
        hasStrongRecommendation: false,
        message: 'No strong complementary recommendation right now.'
      };
    }

    return {
      primaryRecommendation: qualified[0],
      recommendations: qualified.slice(0, 3),
      contextSummary: 'Activity-based recommendations based on recent customer browsing.',
      hasStrongRecommendation: true,
      message: 'Based on your recent browsing in this store:'
    };
  }
}

export const recommendationEngine = new RecommendationEngine();

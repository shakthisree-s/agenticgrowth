import { Product, MerchantProfile } from '../types';

export interface ParsedShoppingIntent {
  rawQuery: string;
  category?: string;
  normalizedCategory?: string;
  maxPrice?: number;
  minPrice?: number;
  targetKeywords: string[];
  isGeneralQuery: boolean;
}

export interface ShoppingSearchResult {
  status: 'MATCH_FOUND' | 'CATEGORY_NOT_FOUND' | 'PRICE_EXCEEDED' | 'NO_PRODUCTS_UNDER_PRICE' | 'NO_MATCH';
  matchedProducts: Product[];
  primaryProduct?: Product;
  recommendedAddon?: Product;
  responseText: string;
  parsedIntent: ParsedShoppingIntent;
  alternativeSuggestion?: {
    product: Product;
    message: string;
  };
}

// Category synonym mappings for natural language parsing
const CATEGORY_SYNONYMS: Record<string, string[]> = {
  'running_shoes': [
    'running shoes', 'running shoe', 'shoes', 'shoe', 'sneakers', 'sneaker',
    'footwear', 'runners', 'runner', 'trainers', 'trainer',
    'marathon shoe', 'marathon shoes', 'kicks', 'jogging shoes'
  ],
  'socks': [
    'socks', 'sock', 'running socks', 'compression socks', 'sports socks', 'footwear accessories'
  ],
  'foam_roller': [
    'foam roller', 'roller', 'foam', 'massager', 'muscle roller', 'recovery roller', 'fitness roller'
  ],
  'phone_case': [
    'phone case', 'phone cover', 'mobile cover', 'mobile case', 'iphone case',
    'iphone cover', 'case', 'cover', 'kevlar case', 'magsafe case', 'back cover',
    'phone accessory', 'phone accessories'
  ],
  'screen_protector': [
    'screen protector', 'screen guard', 'tempered glass', 'screen shield',
    'display guard', 'glass guard', 'tempered protector'
  ],
  'laptop_stand': [
    'laptop stand', 'laptop riser', 'notebook stand', 'desk stand',
    'computer stand', 'ergonomic stand', 'laptop holder', 'macbook stand'
  ],
  'laptop_accessories': [
    'laptop accessories', 'laptop accessory', 'laptop gear', 'laptop setup', 'desk accessories', 'desk gear', 'computer accessories'
  ],
  'kurti': [
    'kurti', 'kurtis', 'kurta', 'kurtas', 'anarkali', 'kurti set', 'kurta set'
  ],
  'dress': [
    'dress', 'dresses', 'gown', 'frock', 'maxi dress', 'midi dress',
    'party dress', 'casual dress', 'casual dresses', 'one piece', 'floral dress'
  ],
  'palazzo': [
    'palazzo', 'palazzos', 'palazzo pants', 'ethnic pants', 'trousers', 'bottom wear'
  ],
  'dupatta': [
    'dupatta', 'dupattas', 'chunni', 'scarf', 'stole', 'shawl'
  ],
  'shirt': [
    'shirt', 'shirts', 't-shirt', 'tshirt', 'top', 'tops', 'linen shirt', 'blouse', 'formal shirt'
  ],
  'mouse': [
    'mouse', 'wireless mouse', 'bluetooth mouse', 'gaming mouse', 'computer mouse', 'pointing device'
  ],
  'laptop_bag': [
    'laptop bag', 'bag', 'laptop sleeve', 'messenger bag', 'backpack', 'sleeves', 'gym bag', 'sports bag'
  ],
  'usb_hub': [
    'usb hub', 'usb-c hub', 'dock', 'adapter', 'dongle', 'port hub', 'multiport adapter'
  ],
  'bottle': [
    'water bottle', 'bottle', 'flask', 'hydration flask', 'sipper'
  ],
  'cap': [
    'cap', 'hat', 'running cap', 'headwear'
  ],
  'sports_accessories': [
    'sports accessories', 'sports accessory', 'fitness accessories', 'workout gear',
    'athletics gear', 'running accessories'
  ],
  'wireless_accessories': [
    'wireless accessories', 'wireless accessory', 'wireless gadget', 'wireless gear'
  ],
  'workspace_accessories': [
    'workspace', 'workspace products', 'workspace accessories', 'desk accessories',
    'office accessories', 'workstation', 'workstation accessories'
  ]
};

/**
 * Dynamically generates 4-5 contextual shopping prompt suggestions
 * based entirely on the currently selected merchant's available catalog.
 */
export function generateShoppingSuggestions(products: Product[], merchant?: MerchantProfile): string[] {
  // Filter active, non-archived, in-stock products
  const activeProducts = products.filter(p => {
    const isArchived = p.status?.toLowerCase() === 'archived';
    const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
    return !isArchived && !isOutOfStock;
  });

  if (activeProducts.length === 0) {
    return [];
  }

  const suggestions: string[] = [];
  const seen = new Set<string>();

  const addSuggestion = (text: string) => {
    const clean = text.trim();
    if (clean && !seen.has(clean.toLowerCase()) && suggestions.length < 5) {
      seen.add(clean.toLowerCase());
      suggestions.push(clean);
    }
  };

  // Group products by category
  const categoriesMap: Record<string, Product[]> = {};
  activeProducts.forEach(p => {
    const cat = p.category;
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(p);
  });

  const categoryNames = Object.keys(categoriesMap);

  // Helper: domain detection
  const isSportsStore = activeProducts.some(p => p.category.toLowerCase().includes('running') || p.category.toLowerCase().includes('sport') || p.category.toLowerCase().includes('athletic'));
  const isFashionStore = activeProducts.some(p => p.category.toLowerCase().includes('fashion') || p.category.toLowerCase().includes('kurti') || p.category.toLowerCase().includes('dress') || p.category.toLowerCase().includes('ethnic'));
  const isTechStore = activeProducts.some(p => p.category.toLowerCase().includes('tech') || p.category.toLowerCase().includes('workspace') || p.category.toLowerCase().includes('electronics') || p.category.toLowerCase().includes('phone'));

  // 1. Primary Category & Contextual Prompts derived from catalog
  if (isSportsStore) {
    addSuggestion('I need running shoes under ₹7,000');
    addSuggestion('Find shoes for daily training');
    addSuggestion('Show me sports accessories');
    addSuggestion('I need something for a marathon');
    addSuggestion('Find products under ₹2,000');
  } else if (isFashionStore) {
    addSuggestion('I need a kurti under ₹1,000');
    addSuggestion('Show me casual dresses');
    addSuggestion('Find something for a party');
    addSuggestion('Show me black outfits');
    addSuggestion('I need something under ₹2,000');
  } else if (isTechStore) {
    addSuggestion('I need a laptop accessory');
    addSuggestion('Show me wireless accessories');
    addSuggestion('Find something under ₹2,000');
    addSuggestion('I need a phone accessory');
    addSuggestion('Show me products for my workspace');
  } else {
    // Custom / Arbitrary Catalog Dynamic Derivation
    for (const cat of categoryNames) {
      const prods = categoriesMap[cat];
      const maxPrice = Math.max(...prods.map(p => p.price));
      const ceiling = Math.ceil(maxPrice / 500) * 500;
      addSuggestion(`I need ${cat.toLowerCase()} under ₹${ceiling.toLocaleString('en-IN')}`);
      if (suggestions.length >= 2) break;
    }

    activeProducts.forEach(p => {
      if (p.suitableFor && p.suitableFor.length > 0) {
        addSuggestion(`Find something for ${p.suitableFor[0].replace(/[-_]/g, ' ')}`);
      }
      addSuggestion(`Show me ${p.name}`);
    });

    const minPrice = Math.min(...activeProducts.map(p => p.price));
    const budgetCeil = Math.ceil(minPrice / 500) * 500 + 500;
    addSuggestion(`Find something under ₹${budgetCeil.toLocaleString('en-IN')}`);
  }

  return suggestions.slice(0, 5);
}

export class ShoppingSearchService {
  /**
   * Parse natural language text into structured intent
   */
  public parseShoppingIntent(query: string): ParsedShoppingIntent {
    const rawQuery = query.trim();
    const lower = rawQuery.toLowerCase();

    // 1. Extract Price Constraints
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    const normalizeAmount = (val: string): number => {
      const clean = val.replace(/,/g, '').trim().toLowerCase();
      if (clean.endsWith('k')) {
        const num = parseFloat(clean.slice(0, -1));
        return Math.round(num * 1000);
      }
      return parseInt(clean, 10);
    };

    // Pattern A: "between X and Y"
    const betweenMatch = lower.match(/between\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)\s*(?:and|to|-)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)/i);
    if (betweenMatch) {
      minPrice = normalizeAmount(betweenMatch[1]);
      maxPrice = normalizeAmount(betweenMatch[2]);
    } else {
      // Pattern B: "under / below / less than / max / budget of / within / up to X"
      const maxMatch = lower.match(/(?:under|below|less\s+than|within|up\s+to|max(?:imum)?|budget\s*(?:of)?|<=?)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)/i)
        || lower.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)\s*(?:budget|or\s+less|max)/i)
        || lower.match(/under\s*([0-9]+k?)/i);

      if (maxMatch) {
        maxPrice = normalizeAmount(maxMatch[1]);
      }

      // Pattern C: "above / more than / over / min X"
      const minMatch = lower.match(/(?:above|more\s+than|over|min(?:imum)?|>=?)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)/i);
      if (minMatch) {
        minPrice = normalizeAmount(minMatch[1]);
      }

      // Pattern D: "around / approx / near X"
      const aroundMatch = lower.match(/(?:around|approx(?:imately)?|about|near)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?k?)/i);
      if (aroundMatch && !maxPrice && !minPrice) {
        const target = normalizeAmount(aroundMatch[1]);
        maxPrice = Math.round(target * 1.15);
        minPrice = Math.round(target * 0.85);
      }
    }

    // 2. Identify Category & Synonyms
    let matchedCategoryKey: string | undefined;
    let matchedCategoryLabel: string | undefined;

    // Check specific categories first
    const categoryEntries = Object.entries(CATEGORY_SYNONYMS).sort((a, b) => {
      const maxLenA = Math.max(...a[1].map(s => s.length));
      const maxLenB = Math.max(...b[1].map(s => s.length));
      return maxLenB - maxLenA;
    });

    for (const [key, synonyms] of categoryEntries) {
      for (const syn of synonyms) {
        const regex = new RegExp(`\\b${syn.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regex.test(lower)) {
          matchedCategoryKey = key;
          matchedCategoryLabel = syn;
          break;
        }
      }
      if (matchedCategoryKey) break;
    }

    // 3. Extract Target Keywords
    const stopWords = new Set([
      'i', 'need', 'want', 'show', 'me', 'find', 'looking', 'for', 'a', 'an',
      'the', 'under', 'below', 'less', 'than', 'around', 'about', 'within',
      'rs', 'inr', 'rupees', 'bucks', 'something', 'anything', 'good', 'best',
      'please', 'give', 'get', 'buy', 'to', 'with', 'of', 'in', 'is', 'and', 'from'
    ]);

    const targetKeywords = lower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w) && isNaN(Number(w)));

    const isGeneralQuery = !matchedCategoryKey && (
      lower.includes('something') ||
      lower.includes('anything') ||
      lower.includes('what do you have') ||
      lower.includes('show all') ||
      lower.includes('product') ||
      lower.includes('products') ||
      lower.includes('items') ||
      lower.includes('gift') ||
      targetKeywords.length === 0
    );

    return {
      rawQuery,
      category: matchedCategoryLabel || (isGeneralQuery ? undefined : targetKeywords.join(' ')),
      normalizedCategory: matchedCategoryKey,
      maxPrice,
      minPrice,
      targetKeywords,
      isGeneralQuery
    };
  }

  /**
   * Search catalog against parsed intent with multi-stage deterministic constraints
   * Uses ACTIVE merchant's products and merchant metadata
   */
  public searchCatalog(query: string, allProducts: Product[], storeName?: string): ShoppingSearchResult {
    const intent = this.parseShoppingIntent(query);
    const { normalizedCategory, maxPrice, minPrice, category, targetKeywords, isGeneralQuery } = intent;
    const storeLabel = storeName ? `${storeName}'s` : "this store's";

    // Filter out archived and out-of-stock items from customer shopping search
    const activeProducts = allProducts.filter(p => {
      const isArchived = p.status?.toLowerCase() === 'archived';
      const hasNoStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
      return !isArchived && !hasNoStock;
    });

    if (activeProducts.length === 0) {
      return {
        status: 'NO_MATCH',
        matchedProducts: [],
        parsedIntent: intent,
        responseText: `There are currently no active products in ${storeLabel} catalog.`
      };
    }

    // Stage 1: Dynamic Category Matching against current merchant catalog
    let candidateProducts: Product[] = [];

    if (normalizedCategory) {
      const synonyms = CATEGORY_SYNONYMS[normalizedCategory] || [normalizedCategory];
      
      // Check which products in current merchant catalog match these synonyms
      candidateProducts = activeProducts.filter(p => {
        // Exclude socks if looking for shoes
        if (normalizedCategory === 'running_shoes') {
          const isSock = (p.name + ' ' + (p.subcategory || '')).toLowerCase().includes('sock');
          if (isSock) return false;
        }

        // Match category against product name, category, subcategory, tags and aiBuyerTags
        const classificationText = `${p.name} ${p.category} ${p.subcategory || ''} ${(p.tags || []).join(' ')} ${(p.aiBuyerTags || []).join(' ')}`.toLowerCase();

        if (normalizedCategory === 'laptop_accessories') {
          const isLaptopAcc = /laptop|stand|mouse|hub|desk|sleeve|keyboard/i.test(classificationText);
          if (isLaptopAcc) return true;
        }

        return synonyms.some(syn => {
          const reg = new RegExp(`\\b${syn.replace(/\s+/g, '\\s+')}\\b`, 'i');
          return reg.test(classificationText);
        });
      });

      if (candidateProducts.length === 0) {
        // Explicitly report that this merchant catalog does not have this category
        const friendlyName = category || normalizedCategory.replace(/_/g, ' ');
        return {
          status: 'CATEGORY_NOT_FOUND',
          matchedProducts: [],
          parsedIntent: intent,
          responseText: `I couldn't find any ${friendlyName} in ${storeLabel} catalog. Please explore items available in our store or ask for another category.`
        };
      }
    } else if (isGeneralQuery) {
      // General query with no specific category
      candidateProducts = [...activeProducts];
    } else if (targetKeywords.length > 0) {
      // Match keywords against product attributes in current catalog
      candidateProducts = activeProducts.filter(p => {
        const textToSearch = `${p.name} ${p.category} ${p.subcategory || ''} ${p.description || ''} ${p.aiSummary || ''} ${(p.features || []).join(' ')} ${(p.aiBuyerTags || []).join(' ')} ${(p.suitableFor || []).join(' ')} ${(p.tags || []).join(' ')}`.toLowerCase().replace(/[-_]/g, ' ');
        return targetKeywords.some(kw => textToSearch.includes(kw));
      });

      if (candidateProducts.length === 0) {
        return {
          status: 'NO_MATCH',
          matchedProducts: [],
          parsedIntent: intent,
          responseText: `I couldn't find any products matching "${targetKeywords.join(' ')}" in ${storeLabel} catalog.`
        };
      }
    } else {
      candidateProducts = [...activeProducts];
    }

    // Stage 2: Strict Price Filtering
    let priceFilteredProducts = [...candidateProducts];

    if (maxPrice !== undefined) {
      priceFilteredProducts = priceFilteredProducts.filter(p => p.price <= maxPrice);
    }

    if (minPrice !== undefined) {
      priceFilteredProducts = priceFilteredProducts.filter(p => p.price >= minPrice);
    }

    // Stage 3: Handle Zero Results due to Price Bounds
    if (priceFilteredProducts.length === 0) {
      if ((normalizedCategory || category) && !isGeneralQuery && candidateProducts.length > 0) {
        const lowestInCat = [...candidateProducts].sort((a, b) => a.price - b.price)[0];
        const categoryLabel = category || (normalizedCategory ? normalizedCategory.replace(/_/g, ' ') : 'items in this category');

        return {
          status: 'PRICE_EXCEEDED',
          matchedProducts: [],
          parsedIntent: intent,
          alternativeSuggestion: {
            product: lowestInCat,
            message: `The lowest-priced option in ${categoryLabel} is ${lowestInCat.name} at ₹${lowestInCat.price.toLocaleString('en-IN')}.`
          },
          responseText: `No ${categoryLabel} found under ₹${maxPrice?.toLocaleString('en-IN') || ''} in ${storeLabel} catalog. The lowest-priced option is ${lowestInCat.name} at ₹${lowestInCat.price.toLocaleString('en-IN')}.`
        };
      }

      const lowestOverall = activeProducts.length > 0 ? [...activeProducts].sort((a, b) => a.price - b.price)[0] : undefined;
      return {
        status: 'NO_PRODUCTS_UNDER_PRICE',
        matchedProducts: [],
        parsedIntent: intent,
        alternativeSuggestion: lowestOverall ? {
          product: lowestOverall,
          message: `Our lowest-priced items start at ₹${lowestOverall.price.toLocaleString('en-IN')} (${lowestOverall.name}).`
        } : undefined,
        responseText: lowestOverall 
          ? `No products found under ₹${maxPrice?.toLocaleString('en-IN') || ''} in ${storeLabel} catalog. Our lowest-priced items start at ₹${lowestOverall.price.toLocaleString('en-IN')} (${lowestOverall.name}).`
          : `No products available under ₹${maxPrice?.toLocaleString('en-IN') || ''} in ${storeLabel} catalog.`
      };
    }

    // Stage 4: Relevance Ranking
    const rankedProducts = [...priceFilteredProducts].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      targetKeywords.forEach(kw => {
        if (a.name.toLowerCase().includes(kw)) scoreA += 10;
        if (b.name.toLowerCase().includes(kw)) scoreB += 10;
        if ((a.aiBuyerTags || a.tags || []).some(t => t.toLowerCase().includes(kw))) scoreA += 4;
        if ((b.aiBuyerTags || b.tags || []).some(t => t.toLowerCase().includes(kw))) scoreB += 4;
        if ((a.suitableFor || []).some(s => s.toLowerCase().includes(kw))) scoreA += 5;
        if ((b.suitableFor || []).some(s => s.toLowerCase().includes(kw))) scoreB += 5;
      });

      if (maxPrice !== undefined) {
        const diffA = maxPrice - a.price;
        const diffB = maxPrice - b.price;
        if (diffA < diffB) scoreA += 2;
        else if (diffB < diffA) scoreB += 2;
      }

      return scoreB - scoreA;
    });

    const primaryProduct = rankedProducts[0];
    
    // Find cross-sell add-on from Merchandising affinity in active catalog
    let recommendedAddon: Product | undefined;
    if (primaryProduct.crossSellAffinity && primaryProduct.crossSellAffinity.length > 0) {
      const addonId = primaryProduct.crossSellAffinity[0].productId;
      recommendedAddon = activeProducts.find(p => p.id === addonId);
    }

    // Stage 5: Formulate Conversational Response Text
    let responseText = '';
    const categoryName = category || (normalizedCategory ? normalizedCategory.replace(/_/g, ' ') : (isGeneralQuery ? 'item' : 'product'));
    const priceLimitText = maxPrice ? ` under ₹${maxPrice.toLocaleString('en-IN')}` : '';

    if (rankedProducts.length === 1) {
      responseText = `Found 1 ${categoryName}${priceLimitText}: ${primaryProduct.name} (₹${primaryProduct.price.toLocaleString('en-IN')}).`;
    } else {
      responseText = `Found ${rankedProducts.length} ${categoryName}${categoryName.endsWith('s') ? '' : 's'} ${priceLimitText}:`;
    }

    return {
      status: 'MATCH_FOUND',
      matchedProducts: rankedProducts,
      primaryProduct,
      recommendedAddon,
      parsedIntent: intent,
      responseText
    };
  }
}

export const shoppingSearchService = new ShoppingSearchService();

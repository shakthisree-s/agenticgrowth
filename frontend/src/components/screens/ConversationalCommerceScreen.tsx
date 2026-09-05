import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { shoppingSearchService, ShoppingSearchResult, generateShoppingSuggestions } from '../../services/shoppingSearchService';
import { recommendationEngine, RecommendationItem, CustomerActivityContext } from '../../services/recommendationEngine';
import { Lock, Sparkles, Send, Trash2, ArrowUpRight, ShoppingBag, Plus, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  searchResult?: ShoppingSearchResult;
  products?: Product[];
  showAddToCart?: Product;
  showUpsellPrompt?: boolean;
  selectedMainProduct?: Product;
  recommendedAddon?: Product;
  acceptedAddon?: Product;
  recommendations?: RecommendationItem[];
  recommendationHeadline?: string;
  recommendationType?: 'cross_sell' | 'upsell' | 'frequently_paired' | 'activity_based';
  isCompleted?: boolean;
  isPostPurchase?: boolean;
}

export const ConversationalCommerceScreen: React.FC = () => {
  const {
    products,
    activeMerchant,
    openCheckout,
    openProductProfileModal,
    openCustomerAuth,
    currentCustomer,
    allCustomers,
    customers,
    recordCustomerShoppingEvent,
    transactions
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartAddon, setCartAddon] = useState<Product | null>(null);
  const [sessionSearchQueries, setSessionSearchQueries] = useState<string[]>([]);
  const [viewedProductHistory, setViewedProductHistory] = useState<Product[]>([]);
  const [currentRecommendations, setCurrentRecommendations] = useState<RecommendationItem[]>([]);
  const lastProcessedTxId = useRef<string | null>(null);

  // Active products in the current merchant store (excluding archived / zero stock)
  const activeProducts = products.filter(p => {
    const isArchived = p.status?.toLowerCase() === 'archived';
    const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
    return !isArchived && !isOutOfStock;
  });

  // Dynamically derive contextual suggestions from the active merchant's available catalog
  const dynamicSuggestions = generateShoppingSuggestions(activeProducts, activeMerchant);

  // Helper to build comprehensive customer activity context
  const buildActivityContext = (activeCart: Product[]): CustomerActivityContext => {
    const viewedProds = Array.from(new Set([
      ...viewedProductHistory,
      ...(currentCustomer?.behavior?.viewedProducts || [])
        .map(name => activeProducts.find(p => p.name.toLowerCase() === name.toLowerCase()))
        .filter((p): p is Product => Boolean(p))
    ]));

    const purchasedNames = (currentCustomer?.behavior?.purchases || []).flatMap(p => p.items || []);
    const purchasedProds = purchasedNames
      .map(name => activeProducts.find(p => p.name.toLowerCase() === name.toLowerCase()))
      .filter((p): p is Product => Boolean(p));

    const allSearches = Array.from(new Set([
      ...(currentCustomer?.behavior?.searchQueries || []),
      ...sessionSearchQueries
    ]));

    const recentInterests = Array.from(new Set([
      ...allSearches,
      ...viewedProds.map(p => p.category),
      ...activeCart.map(p => p.category)
    ])).filter(Boolean);

    return {
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      cartProducts: activeCart,
      purchasedProducts: purchasedProds,
      viewedProducts: viewedProds,
      searchQueries: allSearches,
      recentInterests,
      budgetPreference: undefined
    };
  };

  // Watch for completed transactions to automatically trigger contextual post-purchase recommendations
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;
    const latestTx = transactions[0];
    if (latestTx && latestTx.merchantId === activeMerchant.id && latestTx.status === 'SUCCESS' && latestTx.id !== lastProcessedTxId.current) {
      lastProcessedTxId.current = latestTx.id;

      // Find the purchased product in active catalog
      const purchasedProduct = activeProducts.find(p => p.name.toLowerCase() === latestTx.baseProduct.toLowerCase());
      if (purchasedProduct) {
        const activityCtx = buildActivityContext([]);
        const postRecResult = recommendationEngine.getRecommendationsPostPurchase(purchasedProduct, activeProducts, activityCtx);

        if (postRecResult.hasStrongRecommendation && postRecResult.recommendations.length > 0) {
          const postMsg: ChatMessage = {
            id: `msg_post_${Date.now()}`,
            sender: 'agent',
            text: `Order confirmed for ${latestTx.baseProduct} (₹${latestTx.totalAmount.toLocaleString('en-IN')})! Since you purchased ${latestTx.baseProduct}, you may also like:`,
            recommendations: postRecResult.recommendations,
            recommendationHeadline: 'You May Also Like',
            recommendationType: 'frequently_paired',
            isPostPurchase: true
          };
          setMessages(prev => [...prev, postMsg]);
        }
      }
    }
  }, [transactions, activeMerchant.id, activeProducts]);

  const handleAddToCart = (prod: Product) => {
    setSelectedProduct(prod);
    setCartAddon(null);

    // Record Real-Time Customer Shopping Event (ADD_TO_CART)
    recordCustomerShoppingEvent({
      type: 'ADD_TO_CART',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      productId: prod.id,
      productName: prod.name,
      amount: prod.price,
      source: 'STOREFRONT'
    });

    // Build Activity Context and Generate Recommendations
    const activityCtx = buildActivityContext([prod]);
    const recResult = recommendationEngine.getRecommendationsAfterAddToCart(prod, activeProducts, activityCtx);

    if (recResult.hasStrongRecommendation && recResult.recommendations.length > 0) {
      setCurrentRecommendations(recResult.recommendations);
      const topRec = recResult.recommendations[0];
      const isUpsell = topRec.type === 'upsell';

      // Record AI Recommendation Shown Event
      recordCustomerShoppingEvent({
        type: isUpsell ? 'AI_UPSELL_SHOWN' : 'AI_CROSS_SELL_SHOWN',
        customerId: currentCustomer?.id,
        customerName: currentCustomer?.name,
        merchantId: activeMerchant.id,
        productId: topRec.product.id,
        productName: topRec.product.name,
        amount: topRec.product.price,
        source: isUpsell ? 'AI_UPSELL' : 'AI_CROSS_SELL',
        agent: 'MERCHANDISING'
      });

      let agentText = '';
      if (isUpsell) {
        agentText = `Added ${prod.name} (₹${prod.price.toLocaleString('en-IN')}) to your session cart. We also found a premium upgrade option:`;
      } else if (recResult.recommendations.length > 1) {
        agentText = `Since you're getting ready with ${prod.name}, complete your ${prod.category.toLowerCase()} setup:`;
      } else {
        agentText = `Since you selected ${prod.name}, you may also like:`;
      }

      const agentMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        text: agentText,
        recommendedAddon: topRec.product,
        recommendations: recResult.recommendations,
        recommendationHeadline: isUpsell ? 'Upgrade Option' : (recResult.recommendations.length > 1 ? 'Complete your setup' : 'Recommended for you'),
        recommendationType: topRec.type,
        showUpsellPrompt: true,
        selectedMainProduct: prod
      };
      setMessages(prev => [...prev, agentMsg]);
    } else {
      setCurrentRecommendations([]);
      const agentMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'agent',
        text: `Added ${prod.name} (₹${prod.price.toLocaleString('en-IN')}) to your session cart. No strong complementary recommendation right now. Ready for checkout.`,
        isCompleted: true,
        selectedMainProduct: prod
      };
      setMessages(prev => [...prev, agentMsg]);
    }
  };

  const handleAcceptAddon = (mainProd: Product, addon: Product) => {
    setCartAddon(addon);

    // Record AI Recommendation Accepted Event
    recordCustomerShoppingEvent({
      type: 'AI_CROSS_SELL_ACCEPTED',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      productId: addon.id,
      productName: addon.name,
      amount: addon.price,
      source: 'AI_CROSS_SELL',
      agent: 'MERCHANDISING'
    });

    const updatedMessages = messages.map(m =>
      m.showUpsellPrompt ? { ...m, showUpsellPrompt: false } : m
    );

    const confirmMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text: `Added ${addon.name} (+₹${addon.price.toLocaleString('en-IN')}) to your session cart. Ready for checkout.`,
      isCompleted: true,
      selectedMainProduct: mainProd,
      acceptedAddon: addon
    };

    setMessages([...updatedMessages, confirmMsg]);
  };

  const handleAcceptUpsell = (originalProd: Product, upgradedProd: Product) => {
    setSelectedProduct(upgradedProd);
    setCartAddon(null);

    // Record AI Upsell Accepted Event
    recordCustomerShoppingEvent({
      type: 'AI_UPSELL_ACCEPTED',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      productId: upgradedProd.id,
      productName: upgradedProd.name,
      amount: upgradedProd.price,
      source: 'AI_UPSELL',
      agent: 'MERCHANDISING'
    });

    const updatedMessages = messages.map(m =>
      m.showUpsellPrompt ? { ...m, showUpsellPrompt: false } : m
    );

    const confirmMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text: `Upgraded to ${upgradedProd.name} (₹${upgradedProd.price.toLocaleString('en-IN')}). Ready for instant checkout.`,
      isCompleted: true,
      selectedMainProduct: upgradedProd
    };

    setMessages([...updatedMessages, confirmMsg]);

    // Check if new product has complementary cross-sells
    const activityCtx = buildActivityContext([upgradedProd]);
    const nextRecResult = recommendationEngine.getRecommendationsAfterAddToCart(upgradedProd, activeProducts, activityCtx);
    if (nextRecResult.hasStrongRecommendation) {
      setCurrentRecommendations(nextRecResult.recommendations);
    }
  };

  const handleDeclineAddon = (mainProd: Product) => {
    const updatedMessages = messages.map(m =>
      m.showUpsellPrompt ? { ...m, showUpsellPrompt: false } : m
    );

    const confirmMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'agent',
      text: `Proceeding with ${mainProd.name} (₹${mainProd.price.toLocaleString('en-IN')}). Ready for checkout.`,
      isCompleted: true,
      selectedMainProduct: mainProd,
      acceptedAddon: cartAddon || undefined
    };

    setMessages([...updatedMessages, confirmMsg]);
  };

  const handleInspectProduct = (prod: Product) => {
    setViewedProductHistory(prev => Array.from(new Set([...prev, prod])));

    // Record PRODUCT_VIEW Event
    recordCustomerShoppingEvent({
      type: 'PRODUCT_VIEW',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      productId: prod.id,
      productName: prod.name,
      amount: prod.price
    });
    openProductProfileModal(prod);
  };

  const handleTriggerCheckout = (mainProd: Product, addon?: Product | null) => {
    const total = mainProd.price + (addon ? addon.price : 0);
    recordCustomerShoppingEvent({
      type: 'CHECKOUT_STARTED',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      productId: mainProd.id,
      productName: mainProd.name,
      amount: total
    });
    openCheckout(mainProd, addon || undefined);
  };

  const handleRemoveMainProduct = () => {
    if (selectedProduct) {
      recordCustomerShoppingEvent({
        type: 'REMOVE_FROM_CART',
        customerId: currentCustomer?.id,
        customerName: currentCustomer?.name,
        merchantId: activeMerchant.id,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        amount: selectedProduct.price
      });
    }
    setSelectedProduct(null);
    setCartAddon(null);
    setCurrentRecommendations([]);
  };

  const handleRemoveAddon = () => {
    if (cartAddon) {
      recordCustomerShoppingEvent({
        type: 'REMOVE_FROM_CART',
        customerId: currentCustomer?.id,
        customerName: currentCustomer?.name,
        merchantId: activeMerchant.id,
        productId: cartAddon.id,
        productName: cartAddon.name,
        amount: cartAddon.price
      });
    }
    setCartAddon(null);
  };

  const executeSearch = (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    setSessionSearchQueries(prev => [...prev, query]);

    // Record PRODUCT_SEARCH Event
    recordCustomerShoppingEvent({
      type: 'PRODUCT_SEARCH',
      customerId: currentCustomer?.id,
      customerName: currentCustomer?.name,
      merchantId: activeMerchant.id,
      metadata: { query }
    });

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    setTimeout(() => {
      // Execute strict natural language parsing and deterministic multi-constraint search
      const result = shoppingSearchService.searchCatalog(query, activeProducts, activeMerchant?.name);

      if (result.matchedProducts.length > 0) {
        if (result.matchedProducts.length === 1) {
          const matched = result.matchedProducts[0];
          const aiReply: ChatMessage = {
            id: `msg_${Date.now() + 1}`,
            sender: 'agent',
            text: result.responseText,
            products: [matched],
            showAddToCart: matched,
            searchResult: result
          };
          setMessages(prev => [...prev, aiReply]);
        } else {
          const aiReply: ChatMessage = {
            id: `msg_${Date.now() + 1}`,
            sender: 'agent',
            text: result.responseText,
            products: result.matchedProducts,
            searchResult: result
          };
          setMessages(prev => [...prev, aiReply]);
        }
      } else {
        // Zero matches: truthful response
        const aiReply: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          sender: 'agent',
          text: result.responseText || "I couldn't find a matching product in this store.",
          searchResult: result
        };
        setMessages(prev => [...prev, aiReply]);
      }
    }, 350);
  };

  const handleSendCustomMessage = () => {
    executeSearch(inputVal);
  };

  const currentCartTotal = (selectedProduct?.price || 0) + (cartAddon?.price || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Shop with AI.
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#666666' }}>
            Contextual product discovery, intelligent cross-sell, and 1-click checkout for {activeMerchant?.name || 'our store'}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#777777' }}>
          <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#111111' }}></span>
          <span>AI Shopping Agent Active ({activeMerchant?.name})</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
        {/* Left Column: AI Shopping Conversation & Chat Area */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '580px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Conversation Area */}
          <div style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto',
            maxHeight: '620px',
            minHeight: '440px'
          }}>
            {messages.length === 0 ? (
              /* Dynamic Merchant-Aware Empty State */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '48px 24px',
                margin: 'auto 0'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#F5F5F5',
                  border: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  color: '#111111'
                }}>
                  <Sparkles size={22} />
                </div>

                <h2 style={{
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-serif)',
                  color: '#111111',
                  marginBottom: '8px'
                }}>
                  How can I help you shop?
                </h2>

                <p style={{
                  fontSize: '0.88rem',
                  color: '#666666',
                  maxWidth: '440px',
                  lineHeight: 1.5,
                  marginBottom: '28px'
                }}>
                  {activeProducts.length > 0
                    ? `Ask for a product, category, price range, or anything in ${activeMerchant?.name || 'this store'}.`
                    : 'Add products to your catalog to start shopping with AI.'}
                </p>

                {/* Dynamically Generated Contextual Starter Prompts */}
                {dynamicSuggestions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '440px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999999', marginBottom: '4px' }}>
                      Try asking {activeMerchant ? `(${activeMerchant.name})` : ''}
                    </div>
                    {dynamicSuggestions.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => executeSearch(prompt)}
                        style={{
                          padding: '10px 14px',
                          background: '#FAFAFA',
                          border: '1px solid #EBEBEB',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          color: '#222222',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#F0F0F0';
                          e.currentTarget.style.borderColor = '#111111';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FAFAFA';
                          e.currentTarget.style.borderColor = '#EBEBEB';
                        }}
                      >
                        <span>"{prompt}"</span>
                        <ArrowUpRight size={14} color="#888888" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.84rem', color: '#888888', fontStyle: 'italic' }}>
                    Add products to your catalog to start shopping with AI.
                  </div>
                )}
              </div>
            ) : (
              /* Active Chat Message Stream */
              messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    maxWidth: '85%',
                    background: msg.sender === 'user' ? '#111111' : '#F9F9F9',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#111111',
                    border: msg.sender === 'user' ? 'none' : '1px solid #EBEBEB',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    fontSize: '0.88rem',
                    lineHeight: 1.5
                  }}>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                    {/* Multiple Matched Product Cards */}
                    {msg.products && msg.products.length > 0 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: msg.products.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        marginTop: '14px'
                      }}>
                        {msg.products.map(p => (
                          <div
                            key={p.id}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #E5E5E5',
                              borderRadius: '8px',
                              padding: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <div>
                              <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                              />
                              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111', lineHeight: 1.3 }}>
                                {p.name}
                              </div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111111', marginTop: '4px' }}>
                                ₹{p.price.toLocaleString('en-IN')}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: '#666666', marginTop: '4px', lineHeight: 1.35 }}>
                                {p.aiSummary ? (p.aiSummary.length > 80 ? p.aiSummary.slice(0, 80) + '...' : p.aiSummary) : p.description?.slice(0, 80)}
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToCart(p)}
                              className="btn-primary btn-sm"
                              style={{ width: '100%', borderRadius: '4px', fontSize: '0.78rem', padding: '7px 10px' }}
                            >
                              <span>Add to Cart</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Single Product Add to Cart CTA */}
                    {msg.showAddToCart && !msg.products && (
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E5E5E5' }}>
                        <button
                          onClick={() => handleAddToCart(msg.showAddToCart!)}
                          className="btn-primary btn-sm"
                          style={{ width: '100%', borderRadius: '6px' }}
                        >
                          <span>Add {msg.showAddToCart.name} to Cart (₹{msg.showAddToCart.price.toLocaleString('en-IN')})</span>
                        </button>
                      </div>
                    )}

                    {/* Contextual UPSELL / CROSS-SELL Recommendations Block */}
                    {msg.showUpsellPrompt && msg.recommendations && msg.recommendations.length > 0 && msg.selectedMainProduct && (
                      <div style={{
                        marginTop: '14px',
                        background: '#FFFFFF',
                        border: '1px solid #111111',
                        borderRadius: '10px',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#444444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={13} color="#111111" />
                            <span>{msg.recommendationHeadline || 'Complete your setup'}</span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#666666', background: '#F5F5F5', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {msg.recommendationType === 'upsell' ? 'Upgrade' : 'Cross-Sell'}
                          </span>
                        </div>

                        {/* List of Scored Contextual Recommendations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                          {msg.recommendations.map(rec => (
                            <div
                              key={rec.product.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '10px 12px',
                                background: '#FAFAFA',
                                border: '1px solid #EAEAEA',
                                borderRadius: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <img
                                  src={rec.product.image}
                                  alt={rec.product.name}
                                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                                <div>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111', lineHeight: 1.25 }}>
                                    {rec.product.name}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#555555', marginTop: '2px' }}>
                                    "{rec.reason}"
                                  </div>
                                </div>
                              </div>

                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                                  ₹{rec.product.price.toLocaleString('en-IN')}
                                </div>
                                {rec.type === 'upsell' ? (
                                  <button
                                    onClick={() => handleAcceptUpsell(msg.selectedMainProduct!, rec.product)}
                                    className="btn-primary btn-sm"
                                    style={{ borderRadius: '4px', fontSize: '0.74rem', padding: '4px 10px' }}
                                  >
                                    <span>Upgrade</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAcceptAddon(msg.selectedMainProduct!, rec.product)}
                                    className="btn-primary btn-sm"
                                    style={{ borderRadius: '4px', fontSize: '0.74rem', padding: '4px 10px' }}
                                  >
                                    <span>Add to Cart</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Decline / Proceed Option */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleDeclineAddon(msg.selectedMainProduct!)}
                            className="btn-secondary btn-sm"
                            style={{ borderRadius: '6px', fontSize: '0.76rem' }}
                          >
                            <span>No thanks, proceed to checkout</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Post-Purchase Recommendations Section */}
                    {msg.isPostPurchase && msg.recommendations && msg.recommendations.length > 0 && (
                      <div style={{
                        marginTop: '14px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E5E5',
                        borderRadius: '10px',
                        padding: '16px'
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666666', marginBottom: '10px' }}>
                          Recommended for you
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {msg.recommendations.map(rec => (
                            <div
                              key={rec.product.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px',
                                padding: '10px 12px',
                                background: '#FAFAFA',
                                border: '1px solid #EAEAEA',
                                borderRadius: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                <img
                                  src={rec.product.image}
                                  alt={rec.product.name}
                                  style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px' }}
                                />
                                <div>
                                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#111111' }}>
                                    {rec.product.name}
                                  </div>
                                  <div style={{ fontSize: '0.74rem', color: '#666666', marginTop: '2px' }}>
                                    "{rec.reason}"
                                  </div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                                  ₹{rec.product.price.toLocaleString('en-IN')}
                                </div>
                                <button
                                  onClick={() => handleAddToCart(rec.product)}
                                  className="btn-secondary btn-sm"
                                  style={{ borderRadius: '4px', fontSize: '0.74rem', padding: '4px 10px' }}
                                >
                                  <span>Add to Cart</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pay with Razorpay Test Mode CTA in Chat */}
                    {msg.isCompleted && msg.selectedMainProduct && (
                      <div style={{ marginTop: '14px' }}>
                        <button
                          onClick={() => handleTriggerCheckout(msg.selectedMainProduct!, msg.acceptedAddon || cartAddon)}
                          className="btn-primary"
                          style={{ width: '100%', borderRadius: '6px', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Lock size={14} />
                          <span>Pay with Razorpay Test Mode (₹{((msg.selectedMainProduct.price) + (msg.acceptedAddon ? msg.acceptedAddon.price : (cartAddon ? cartAddon.price : 0))).toLocaleString('en-IN')})</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clean Prompt Input Bar */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: '#FFFFFF',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              placeholder="Ask for a product..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCustomMessage()}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                fontSize: '0.88rem',
                outline: 'none',
                background: '#FAFAFA',
                color: '#111111'
              }}
            />
            <button
              onClick={handleSendCustomMessage}
              disabled={!inputVal.trim()}
              className="btn-primary"
              style={{
                padding: '0 20px',
                borderRadius: '8px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: inputVal.trim() ? 1 : 0.6,
                cursor: inputVal.trim() ? 'pointer' : 'default'
              }}
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Session Cart & Store Catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Session Cart Box */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                Session Cart
              </div>
              {selectedProduct && (
                <button
                  onClick={handleRemoveMainProduct}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.72rem',
                    color: '#888888',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {selectedProduct ? (
              <div>
                {/* Main Product in Cart */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111111', lineHeight: 1.3 }}>
                      {selectedProduct.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#777777' }}>
                      Main Item
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#111111' }}>
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={handleRemoveMainProduct}
                      title="Remove item"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#999999',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#111111')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Optional Add-on in Cart */}
                {cartAddon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px', color: '#444444' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 500, color: '#222222', lineHeight: 1.3 }}>
                        + {cartAddon.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#777777' }}>
                        Complementary Add-on
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        ₹{cartAddon.price.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={handleRemoveAddon}
                        title="Remove add-on"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#999999',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#111111')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Contextual Recommendations Drawer inside Cart Box */}
                {!cartAddon && currentRecommendations.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#FAFAFA',
                    border: '1px solid #EBEBEB',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#666666', marginBottom: '8px' }}>
                      Complete your setup
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {currentRecommendations.slice(0, 2).map(rec => (
                        <div key={rec.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#111111' }}>
                              {rec.product.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#666666' }}>
                              ₹{rec.product.price.toLocaleString('en-IN')} • {rec.reason.slice(0, 35)}...
                            </div>
                          </div>
                          <button
                            onClick={() => handleAcceptAddon(selectedProduct, rec.product)}
                            className="btn-secondary btn-sm"
                            style={{ fontSize: '0.7rem', padding: '3px 8px', whiteSpace: 'nowrap' }}
                          >
                            <span>+ Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cart Subtotal & Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: '12px',
                  borderTop: '1px solid #F0F0F0',
                  marginTop: '12px'
                }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111111' }}>Total</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111111' }}>
                    ₹{currentCartTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Razorpay Test Mode Button */}
                <button
                  onClick={() => handleTriggerCheckout(selectedProduct, cartAddon)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    borderRadius: '6px',
                    padding: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.84rem'
                  }}
                >
                  <Lock size={14} />
                  <span>Pay with Razorpay Test Mode</span>
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.84rem', color: '#888888', lineHeight: 1.5, marginBottom: '14px' }}>
                  Your cart is empty.
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  paddingTop: '10px',
                  borderTop: '1px solid #F0F0F0'
                }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#111111' }}>Total</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111' }}>₹0</span>
                </div>
              </div>
            )}
          </div>

          {/* Store Catalog Box */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777' }}>
                Catalog
              </div>
              <div style={{ fontSize: '0.74rem', color: '#888888', fontWeight: 500 }}>
                {activeProducts.length} {activeProducts.length === 1 ? 'product' : 'products'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {activeProducts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#888888', padding: '12px 0', textAlign: 'center' }}>
                  No active products in this store.
                </div>
              ) : (
                activeProducts.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '10px 12px',
                      background: '#FAFAFA',
                      border: '1px solid #EBEBEB',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      transition: 'border-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#111111')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EBEBEB')}
                  >
                    <div
                      onClick={() => handleInspectProduct(p)}
                      style={{ flex: 1, cursor: 'pointer' }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#111111', lineHeight: 1.25 }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      className="btn-secondary btn-sm"
                      style={{
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        padding: '4px 8px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>Add to Cart</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

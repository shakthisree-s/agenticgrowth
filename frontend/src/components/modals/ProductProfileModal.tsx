import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { recommendationEngine, CustomerActivityContext } from '../../services/recommendationEngine';
import {
  X,
  Boxes,
  Code2,
  Sparkles,
  Tag,
  CheckCircle2,
  ShoppingCart,
  Copy,
  Check
} from 'lucide-react';

export const ProductProfileModal: React.FC = () => {
  const {
    isProductProfileModalOpen,
    setIsProductProfileModalOpen,
    selectedProduct,
    openCheckout,
    products,
    activeMerchant,
    currentCustomer
  } = useApp();

  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  if (!isProductProfileModalOpen || !selectedProduct) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedProduct.jsonLdSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 95,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Boxes size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedProduct.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                AI-Readable Product Specification (Agentic Commerce Ready)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tab switch */}
            <div style={{ background: '#f1f5f9', padding: '3px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('visual')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'visual' ? '#ffffff' : 'transparent',
                  fontWeight: activeTab === 'visual' ? 700 : 500,
                  fontSize: '0.78rem',
                  color: activeTab === 'visual' ? 'var(--blue-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'visual' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                Visual Card
              </button>
              <button
                onClick={() => setActiveTab('json')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: activeTab === 'json' ? '#ffffff' : 'transparent',
                  fontWeight: activeTab === 'json' ? 700 : 500,
                  fontSize: '0.78rem',
                  color: activeTab === 'json' ? 'var(--blue-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'json' ? 'var(--shadow-sm)' : 'none'
                }}
              >
                JSON Schema
              </button>
            </div>

            <button
              onClick={() => setIsProductProfileModalOpen(false)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'visual' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Product hero banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: '20px',
                background: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px'
              }}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--blue-primary)', textTransform: 'uppercase' }}>
                      {selectedProduct.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      Stock: {selectedProduct.stockCount} Available
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedProduct.name}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0c2340', marginBottom: '8px' }}>
                    ₹{selectedProduct.price.toLocaleString('en-IN')}{' '}
                    {selectedProduct.originalPrice && (
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                        ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {selectedProduct.aiSummary}
                  </div>
                </div>
              </div>

              {/* AI Buyer Tags */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Agent Buyer Tags & Semantic Vectors
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProduct.aiBuyerTags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suitable for */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Purchase Suitability Rules
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedProduct.suitableFor.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={14} color="#10b981" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contextual Cross-Sell & Frequently Paired Products */}
              {(() => {
                const activeCatalog = products.filter(p => {
                  const isArchived = p.status?.toLowerCase() === 'archived';
                  const isOutOfStock = (p.stockCount !== undefined && p.stockCount <= 0) || (p.stock !== undefined && p.stock <= 0) || p.availability === false;
                  return !isArchived && !isOutOfStock;
                });

                const activityCtx: CustomerActivityContext = {
                  customerId: currentCustomer?.id,
                  customerName: currentCustomer?.name,
                  merchantId: activeMerchant?.id || '',
                  cartProducts: [],
                  purchasedProducts: [],
                  viewedProducts: [selectedProduct],
                  searchQueries: currentCustomer?.behavior?.searchQueries || [],
                  recentInterests: [selectedProduct.category]
                };

                const recResult = recommendationEngine.getRecommendationsAfterAddToCart(selectedProduct, activeCatalog, activityCtx);
                const recItems = recResult.recommendations;

                if (recItems.length === 0) return null;

                return (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Frequently Paired / Recommended for You
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {recItems.map((item, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111111' }}>
                                {item.product.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#555555' }}>
                                {item.reason}
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111111' }}>
                              +₹{item.product.price.toLocaleString('en-IN')}
                            </div>
                            <button
                              onClick={() => {
                                setIsProductProfileModalOpen(false);
                                openCheckout(selectedProduct, item.product);
                              }}
                              className="btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
                            >
                              <span>Bundle Checkout</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* JSON View */
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  SCHEMA.ORG + AGENTIC COMMERCE EXTENSION
                </span>
                <button
                  onClick={handleCopyJson}
                  className="btn-secondary btn-sm"
                  style={{ padding: '4px 10px', fontSize: '0.74rem' }}
                >
                  {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto',
                lineHeight: 1.5,
                maxHeight: '400px'
              }}>
                <code>{JSON.stringify(selectedProduct.jsonLdSchema, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={() => setIsProductProfileModalOpen(false)}
            className="btn-secondary"
          >
            Close
          </button>

          <button
            onClick={() => {
              setIsProductProfileModalOpen(false);
              openCheckout(selectedProduct);
            }}
            className="btn-primary"
          >
            <ShoppingCart size={15} />
            <span>Test Checkout in Razorpay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

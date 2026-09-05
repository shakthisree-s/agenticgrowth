import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { X, ShoppingCart, Activity, ShieldCheck, Zap, ArrowRight, UserCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

export const CustomersScreen: React.FC = () => {
  const { customers, activityStream, opportunities, activeMerchant } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getNextBestAction = (cust: Customer): string => {
    if (cust.nextBestAction) return cust.nextBestAction;
    if (cust.status === 'at_risk' || (cust.behavior?.cartValue && cust.behavior.cartValue > 0)) {
      return `Recover abandoned cart (${cust.behavior.lastViewedProduct || 'session items'})`;
    }
    if (cust.behavior?.intentScore && cust.behavior.intentScore >= 85) {
      return `Recommend premium complementary bundle`;
    }
    if (cust.behavior?.intentScore && cust.behavior.intentScore >= 70) {
      return `Cross-sell complementary add-ons`;
    }
    if (cust.status === 'lapsed') {
      return 'Dormant win-back incentive';
    }
    return 'Monitor active storefront session';
  };

  const getStatusBadge = (cust: Customer) => {
    const intent = cust.currentIntent || '';
    if (intent === 'HIGH_RECOVERY_INTENT' || cust.status === 'at_risk') {
      return { label: 'High Recovery Intent', bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' };
    }
    if (intent === 'HIGH_PURCHASE_INTENT' || cust.status === 'high_intent') {
      return { label: 'High Purchase Intent', bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
    }
    if (intent === 'STOREFRONT_VISITOR') {
      return { label: 'Storefront Visitor', bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
    if (cust.status === 'active') {
      return { label: 'Active Shopper', bg: '#F8FAFC', text: '#334155', border: '#E2E8F0' };
    }
    return { label: cust.status || 'Active', bg: '#F9FAFB', text: '#4B5563', border: '#E5E7EB' };
  };

  // Filter real-time activity for the selected customer
  const customerActivities = selectedCustomer
    ? activityStream.filter(
        item =>
          item.customerId === selectedCustomer.id ||
          item.customerName === selectedCustomer.name ||
          item.customer === selectedCustomer.name ||
          (selectedCustomer.name && item.title?.includes(selectedCustomer.name)) ||
          (selectedCustomer.name && item.description?.includes(selectedCustomer.name))
      )
    : [];

  // Filter opportunities for the selected customer
  const customerOpportunities = selectedCustomer
    ? opportunities.filter(
        opp =>
          opp.customerId === selectedCustomer.id ||
          opp.customerName === selectedCustomer.name ||
          (selectedCustomer.name && opp.title?.includes(selectedCustomer.name))
      )
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Title & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: '#111111', margin: 0 }}>
              Customers
            </h1>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              background: '#F0F0F0',
              color: '#555555',
              fontFamily: 'var(--font-mono)'
            }}>
              {customers.length} {customers.length === 1 ? 'profile' : 'profiles'}
            </span>
          </div>
          <p style={{ fontSize: '0.92rem', color: '#666666', margin: 0 }}>
            Live customer behavioral intelligence, purchase metrics, and autonomous agent orchestration for {activeMerchant.name}.
          </p>
        </div>
      </div>

      {/* Customer List Table */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8F8F8', borderBottom: '1px solid #EBEBEB', color: '#777777', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <th style={{ padding: '14px 20px' }}>Customer</th>
              <th style={{ padding: '14px 20px' }}>Current Intent</th>
              <th style={{ padding: '14px 20px' }}>Cart Value</th>
              <th style={{ padding: '14px 20px' }}>Orders & Spend</th>
              <th style={{ padding: '14px 20px' }}>Last Activity</th>
              <th style={{ padding: '14px 20px' }}>Next Best Action</th>
              <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center', color: '#888888', fontSize: '0.88rem' }}>
                  No customer profiles found for {activeMerchant.name}. Customers signing up in /shop will appear here immediately.
                </td>
              </tr>
            ) : (
              customers.map(cust => {
                const badge = getStatusBadge(cust);
                const orderCount = cust.metrics?.totalOrders ?? (cust.behavior?.hasPurchased ? 1 : 0);
                const totalSpend = cust.metrics?.totalSpend ?? cust.lifetimeValue ?? 0;
                const cartVal = cust.behavior?.cartValue || 0;

                return (
                  <tr
                    key={cust.id}
                    style={{
                      borderBottom: '1px solid #F0F0F0',
                      transition: 'background 0.15s',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedCustomer(cust)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAFA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                  >
                    {/* Customer */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#111111',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111111' }}>
                            {cust.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '1px' }}>
                            {cust.email} {cust.id ? `· ${cust.id}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Current Intent */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.text }} />
                        {badge.label}
                      </span>
                    </td>

                    {/* Cart Value */}
                    <td style={{ padding: '16px 20px', fontSize: '0.88rem', fontWeight: 700, color: '#111111' }}>
                      {cartVal > 0 ? `₹${cartVal.toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* Orders & Spend */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#111111' }}>
                        ₹{totalSpend.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#777777', marginTop: '1px' }}>
                        {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                      </div>
                    </td>

                    {/* Last Activity */}
                    <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#666666' }}>
                      {cust.metrics?.lastPurchaseAt || 'Just now'}
                    </td>

                    {/* Next Best Action */}
                    <td style={{ padding: '16px 20px', fontSize: '0.82rem', color: '#333333', maxWidth: '240px' }}>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.35
                      }}>
                        {getNextBestAction(cust)}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(cust);
                        }}
                        className="btn-secondary btn-sm"
                        style={{ borderRadius: '6px', padding: '5px 12px', fontSize: '0.76rem' }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '540px',
            background: '#FFFFFF',
            height: '100%',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Drawer Top Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#777777',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <UserCheck size={14} />
                    <span>Customer Profile · {selectedCustomer.id || 'CUS_001'}</span>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#888888',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111111', marginBottom: '4px' }}>
                  {selectedCustomer.name}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#666666', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span>{selectedCustomer.email}</span>
                  <span>·</span>
                  <span>{selectedCustomer.phone || '+91 98000 00000'}</span>
                  {selectedCustomer.location && (
                    <>
                      <span>·</span>
                      <span>{selectedCustomer.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* 1. COMMERCE METRICS */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '10px' }}>
                  Commerce
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px'
                }}>
                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>Orders</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>
                      {selectedCustomer.metrics?.totalOrders ?? (selectedCustomer.behavior?.hasPurchased ? 1 : 0)}
                    </div>
                  </div>

                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>Total Spend</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111111', marginTop: '2px' }}>
                      ₹{(selectedCustomer.metrics?.totalSpend ?? selectedCustomer.lifetimeValue ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>Average Order Value</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111111', marginTop: '2px' }}>
                      ₹{(selectedCustomer.metrics?.averageOrderValue ?? selectedCustomer.metrics?.totalSpend ?? selectedCustomer.lifetimeValue ?? 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>Last Purchase</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111111', marginTop: '4px' }}>
                      {selectedCustomer.metrics?.lastPurchaseAt || (selectedCustomer.behavior?.hasPurchased ? 'Recent order' : 'None')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. BEHAVIOR */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '10px' }}>
                  Behavior
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Products Viewed */}
                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Products Viewed ({selectedCustomer.behavior?.viewedProducts?.length || (selectedCustomer.behavior?.lastViewedProduct ? 1 : 0)})
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#111111', fontWeight: 500 }}>
                      {selectedCustomer.behavior?.viewedProducts && selectedCustomer.behavior.viewedProducts.length > 0
                        ? selectedCustomer.behavior.viewedProducts.join(', ')
                        : selectedCustomer.behavior?.lastViewedProduct || 'No products inspected yet'}
                    </div>
                  </div>

                  {/* Searches */}
                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Search Queries
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#111111' }}>
                      {selectedCustomer.behavior?.searchQueries && selectedCustomer.behavior.searchQueries.length > 0
                        ? selectedCustomer.behavior.searchQueries.map((q, i) => (
                            <span key={i} style={{ display: 'inline-block', background: '#FFFFFF', border: '1px solid #E5E5E5', padding: '2px 8px', borderRadius: '4px', margin: '2px 4px 2px 0', fontSize: '0.76rem' }}>
                              "{q}"
                            </span>
                          ))
                        : 'No search queries performed'}
                    </div>
                  </div>

                  {/* Cart Activity */}
                  <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase' }}>Cart Activity</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111111' }}>
                        {selectedCustomer.behavior?.cartValue && selectedCustomer.behavior.cartValue > 0
                          ? `₹${selectedCustomer.behavior.cartValue.toLocaleString('en-IN')}`
                          : '₹0'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#444444' }}>
                      {selectedCustomer.behavior?.cartItems && selectedCustomer.behavior.cartItems.length > 0
                        ? `Items: ${selectedCustomer.behavior.cartItems.join(', ')}`
                        : 'No active session items'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. AI INTENT & NEXT BEST ACTION */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '10px' }}>
                  AI Intent & Next Best Action
                </div>
                <div style={{ background: '#FAFAFA', border: '1px solid #EBEBEB', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111111' }}>
                      {selectedCustomer.currentIntent || 'HIGH_PURCHASE_INTENT'}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: '#15803D', fontWeight: 700 }}>
                      {selectedCustomer.behavior?.intentScore || 92}% Confidence
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.4 }}>
                    {selectedCustomer.behavior?.cartValue && selectedCustomer.behavior.cartValue > 0
                      ? `Customer assembled ₹${selectedCustomer.behavior.cartValue.toLocaleString('en-IN')} cart. High probability of 1-click conversion.`
                      : selectedCustomer.behavior?.hasPurchased
                      ? `Customer completed checkout in Razorpay Test Mode. Lifetime spend updated to ₹${(selectedCustomer.metrics?.totalSpend ?? selectedCustomer.lifetimeValue ?? 0).toLocaleString('en-IN')}.`
                      : `Customer is actively browsing catalog items on ${activeMerchant.name}.`}
                  </div>

                  <div style={{ borderTop: '1px solid #EBEBEB', paddingTop: '10px', marginTop: '2px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#777777', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Recommended Action
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#111111' }}>
                      {getNextBestAction(selectedCustomer)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. PROVENANCE (4-Agent Trace) */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '10px' }}>
                  Agent Provenance Trace
                </div>
                <div style={{ background: '#111111', color: '#FFFFFF', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#4ADE80', flexShrink: 0 }} />
                    <span><strong style={{ color: '#FFFFFF' }}>Detected:</strong> Customer Intent Agent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#4ADE80', flexShrink: 0 }} />
                    <span><strong style={{ color: '#FFFFFF' }}>Recommended:</strong> Merchandising & Basket Agent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#4ADE80', flexShrink: 0 }} />
                    <span><strong style={{ color: '#FFFFFF' }}>Checked:</strong> Policy & Risk Agent (Merchant Gate)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                    <CheckCircle2 size={14} style={{ color: '#4ADE80', flexShrink: 0 }} />
                    <span><strong style={{ color: '#FFFFFF' }}>Executed:</strong> Commerce Execution Agent</span>
                  </div>
                </div>
              </div>

              {/* 5. RECENT ACTIVITY STREAM */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#777777', marginBottom: '10px' }}>
                  Recent Activity ({customerActivities.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {customerActivities.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#888888', padding: '8px 0' }}>
                      No recent activity events recorded for this customer.
                    </div>
                  ) : (
                    customerActivities.slice(0, 8).map((act, i) => (
                      <div key={act.id || i} style={{
                        padding: '8px 10px',
                        background: '#FAFAFA',
                        border: '1px solid #EBEBEB',
                        borderRadius: '6px',
                        fontSize: '0.78rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#777777', fontSize: '0.7rem', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{act.timeFormatted}</span>
                          <span style={{ fontWeight: 600 }}>{act.agentName || act.agent || 'SYSTEM'}</span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#111111' }}>{act.title}</div>
                        <div style={{ color: '#555555', fontSize: '0.74rem', marginTop: '2px' }}>{act.description}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div style={{ paddingTop: '24px', borderTop: '1px solid #F0F0F0', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="btn-primary"
                style={{ width: '100%', borderRadius: '6px', padding: '11px', fontSize: '0.86rem' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

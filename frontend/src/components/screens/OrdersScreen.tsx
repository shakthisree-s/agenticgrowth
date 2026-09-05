import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, Sparkles, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';

interface BackendOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  isAddon: boolean;
}

interface BackendOrder {
  id: string;
  customerId: string;
  customerName: string;
  merchantId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  baseProduct: string;
  baseAmount: number;
  aiAddonProduct?: string | null;
  aiAddonAmount?: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  aiAttribution: string;
  aiAttributedRevenue: number;
  createdAt?: string;
  items?: BackendOrderItem[];
}

export const OrdersScreen: React.FC = () => {
  const {
    activeMerchant,
    currentCustomer,
    openStorefront,
    openCustomerAuth,
    transactions
  } = useApp();

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async (custId: string) => {
    if (!custId) {
      setOrders([]);
      return;
    }
    setIsLoading(true);

    const endpoints = [
      `/api/orders/${encodeURIComponent(custId)}`,
      `http://127.0.0.1:8001/api/orders/${encodeURIComponent(custId)}`,
      `http://127.0.0.1:8000/api/orders/${encodeURIComponent(custId)}`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (Array.isArray(data)) {
              setOrders(data);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Continue to fallback endpoint
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const activeCustId = currentCustomer?.id || 'cust_sports_demo';
    if (activeCustId) {
      fetchOrders(activeCustId);
    } else {
      setOrders([]);
    }
  }, [currentCustomer?.id, transactions]);

  const formatOrderDate = (dateStr?: string) => {
    if (!dateStr) return '05 Sep 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Navigation Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#666666',
              background: '#F5F5F5',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              Customer Account
            </span>
            <span style={{ fontSize: '0.72rem', color: '#888888' }}>•</span>
            <span style={{ fontSize: '0.74rem', color: '#666666', fontWeight: 500 }}>
              {activeMerchant.name}
            </span>
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#111111',
            margin: 0
          }}>
            Order History
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#666666', margin: '4px 0 0 0' }}>
            View your verified transactions, item receipts, and AI recommended purchases.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={openStorefront}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#111111',
              color: '#FFFFFF',
              border: '1px solid #111111',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#333333')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#111111')}
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </button>

          <button
            onClick={() => fetchOrders(currentCustomer?.id || 'cust_sports_demo')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#555555',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111111';
              e.currentTarget.style.borderColor = '#111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#555555';
              e.currentTarget.style.borderColor = '#E5E5E5';
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {orders.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          background: '#FFFFFF',
          border: '1px dashed #E0E0E0',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#F5F5F5',
            color: '#888888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Package size={22} />
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111111', marginBottom: '6px' }}>
            No orders yet.
          </div>
          <div style={{ fontSize: '0.84rem', color: '#777777', maxWidth: '360px', margin: '0 auto 20px auto', lineHeight: 1.4 }}>
            Your completed purchases will appear here.
          </div>
          <button
            onClick={openStorefront}
            className="btn-primary"
            style={{ borderRadius: '8px', fontSize: '0.82rem', padding: '9px 20px' }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px'
        }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: '14px',
                padding: '24px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#111111';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
              }}
            >
              {/* Header: Order ID, Date & Status Pills */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <div style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: '#111111',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '-0.01em'
                  }}>
                    Order #{order.id}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#777777', marginTop: '3px' }}>
                    {formatOrderDate(order.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: '#F0FDF4',
                    color: '#166534',
                    border: '1px solid #BBF7D0',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Payment: Paid
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    background: '#FAFAFA',
                    color: '#111111',
                    border: '1px solid #E5E5E5',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Status: Confirmed
                  </span>
                </div>
              </div>

              <div style={{ height: '1px', background: '#F0F0F0' }} />

              {/* Products Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Main Purchased Product */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#111111', lineHeight: 1.3 }}>
                      {order.baseProduct}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#777777', marginTop: '2px' }}>
                      Quantity: 1
                    </div>
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111111' }}>
                    ₹{order.baseAmount?.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* AI Recommended Add-on */}
                {order.aiAddonProduct && (
                  <div style={{
                    background: '#FAFAFA',
                    border: '1px solid #EBEBEB',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginTop: '2px'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#111111',
                      background: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}>
                      <Sparkles size={11} />
                      <span>AI Recommended</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#222222', lineHeight: 1.3 }}>
                          {order.aiAddonProduct}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#666666', marginTop: '2px' }}>
                          Quantity: 1 • AI Attributed Revenue: ₹{(order.aiAddonAmount || order.aiAttributedRevenue)?.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#222222' }}>
                        ₹{(order.aiAddonAmount || order.aiAttributedRevenue)?.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ height: '1px', background: '#F0F0F0' }} />

              {/* Total & Summary Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111111' }}>
                  Total
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111111' }}>
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

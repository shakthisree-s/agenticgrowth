import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveScreen } from '../../types';
import { Menu, X, LogOut } from 'lucide-react';

interface NavItem {
  id: ActiveScreen;
  label: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    opportunities,
    products,
    activeMerchant,
    logout
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const awaitingCount = opportunities.filter(o => o.status === 'awaiting_approval').length;

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'opportunities', label: 'Opportunities', badge: awaitingCount > 0 ? awaitingCount : undefined },
    { id: 'customers', label: 'Customers' },
    { id: 'agent_activity', label: 'Activity' },
    { id: 'audit_trail', label: 'Audit' }
  ];

  // Helper to check if a nav link is active
  const isItemActive = (id: ActiveScreen) => {
    if (activeScreen === id) return true;
    if (id === 'opportunities' && activeScreen === 'campaigns') return true;
    if (id === 'agent_activity' && activeScreen === 'transactions') return true;
    return false;
  };

  const handleNavClick = (id: ActiveScreen) => {
    setActiveScreen(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Header Bar (< 900px) */}
      <div className="mobile-header-bar" style={{
        display: 'none',
        height: '60px',
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%'
      }}>
        <div
          onClick={() => handleNavClick('overview')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#111111' }}>
            MerchantOS <span style={{ fontWeight: 400, color: '#777777' }}>AI</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: '#888888', fontWeight: 600 }}>• {activeMerchant.name}</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#111111',
            cursor: 'pointer',
            padding: '6px'
          }}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(3px)',
            zIndex: 45
          }}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`main-app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: '235px',
          minWidth: '235px',
          maxWidth: '235px',
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 18px',
          zIndex: 48,
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Top: Brand & Locked Merchant Context & Nav Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Brand Logo & Header */}
          <div
            onClick={() => handleNavClick('overview')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '2px 4px'
            }}
          >
            <div style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#111111',
              lineHeight: 1.1
            }}>
              MerchantOS <span style={{ fontWeight: 400, color: '#777777' }}>AI</span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#888888',
              marginTop: '4px'
            }}>
              AI Commerce
            </div>
          </div>

          {/* 2. Locked Merchant Profile Card (No Dropdown / No Switching / Locked to Current Session) */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#F8F8F8',
            border: '1px solid #EBEBEB',
            borderRadius: '8px',
            padding: '10px 12px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              background: '#111111',
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {activeMerchant.logoInitial}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#111111',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}>
                {activeMerchant.name}
              </div>
              <div style={{
                fontSize: '0.68rem',
                color: '#777777',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {activeMerchant.industry}
              </div>
            </div>
          </div>

          {/* 3. Navigation Items Vertically Stacked with Subtle Active State */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
            {navItems.map(item => {
              const active = isItemActive(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: active ? '#F5F5F5' : 'transparent',
                    border: 'none',
                    color: active ? '#111111' : '#666666',
                    fontSize: '0.88rem',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = '#FAFAFA';
                      e.currentTarget.style.color = '#111111';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#666666';
                    }
                  }}
                >
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    {item.label}
                    {/* Subtle black underline indicator for active page */}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: 0,
                          width: '100%',
                          height: '2px',
                          background: '#111111',
                          borderRadius: '1px'
                        }}
                      />
                    )}
                  </span>

                  {/* Badge for awaiting counts */}
                  {item.badge !== undefined && (
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: active ? '#111111' : '#EAEAEA',
                      color: active ? '#FFFFFF' : '#333333',
                      border: active ? '1px solid #111111' : '1px solid #DFDFDF'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom / Merchant Meta & Sign Out */}
        <div style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Merchant Context Card */}
          <div style={{
            padding: '10px 12px',
            background: '#F9F9F9',
            border: '1px solid #EBEBEB',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <span style={{ color: '#111111', fontWeight: 600, fontSize: '0.78rem' }}>{activeMerchant.industry}</span>
            <span style={{ color: '#888888', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
              {products.length} {products.length === 1 ? 'product' : 'products'} live
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 10px',
              borderRadius: '6px',
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              color: '#666666',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#111111';
              e.currentTarget.style.borderColor = '#111111';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666666';
              e.currentTarget.style.borderColor = '#E5E5E5';
            }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

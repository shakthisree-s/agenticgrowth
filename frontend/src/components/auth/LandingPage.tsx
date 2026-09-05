import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { AbstractLines } from '../layout/AbstractLines';
import { CustomerAuthScreen } from './CustomerAuthScreen';
import { CustomerStoreSelection } from './CustomerStoreSelection';
import { AdminLogin } from './AdminLogin';
import { CreateMerchantModal } from '../modals/CreateMerchantModal';
import { ArrowRight, ShoppingBag, ShieldCheck, Cpu, Bot, Sparkles, Plus, Store } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setIsCreateMerchantModalOpen } = useApp();
  const [authView, setAuthView] = useState<'landing' | 'customer_auth' | 'store_selection' | 'admin_login'>('landing');
  const [authenticatedCustomer, setAuthenticatedCustomer] = useState<Customer | null>(null);

  if (authView === 'customer_auth') {
    return (
      <>
        <CustomerAuthScreen
          onBack={() => setAuthView('landing')}
          onAuthenticated={(cust) => {
            setAuthenticatedCustomer(cust);
            setAuthView('store_selection');
          }}
        />
        <CreateMerchantModal />
      </>
    );
  }

  if (authView === 'store_selection') {
    if (!authenticatedCustomer) {
      return (
        <>
          <CustomerAuthScreen
            onBack={() => setAuthView('landing')}
            onAuthenticated={(cust) => {
              setAuthenticatedCustomer(cust);
              setAuthView('store_selection');
            }}
          />
          <CreateMerchantModal />
        </>
      );
    }

    return (
      <>
        <CustomerStoreSelection
          customer={authenticatedCustomer}
          onBack={() => setAuthView('customer_auth')}
        />
        <CreateMerchantModal />
      </>
    );
  }

  if (authView === 'admin_login') {
    return (
      <>
        <AdminLogin onBack={() => setAuthView('landing')} />
        <CreateMerchantModal />
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      color: '#111111',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Background Graphic */}
      <AbstractLines opacity={0.5} />

      {/* Top Header */}
      <header style={{
        padding: '28px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#111111',
            lineHeight: 1
          }}>
            MerchantOS <span style={{ fontWeight: 400, color: '#777777' }}>AI</span>
          </div>
          <div style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#888888',
            marginTop: '3px'
          }}>
            AI Commerce
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsCreateMerchantModalOpen(true)}
            className="btn-secondary btn-sm"
            style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Plus size={13} />
            <span>Create Store</span>
          </button>
          <button
            onClick={() => setAuthView('admin_login')}
            className="btn-primary btn-sm"
            style={{ borderRadius: '6px' }}
          >
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Two Role Choices */}
      <main style={{
        maxWidth: '1080px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px 60px 24px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        {/* Eyebrow & Hero Title */}
        <div className="eyebrow" style={{ marginBottom: '16px', letterSpacing: '0.18em' }}>
          MULTI-AGENT COMMERCE WORKFORCE
        </div>

        <h1 className="hero-serif-title" style={{
          fontSize: '3.6rem',
          lineHeight: 1.1,
          marginBottom: '18px',
          color: '#111111',
          maxWidth: '820px'
        }}>
          AI agents that<br />
          grow merchant revenue.
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#555555',
          lineHeight: 1.6,
          marginBottom: '42px',
          maxWidth: '640px'
        }}>
          Understand intent. Find opportunities. Apply policy. Execute commerce.
        </p>

        {/* Two Clear Choices: CUSTOMER and ADMIN */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px',
          width: '100%',
          maxWidth: '820px',
          marginBottom: '36px',
          textAlign: 'left'
        }}>
          {/* Choice 1: Customer */}
          <div
            onClick={() => setAuthView('customer_auth')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '36px 32px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#111111';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#888888',
                marginBottom: '10px'
              }}>
                CUSTOMER
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#111111',
                marginBottom: '8px'
              }}>
                Shop with AI
              </div>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5 }}>
                Experience conversational commerce with real-time natural language catalog search and 1-click test checkout.
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Select Store & Shop</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Choice 2: Admin */}
          <div
            onClick={() => setAuthView('admin_login')}
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '36px 32px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#111111';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#888888',
                marginBottom: '10px'
              }}>
                ADMIN
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#111111',
                marginBottom: '8px'
              }}>
                Manage your store
              </div>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5 }}>
                Supervise 6 AI agents, review autonomous revenue opportunities, enforce merchant guardrails, and track audit logs.
              </p>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>Admin Login</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Small Explanatory Badge Section */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: '24px',
          padding: '8px 18px',
          fontSize: '0.82rem',
          color: '#555555',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
        }}>
          <Sparkles size={14} color="#111111" />
          <span>Built for merchants. Powered by six specialized AI agents.</span>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 48px',
        borderTop: '1px solid #EBEBEB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: '#888888',
        position: 'relative',
        zIndex: 10
      }}>
        <span>MerchantOS AI • Multi-agent commerce infrastructure for modern merchants.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Razorpay Test Mode Ready</span>
          <span>•</span>
          <span>Cryptographic Audit Trails</span>
        </div>
      </footer>

      <CreateMerchantModal />
    </div>
  );
};

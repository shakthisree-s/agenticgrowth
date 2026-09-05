import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { AgentControlDock } from './components/layout/AgentControlDock';

import { LandingPage } from './components/auth/LandingPage';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { AgentControlCenterScreen } from './components/screens/AgentControlCenterScreen';
import { OpportunitiesScreen } from './components/screens/OpportunitiesScreen';
import { ConversationalCommerceScreen } from './components/screens/ConversationalCommerceScreen';
import { OrdersScreen } from './components/screens/OrdersScreen';
import { CatalogScreen } from './components/screens/CatalogScreen';
import { CustomersScreen } from './components/screens/CustomersScreen';
import { AgentActivityScreen } from './components/screens/AgentActivityScreen';
import { AuditTrailScreen } from './components/screens/AuditTrailScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

import { RazorpayCheckoutModal } from './components/modals/RazorpayCheckoutModal';
import { ReasoningDrawer } from './components/modals/ReasoningDrawer';
import { ProductProfileModal } from './components/modals/ProductProfileModal';
import { ProductEditModal } from './components/modals/ProductEditModal';
import { CreateMerchantModal } from './components/modals/CreateMerchantModal';
import { SimulationModal } from './components/modals/SimulationModal';
import { AgentDetailDrawer } from './components/modals/AgentDetailDrawer';
import { AgentTraceModal } from './components/modals/AgentTraceModal';
import { CustomerSimulationDrawer } from './components/modals/CustomerSimulationDrawer';
import { CustomerAuthModal } from './components/modals/CustomerAuthModal';
import { ArrowLeft, Home, User, UserPlus, LogIn, ShoppingBag } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeScreen,
    isAuthenticated,
    authRole,
    activeMerchant,
    currentCustomer,
    openCustomerAuth,
    signOutCustomer,
    openStorefront,
    exitStorefront,
    logout
  } = useApp();

  // 1. Unauthenticated State: Show Standalone Landing Page
  if (!isAuthenticated || authRole === null) {
    return <LandingPage />;
  }

  // 2. Customer Role: Dedicated Shopping Storefront ONLY (/shop)
  if (authRole === 'customer') {
    return (
      <div style={{ minHeight: '100vh', width: '100%', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
        {/* Customer Top Header */}
        <header style={{
          height: '64px',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#111111',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeMerchant.logoInitial}
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111111', lineHeight: 1.1 }}>
                {activeMerchant.name}
              </div>
              <div style={{ fontSize: '0.66rem', color: '#888888', fontWeight: 600 }}>
                {activeMerchant.industry} • Customer Storefront
              </div>
            </div>
          </div>

          {/* Center / Right Customer Identity & Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Shop Navigation Button */}
            <button
              onClick={openStorefront}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid #EAEAEA',
                cursor: 'pointer',
                background: activeScreen === 'conversational' ? '#111111' : '#FFFFFF',
                color: activeScreen === 'conversational' ? '#FFFFFF' : '#333333',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease'
              }}
            >
              <ShoppingBag size={13} />
              <span>Shop</span>
            </button>

            <div style={{ width: '1px', height: '24px', background: '#E5E5E5' }} />

            {/* Customer Profile Identity Pill */}
            {currentCustomer ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '5px 12px 5px 8px',
                background: '#F7F7F7',
                border: '1px solid #E5E5E5',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#111111',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {currentCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111111', lineHeight: 1.1 }}>
                    {currentCustomer.name}
                  </span>
                  <span style={{ fontSize: '0.66rem', color: '#777777', fontFamily: 'var(--font-mono)' }}>
                    {currentCustomer.email}
                  </span>
                </div>
                <button
                  onClick={signOutCustomer}
                  title="Sign out of customer account"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.7rem',
                    color: '#888888',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0 2px',
                    marginLeft: '4px'
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => openCustomerAuth('signin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#111111',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#111111';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0';
                  }}
                >
                  <LogIn size={12} />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openCustomerAuth('signup')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#111111',
                    border: '1px solid #111111',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#111111';
                  }}
                >
                  <UserPlus size={12} />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            <div style={{ width: '1px', height: '24px', background: '#E5E5E5' }} />

            <button
              onClick={exitStorefront}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#FAFAFA',
                border: '1px solid #E5E5E5',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#666666',
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
              <Home size={13} />
              <span>Back to Home</span>
            </button>
          </div>
        </header>

        {/* Customer Storefront / Dedicated Orders Canvas */}
        <main style={{ flex: 1, padding: '36px 48px 80px 48px', maxWidth: '1240px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {activeScreen === 'orders' ? <OrdersScreen /> : <ConversationalCommerceScreen />}
        </main>

        <RazorpayCheckoutModal />
        <ProductProfileModal />
        <CustomerAuthModal />
      </div>
    );
  }

  // 3. Admin Role: Full MerchantOS Backend Application
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'overview':
        return <OverviewScreen />;
      case 'agents':
        return <AgentControlCenterScreen />;
      case 'opportunities':
      case 'campaigns':
        return <OpportunitiesScreen />;
      case 'catalog':
        return <CatalogScreen />;
      case 'customers':
        return <CustomersScreen />;
      case 'agent_activity':
      case 'transactions':
        return <AgentActivityScreen />;
      case 'audit_trail':
        return <AuditTrailScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="app-layout-container">
      {/* Left Fixed Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Canvas (starts to the right of the sidebar) */}
      <div className="main-content-wrapper">
        <main style={{
          flex: 1,
          padding: '40px 48px 80px 48px',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          {renderActiveScreen()}
        </main>
      </div>

      {/* Persistent Minimalist Floating Agent Telemetry Dock in Admin View */}
      <AgentControlDock />

      {/* Global Modals & Slide-out Drawers */}
      <RazorpayCheckoutModal />
      <ReasoningDrawer />
      <ProductProfileModal />
      <ProductEditModal />
      <CreateMerchantModal />
      <SimulationModal />
      <AgentDetailDrawer />
      <AgentTraceModal />
      <CustomerSimulationDrawer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

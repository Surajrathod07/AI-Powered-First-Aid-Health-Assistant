
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RadiologyView from './components/RadiologyView';
import ChatInterface from './components/ChatInterface';
import NearbyCareFinder from './components/NearbyCareFinder';
import FamilyAlertView from './components/FamilyAlertView';
import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import HealthProfileView from './components/HealthProfileView';
import { ViewState } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

// Inner component to use Auth Context
const AppContent: React.FC = () => {
  const { user, isGuest, loading, startGuestMode } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [sharedData, setSharedData] = useState<{summary?: string; patientName?: string}>({});

  // Effect to redirect based on auth status
  useEffect(() => {
    if (!loading) {
      if (user || isGuest) {
        // Authenticated or Guest:
        // If on public pages, go to dashboard.
        if (['landing', 'auth-login', 'auth-signup'].includes(currentView)) {
          setCurrentView('dashboard');
        }
      } else {
        // Not Authenticated:
        // If on private pages, go to landing.
        if (!['landing', 'auth-login', 'auth-signup'].includes(currentView)) {
          setCurrentView('landing');
        }
      }
    }
  }, [user, isGuest, loading, currentView]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleSetSharedData = (data: {summary?: string; patientName?: string}) => {
    setSharedData(data);
  };

  const renderContent = () => {
    // Show spinner while checking auth
    if (loading) {
      return (
        <div className="flex h-[80vh] items-center justify-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    // Public Routes
    if (!user && !isGuest) {
      switch (currentView) {
        case 'auth-login':
          return <LoginView onNavigate={handleNavigate} />;
        case 'auth-signup':
          return <SignupView onNavigate={handleNavigate} />;
        case 'landing':
        default:
          return <LandingPage onNavigate={handleNavigate} onStartGuest={startGuestMode} />;
      }
    }

    // Protected Routes
    switch (currentView) {
      case 'radiology':
        return <RadiologyView onNavigate={handleNavigate} onSetSharedData={handleSetSharedData} />;
      case 'chat':
        return <ChatInterface onNavigate={handleNavigate} onSetSharedData={handleSetSharedData} />;
      case 'care-finder':
        return <NearbyCareFinder />;
      case 'family-alert':
        return <FamilyAlertView initialSummary={sharedData.summary} patientName={sharedData.patientName} />;
      case 'health-profile':
        return <HealthProfileView onNavigate={handleNavigate} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout>
      <Header currentView={currentView} onNavigate={handleNavigate} />
      {renderContent()}
    </Layout>
  );
};

// Main App Wrapper
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

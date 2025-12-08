
import React, { useState } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RadiologyView from './components/RadiologyView';
import ChatInterface from './components/ChatInterface';
import NearbyCareFinder from './components/NearbyCareFinder';
import FamilyAlertView from './components/FamilyAlertView';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sharedData, setSharedData] = useState<{summary?: string; patientName?: string}>({});

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleSetSharedData = (data: {summary?: string; patientName?: string}) => {
    setSharedData(data);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'radiology':
        return <RadiologyView onNavigate={handleNavigate} onSetSharedData={handleSetSharedData} />;
      case 'chat':
        return <ChatInterface onNavigate={handleNavigate} onSetSharedData={handleSetSharedData} />;
      case 'care-finder':
        return <NearbyCareFinder />;
      case 'family-alert':
        return <FamilyAlertView initialSummary={sharedData.summary} patientName={sharedData.patientName} />;
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

export default App;

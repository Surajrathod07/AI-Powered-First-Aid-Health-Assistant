import React, { useState } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RadiologyView from './components/RadiologyView';
import ChatInterface from './components/ChatInterface';

export type ViewState = 'dashboard' | 'radiology' | 'chat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'radiology':
        return <RadiologyView />;
      case 'chat':
        return <ChatInterface />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout>
      <Header currentView={currentView} onNavigate={setCurrentView} />
      {renderContent()}
    </Layout>
  );
};

export default App;
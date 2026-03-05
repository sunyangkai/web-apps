import React, { Suspense, lazy } from 'react';
import CampaignList from './components/CampaignList';
import CampaignDetail from './components/CampaignDetail';
import './styles/sale.css';

// Lazy load shared components from base module
const Header = lazy(() => import('base/Header'));
const Button = lazy(() => import('base/Button'));

const App = () => {
  const [selectedCampaign, setSelectedCampaign] = React.useState(null);

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleBack = () => {
    setSelectedCampaign(null);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="sale-app">
        <Header
          title="Marketing Campaign Manager"
          subtitle="Create and manage your marketing campaigns"
        />

        <div className="sale-content">
          {selectedCampaign ? (
            <div>
              <Button type="secondary" onClick={handleBack}>
                ← Back to Campaign List
              </Button>
              <CampaignDetail campaign={selectedCampaign} />
            </div>
          ) : (
            <CampaignList onCampaignSelect={handleCampaignSelect} />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default App;

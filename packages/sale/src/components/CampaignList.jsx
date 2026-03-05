import React, { Suspense, lazy } from 'react';
import { formatDate, formatCurrency } from 'base/utils';

const Button = lazy(() => import('base/Button'));

const CampaignList = ({ onCampaignSelect }) => {
  // Mock campaign data
  const campaigns = [
    {
      id: 1,
      name: '春季大促销',
      type: '折扣活动',
      status: 'active',
      budget: 50000,
      spent: 32000,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      clicks: 15420,
      conversions: 423,
    },
    {
      id: 2,
      name: '新用户注册礼',
      type: '注册优惠',
      status: 'active',
      budget: 30000,
      spent: 18500,
      startDate: '2024-02-15',
      endDate: '2024-04-15',
      clicks: 8920,
      conversions: 312,
    },
    {
      id: 3,
      name: '会员日特惠',
      type: '会员专享',
      status: 'scheduled',
      budget: 80000,
      spent: 0,
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      clicks: 0,
      conversions: 0,
    },
    {
      id: 4,
      name: '周末闪购',
      type: '限时抢购',
      status: 'ended',
      budget: 20000,
      spent: 19800,
      startDate: '2024-02-24',
      endDate: '2024-02-25',
      clicks: 12340,
      conversions: 567,
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'scheduled':
        return 'status-scheduled';
      case 'ended':
        return 'status-ended';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'scheduled':
        return '未开始';
      case 'ended':
        return '已结束';
      default:
        return status;
    }
  };

  return (
    <div className="campaign-list">
      <h2>Marketing Campaigns</h2>

      <div className="campaign-cards">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            <div className="card-header">
              <h3>{campaign.name}</h3>
              <span className={`status-badge ${getStatusClass(campaign.status)}`}>
                {getStatusText(campaign.status)}
              </span>
            </div>

            <div className="card-body">
              <div className="campaign-type">
                <strong>Type:</strong> {campaign.type}
              </div>

              <div className="campaign-stats">
                <div className="stat-item">
                  <span className="stat-label">Budget:</span>
                  <span className="stat-value">{formatCurrency(campaign.budget)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Spent:</span>
                  <span className="stat-value">{formatCurrency(campaign.spent)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Clicks:</span>
                  <span className="stat-value">{campaign.clicks.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Conversions:</span>
                  <span className="stat-value">{campaign.conversions.toLocaleString()}</span>
                </div>
              </div>

              <div className="campaign-dates">
                <div>
                  <strong>Start:</strong> {formatDate(campaign.startDate)}
                </div>
                <div>
                  <strong>End:</strong> {formatDate(campaign.endDate)}
                </div>
              </div>

              <div className="budget-bar">
                <div
                  className="budget-progress"
                  style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                />
              </div>
              <div className="budget-text">
                {((campaign.spent / campaign.budget) * 100).toFixed(1)}% of budget used
              </div>
            </div>

            <div className="card-footer">
              <Suspense fallback={<button>...</button>}>
                <Button type="primary" onClick={() => onCampaignSelect(campaign)}>
                  View Details
                </Button>
              </Suspense>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignList;

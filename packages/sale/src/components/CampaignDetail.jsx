import React, { Suspense, lazy } from 'base/react';
import { formatDate, formatCurrency } from 'base/utils';

const Button = lazy(() => import('base/Button'));

const CampaignDetail = ({ campaign }) => {
  const handleEdit = () => {
    alert(`Edit campaign: ${campaign.name}`);
  };

  const handlePause = () => {
    alert(`Pause campaign: ${campaign.name}`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete campaign: ${campaign.name}?`)) {
      alert(`Campaign ${campaign.name} deleted!`);
    }
  };

  const conversionRate = campaign.clicks > 0
    ? ((campaign.conversions / campaign.clicks) * 100).toFixed(2)
    : 0;

  const costPerConversion = campaign.conversions > 0
    ? campaign.spent / campaign.conversions
    : 0;

  return (
    <div className="campaign-detail">
      <h2>Campaign Details</h2>

      <div className="detail-card">
        <div className="detail-header">
          <h3>{campaign.name}</h3>
          <span className={`status-badge status-${campaign.status}`}>
            {campaign.status === 'active' ? '进行中' : campaign.status === 'scheduled' ? '未开始' : '已结束'}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h4>Basic Information</h4>
            <div className="info-row">
              <span className="label">Campaign ID:</span>
              <span className="value">{campaign.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Campaign Type:</span>
              <span className="value">{campaign.type}</span>
            </div>
            <div className="info-row">
              <span className="label">Start Date:</span>
              <span className="value">{formatDate(campaign.startDate)}</span>
            </div>
            <div className="info-row">
              <span className="label">End Date:</span>
              <span className="value">{formatDate(campaign.endDate)}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Budget & Spending</h4>
            <div className="info-row">
              <span className="label">Total Budget:</span>
              <span className="value">{formatCurrency(campaign.budget)}</span>
            </div>
            <div className="info-row">
              <span className="label">Amount Spent:</span>
              <span className="value spent">{formatCurrency(campaign.spent)}</span>
            </div>
            <div className="info-row">
              <span className="label">Remaining:</span>
              <span className="value remaining">{formatCurrency(campaign.budget - campaign.spent)}</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {((campaign.spent / campaign.budget) * 100).toFixed(1)}% used
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Performance Metrics</h4>
            <div className="info-row">
              <span className="label">Total Clicks:</span>
              <span className="value">{campaign.clicks.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Conversions:</span>
              <span className="value">{campaign.conversions.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Conversion Rate:</span>
              <span className="value">{conversionRate}%</span>
            </div>
            <div className="info-row">
              <span className="label">Cost per Conversion:</span>
              <span className="value">{formatCurrency(costPerConversion)}</span>
            </div>
          </div>
        </div>

        <Suspense fallback={<div>Loading actions...</div>}>
          <div className="detail-actions">
            <Button type="primary" onClick={handleEdit}>
              Edit Campaign
            </Button>
            <Button type="secondary" onClick={handlePause}>
              {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
            </Button>
            <Button type="danger" onClick={handleDelete}>
              Delete Campaign
            </Button>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default CampaignDetail;

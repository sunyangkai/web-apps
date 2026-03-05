import React, { Suspense, lazy } from 'react';
import { formatDate } from 'base/utils';

const Button = lazy(() => import('base/Button'));

const UserProfile = ({ user }) => {
  const handleEdit = () => {
    alert(`Edit user: ${user.name}`);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete user: ${user.name}?`)) {
      alert(`User ${user.name} deleted!`);
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {user.name.charAt(0)}
          </div>
          <div className="profile-info">
            <h3>{user.name}</h3>
            <p className="email">{user.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="label">User ID:</span>
            <span className="value">{user.id}</span>
          </div>
          <div className="detail-row">
            <span className="label">Role:</span>
            <span className="value">
              <span className={`role-badge role-${user.role === '管理员' ? 'admin' : 'user'}`}>
                {user.role}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Join Date:</span>
            <span className="value">{formatDate(user.joinDate)}</span>
          </div>
        </div>

        <Suspense fallback={<div>Loading buttons...</div>}>
          <div className="profile-actions">
            <Button type="primary" onClick={handleEdit}>
              Edit Profile
            </Button>
            <Button type="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default UserProfile;

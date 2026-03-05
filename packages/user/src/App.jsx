import React, { Suspense, lazy } from 'react';
import UserList from './components/UserList';
import UserProfile from './components/UserProfile';
import './styles/user.css';

// Lazy load shared components from base module
const Header = lazy(() => import('base/Header'));
const Button = lazy(() => import('base/Button'));

const App = () => {
  const [selectedUser, setSelectedUser] = React.useState(null);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="user-app">
        <Header
          title="User Management System"
          subtitle="Manage users and their profiles"
        />

        <div className="user-content">
          {selectedUser ? (
            <div>
              <Button type="secondary" onClick={handleBack}>
                ← Back to User List
              </Button>
              <UserProfile user={selectedUser} />
            </div>
          ) : (
            <UserList onUserSelect={handleUserSelect} />
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default App;

import React, { Suspense, lazy } from 'base/react';
import { formatDate } from 'base/utils';

const Button = lazy(() => import('base/Button'));

const UserList = ({ onUserSelect }) => {
  // Mock user data
  const users = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: '管理员', joinDate: '2024-01-15' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: '普通用户', joinDate: '2024-02-20' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: '编辑', joinDate: '2024-03-01' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: '普通用户', joinDate: '2024-03-05' },
  ];

  return (
    <div className="user-list">
      <h2>User List</h2>
      <div className="user-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role === '管理员' ? 'admin' : 'user'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{formatDate(user.joinDate)}</td>
                <td>
                  <Suspense fallback={<button>...</button>}>
                    <Button type="primary" onClick={() => onUserSelect(user)}>
                      View Details
                    </Button>
                  </Suspense>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;

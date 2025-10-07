import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/users';

function RoleManagement() {
  const [users, setUsers] = useState([]);
  const [roleStats, setRoleStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  // 取得所有用戶和角色統計
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 並行請求用戶列表和角色統計
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/admin/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_URL}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (usersRes.ok && statsRes.ok) {
        const usersData = await usersRes.json();
        const statsData = await statsRes.json();
        setUsers(usersData);
        setRoleStats(statsData);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 修改用戶角色
  const changeUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/change-role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId: userId,
          newRole: newRole
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchData(); // 重新載入數據
        setSelectedUser(null);
        setNewRole('');
      } else {
        const error = await response.json();
        alert(error.message || '修改角色失敗');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('修改角色時發生錯誤');
    }
  };

  // 處理角色修改
  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  // 確認修改角色
  const confirmRoleChange = () => {
    if (selectedUser && newRole && newRole !== selectedUser.role) {
      changeUserRole(selectedUser._id, newRole);
    }
  };

  // 取消修改
  const cancelRoleChange = () => {
    setSelectedUser(null);
    setNewRole('');
  };

  // 獲取角色徽章樣式
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'bg-danger';
      case 'coach': return 'bg-warning';
      case 'member': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // 獲取角色顯示名稱
  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return '管理員';
      case 'coach': return '教練';
      case 'member': return '會員';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">載入中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">角色管理</h1>
      
      {/* 角色統計卡片 */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">總用戶數</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{roleStats.total || 0}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">會員</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{roleStats.member || 0}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">教練</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{roleStats.coach || 0}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-danger shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">管理員</div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{roleStats.admin || 0}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-crown fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 用戶列表 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">用戶角色管理</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>電子郵件</th>
                  <th>目前角色</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleRoleChange(user)}
                        disabled={user.role === 'admin'}
                      >
                        修改角色
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 角色修改模態框 */}
      {selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">修改用戶角色</h5>
              </div>
              <div className="modal-body">
                <p><strong>用戶：</strong>{selectedUser.first_name} {selectedUser.last_name}</p>
                <p><strong>電子郵件：</strong>{selectedUser.email}</p>
                <div className="form-group">
                  <label>新角色：</label>
                  <select 
                    className="form-control" 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)}
                  >
                    <option value="member">會員</option>
                    <option value="coach">教練</option>
                    <option value="admin">管理員</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={cancelRoleChange}
                >
                  取消
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={confirmRoleChange}
                  disabled={newRole === selectedUser.role}
                >
                  確認修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;


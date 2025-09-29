import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/auth';

function Topbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地儲存
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 重定向到登入頁面
      navigate('/login');
    }
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown no-arrow">
          <button 
            className="nav-link dropdown-toggle btn btn-link" 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ border: 'none', background: 'none' }}
          >
            <span className="mr-2 d-none d-lg-inline text-gray-600 small">
              {user ? `${user.first_name} ${user.last_name}` : 'Admin'}
            </span>
            <img 
              className="img-profile rounded-circle" 
              src={user?.avatar || "https://source.unsplash.com/QAB-WJcbgJk/60x60"} 
              alt="avatar" 
              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            />
          </button>
          
          {showDropdown && (
            <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in">
              <div className="dropdown-item">
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                個人資料
              </div>
              <div className="dropdown-item">
                <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                設定
              </div>
              <div className="dropdown-divider"></div>
              <button 
                className="dropdown-item" 
                onClick={handleLogout}
                style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
              >
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                登出
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Topbar; 
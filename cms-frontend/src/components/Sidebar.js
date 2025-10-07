import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      {/* Sidebar - Brand */}
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink"></i>
        </div>
        <div className="sidebar-brand-text mx-3">CMS Admin</div>
      </a>
      {/* Divider */}
      <hr className="sidebar-divider my-0" />
      {/* Nav Item - Dashboard */}
      <li className="nav-item active">
        <Link className="nav-link" to="/">
          <i className="fas fa-fw fa-tachometer-alt"></i>
          <span>Dashboard</span></Link>
      </li>
      {/* Divider */}
      <hr className="sidebar-divider" />
      {/* Heading */}
      <div className="sidebar-heading">Management</div>
      <li className="nav-item">
        <Link className="nav-link" to="/events">
          <i className="fas fa-calendar-alt"></i>
          <span>Events</span></Link>
      </li>
      {/* 只有管理員可以看到分類管理 */}
      {user && user.role === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/categories">
            <i className="fas fa-tags"></i>
            <span>Categories</span></Link>
        </li>
      )}
      
      {/* 只有管理員可以看到用戶管理和角色管理 */}
      {user && user.role === 'admin' && (
        <>
          <li className="nav-item">
            <Link className="nav-link" to="/users">
              <i className="fas fa-user-friends"></i>
              <span>Users</span></Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/role-management">
              <i className="fas fa-user-shield"></i>
              <span>Role Management</span></Link>
          </li>
        </>
      )}
      
      {/* 只有管理員可以看到訂閱管理 */}
      {user && user.role === 'admin' && (
        <li className="nav-item">
          <Link className="nav-link" to="/subscriptions">
            <i className="fas fa-mail-bulk"></i>
            <span>Subscriptions</span></Link>
        </li>
      )}
      {/* Divider */}
      <hr className="sidebar-divider d-none d-md-block" />
    </ul>
  );
}

export default Sidebar; 
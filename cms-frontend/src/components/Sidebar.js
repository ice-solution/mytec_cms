import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
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
          <i className="fas fa-calendar"></i>
          <span>Events</span></Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/categories">
          <i className="fas fa-list"></i>
          <span>Categories</span></Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/users">
          <i className="fas fa-users"></i>
          <span>Users</span></Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/notifications">
          <i className="fas fa-bell"></i>
          <span>Notifications</span></Link>
      </li>
      {/* Divider */}
      <hr className="sidebar-divider d-none d-md-block" />
    </ul>
  );
}

export default Sidebar; 
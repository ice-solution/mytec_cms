import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // 只有管理員可以訪問
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default AdminRoute;


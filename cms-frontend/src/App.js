import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Events from './components/Events';
import EventDetails from './components/EventDetails';
import EventCreate from './components/EventCreate';
import EventGuestList from './components/EventGuestList';
import Categories from './components/Categories';
import Users from './components/Users';
import SubscriptionManagement from './components/SubscriptionManagement';
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard() {
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Dashboard</h1>
      <div className="alert alert-info">歡迎使用 MyTEC CMS！請從左側選單選擇管理項目。</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 公開路由 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保護的路由 */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div id="wrapper">
              <Sidebar />
              <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                  <Topbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events/new" element={<EventCreate />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                    <Route path="/events/:eventId/guests" element={<EventGuestList />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/subscriptions" element={<SubscriptionManagement />} />
                    {/* 之後可加上 Notifications 頁面 */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

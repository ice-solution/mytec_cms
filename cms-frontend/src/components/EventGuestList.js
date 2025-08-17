import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/event-guests';
const EVENT_API = process.env.REACT_APP_API_URL + '/api/events';

function EventGuestList() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, joined, checked_in, cancelled

  // 取得事件詳情
  const fetchEvent = async () => {
    try {
      const res = await fetch(`${EVENT_API}/${eventId}`);
      if (!res.ok) {
        throw new Error('Event not found');
      }
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('無法載入事件詳情');
      navigate('/events');
    }
  };

  // 取得參加者列表
  const fetchGuests = async () => {
    try {
      const res = await fetch(`${API_URL}/event/${eventId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch guests');
      }
      const data = await res.json();
      setGuests(data);
    } catch (error) {
      console.error('Error fetching guests:', error);
      alert('無法載入參加者列表');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvent(),
        fetchGuests()
      ]);
      setLoading(false);
    };
    loadData();
  }, [eventId]);

  // 過濾參加者
  const filteredGuests = guests.filter(guest => {
    switch (filter) {
      case 'joined':
        return guest.status === 'joined';
      case 'checked_in':
        return guest.status === 'checked_in';
      case 'cancelled':
        return guest.status === 'cancelled';
      default:
        return true;
    }
  });

  // 更新參加者狀態
  const updateGuestStatus = async (guestId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${guestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        throw new Error('Failed to update guest status');
      }
      
      alert('狀態更新成功！');
      fetchGuests(); // 重新載入資料
    } catch (error) {
      console.error('Error updating guest status:', error);
      alert('更新失敗，請重試');
    }
  };

  // 刪除參加者
  const deleteGuest = async (guestId) => {
    if (!window.confirm('確定要移除這個參加者嗎？')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/${guestId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete guest');
      }
      
      alert('參加者已移除！');
      fetchGuests(); // 重新載入資料
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('移除失敗，請重試');
    }
  };

  // 獲取用戶詳情（直接使用 API 返回的用戶資訊）
  const getUserDetails = (user) => {
    if (!user) {
      return { name: '未知用戶', email: 'N/A', avatar: null };
    }
    
    return {
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || '未命名用戶',
      email: user.email || 'N/A',
      avatar: user.avatar
    };
  };

  // 狀態標籤
  const getStatusBadge = (status) => {
    const statusMap = {
      'joined': { label: '已參加', class: 'bg-success' },
      'checked_in': { label: '已簽到', class: 'bg-primary' },
      'cancelled': { label: '已取消', class: 'bg-danger' }
    };
    
    const statusInfo = statusMap[status] || { label: status || '未知狀態', class: 'bg-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">事件不存在</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-gray-800">參加者管理</h1>
          <p className="text-muted">
            事件：{event.title} | 
            總參加者：{guests.length} 人
          </p>
        </div>
        <div>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate(`/events/${eventId}`)}
          >
            返回事件詳情
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/events')}
          >
            返回事件列表
          </button>
        </div>
      </div>

      {/* 事件資訊卡片 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">事件資訊</h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>標題：</strong>{event.title}</p>
              <p><strong>日期：</strong>{new Date(event.date).toLocaleString()}</p>
              <p><strong>地點：</strong>{event.location}</p>
            </div>
            <div className="col-md-6">
              <p><strong>分類：</strong>{event.category}</p>
              <p><strong>費用：</strong>${event.cost}</p>
              <p><strong>參加者數量：</strong>{guests.length} 人</p>
            </div>
          </div>
        </div>
      </div>

      {/* 過濾器 */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="m-0 font-weight-bold text-primary">參加者列表</h6>
            <div>
              <select 
                className="form-select form-select-sm" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">全部 ({guests.length})</option>
                <option value="joined">已參加 ({guests.filter(g => g.status === 'joined').length})</option>
                <option value="checked_in">已簽到 ({guests.filter(g => g.status === 'checked_in').length})</option>
                <option value="cancelled">已取消 ({guests.filter(g => g.status === 'cancelled').length})</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>用戶</th>
                  <th>參加時間</th>
                  <th>狀態</th>
                  <th>簽到時間</th>
                  <th>票券</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest, idx) => {
                  const userDetails = getUserDetails(guest.user);
                  return (
                    <tr key={guest._id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {userDetails.avatar && (
                            <img 
                              src={process.env.REACT_APP_API_URL + userDetails.avatar} 
                              alt="avatar" 
                              width="32" 
                              height="32" 
                              className="rounded-circle me-2"
                            />
                          )}
                          <div>
                            <div><strong>{userDetails.name}</strong></div>
                            <small className="text-muted">{userDetails.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {guest.joined_at ? new Date(guest.joined_at).toLocaleString() : 'N/A'}
                      </td>
                      <td>
                        {getStatusBadge(guest.status)}
                      </td>
                      <td>
                        {guest.checkin_at ? new Date(guest.checkin_at).toLocaleString() : '未簽到'}
                      </td>
                      <td>
                        {guest.event_ticket ? (
                          <span className="badge bg-info">有票券</span>
                        ) : (
                          <span className="text-muted">無票券</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-sm btn-outline-primary dropdown-toggle" 
                            data-bs-toggle="dropdown"
                          >
                            狀態
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => updateGuestStatus(guest._id, 'joined')}
                                disabled={guest.status === 'joined'}
                              >
                                設為已參加
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => updateGuestStatus(guest._id, 'checked_in')}
                                disabled={guest.status === 'checked_in'}
                              >
                                設為已簽到
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => updateGuestStatus(guest._id, 'cancelled')}
                                disabled={guest.status === 'cancelled'}
                              >
                                設為已取消
                              </button>
                            </li>
                          </ul>
                        </div>
                        <button 
                          className="btn btn-sm btn-danger ms-1" 
                          onClick={() => deleteGuest(guest._id)}
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">
                      沒有找到符合條件的參加者
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventGuestList;

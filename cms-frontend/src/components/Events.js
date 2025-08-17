import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/events';
const CATEGORY_API = process.env.REACT_APP_API_URL + '/api/categories';
const USER_API = process.env.REACT_APP_API_URL + '/api/users';

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);

  // 取得所有活動
  const fetchEvents = async () => {
    const res = await fetch(API_URL);
    const result = await res.json();
    setEvents(result.data || []); // 只存陣列
    // 你也可以存 result.total, result.page, result.limit 來做分頁
  };

  // 取得所有分類
  const fetchCategories = async () => {
    const res = await fetch(CATEGORY_API);
    const data = await res.json();
    setCategories(data);
  };

  // 取得所有用戶
  const fetchUsers = async () => {
    const res = await fetch(USER_API);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchUsers();
  }, []);

  // 刪除活動
  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這個事件嗎？此操作無法復原。')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete event');
      }
      alert('事件刪除成功！');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('刪除失敗，請重試');
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 text-gray-800">Events</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/events/new')}
        >
          新增事件
        </button>
      </div>

      {/* Event Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Event List</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Cost</th>
                  <th>Owner</th>
                  <th>Image</th>
                  <th>SEO</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={event._id}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{event.title}</strong>
                    </td>
                    <td>
                      <small className="text-muted">{event.slug}</small>
                      <br />
                      <small className="text-info">/events/{event.category?.toLowerCase().replace(/\s+/g, '-')}/{event.slug}</small>
                    </td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>{event.category}</td>
                    <td>{event.cost}</td>
                    <td>{users.find(u => u._id === event.owner) ? `${users.find(u => u._id === event.owner).first_name || ''} ${users.find(u => u._id === event.owner).last_name || ''}` : ''}</td>
                    <td>{event.event_img ? <img src={process.env.REACT_APP_API_URL + event.event_img} alt="event" width={48} height={48} style={{borderRadius: 8}} /> : ''}</td>
                    <td>
                      {event.meta_title && <div><small className="text-success">✓ Title</small></div>}
                      {event.meta_description && <div><small className="text-success">✓ Description</small></div>}
                      {event.meta_keywords && <div><small className="text-success">✓ Keywords</small></div>}
                      {event.og_image && <div><small className="text-success">✓ OG Image</small></div>}
                      {!event.meta_title && !event.meta_description && !event.meta_keywords && !event.og_image && 
                        <div><small className="text-warning">⚠ No SEO</small></div>
                      }
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary me-2" 
                        onClick={() => navigate(`/events/${event._id}`)}
                      >
                        編輯
                      </button>
                      <button 
                        className="btn btn-sm btn-danger me-2" 
                        onClick={() => handleDelete(event._id)}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Events; 
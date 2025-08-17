import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/events';
const CATEGORY_API = process.env.REACT_APP_API_URL + '/api/categories';
const USER_API = process.env.REACT_APP_API_URL + '/api/users';
const UPLOAD_EVENT_IMG_URL = process.env.REACT_APP_API_URL + '/api/events/upload-event-img';
const TICKET_API = process.env.REACT_APP_API_URL + '/api/event-tickets';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [eventImgFile, setEventImgFile] = useState(null);
  const [eventImgPreview, setEventImgPreview] = useState('');
  const [ogImgFile, setOgImgFile] = useState(null);
  const [ogImgPreview, setOgImgPreview] = useState('');
  const eventImgInputRef = useRef();
  const ogImgInputRef = useRef();

  // Ticket 相關狀態
  const [tickets, setTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    ticket_name: '',
    cost: '',
    ticket_available_date: '',
    _id: null
  });
  const [editingTicket, setEditingTicket] = useState(false);

  // 取得事件詳情
  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) {
        throw new Error('Event not found');
      }
      const data = await res.json();
      setEvent(data);
      setEventImgPreview(data.event_img ? (process.env.REACT_APP_API_URL + data.event_img) : '');
      setOgImgPreview(data.og_image ? (process.env.REACT_APP_API_URL + data.og_image) : '');
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('無法載入事件詳情');
      navigate('/events');
    }
  };

  // 取得所有分類
  const fetchCategories = async () => {
    const res = await fetch(CATEGORY_API);
    const data = await res.json();
    setCategories(data);
  };

  // 取得所有用戶
  const fetchUsers = async (search = '') => {
    const res = await fetch(USER_API);
    const data = await res.json();
    setUsers(
      search
        ? data.filter(u => (((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase().includes(search.toLowerCase())))
        : data
    );
  };

  // 取得票券
  const fetchTickets = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${TICKET_API}/event/${id}`);
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvent(),
        fetchCategories(),
        fetchUsers(),
        fetchTickets()
      ]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  // 處理表單輸入
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent({ ...event, [name]: type === 'checkbox' ? checked : value });
  };

  // Owner autocomplete
  const handleOwnerSearch = (e) => {
    setOwnerSearch(e.target.value);
    fetchUsers(e.target.value);
  };

  // 處理圖片選擇
  const handleEventImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('只允許 jpg 或 png 圖片');
      eventImgInputRef.current.value = '';
      return;
    }
    setEventImgFile(file);
    setEventImgPreview(URL.createObjectURL(file));
  };

  // 處理 OG 圖片選擇
  const handleOgImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('只允許 jpg 或 png 圖片');
      ogImgInputRef.current.value = '';
      return;
    }
    setOgImgFile(file);
    setOgImgPreview(URL.createObjectURL(file));
  };

  // 上傳 event_img 並取得 URL
  const uploadEventImg = async () => {
    if (!eventImgFile) return event.event_img;
    const formData = new FormData();
    formData.append('event_img', eventImgFile);
    const res = await fetch(UPLOAD_EVENT_IMG_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url;
  };

  // 上傳 og_image 並取得 URL
  const uploadOgImg = async () => {
    if (!ogImgFile) return event.og_image;
    const formData = new FormData();
    formData.append('event_img', ogImgFile);
    const res = await fetch(UPLOAD_EVENT_IMG_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url;
  };

  // 儲存事件
  const handleSave = async () => {
    try {
      setSaving(true);
      let eventImgUrl = event.event_img;
      let ogImgUrl = event.og_image;
      
      if (eventImgFile) {
        eventImgUrl = await uploadEventImg();
      }
      if (ogImgFile) {
        ogImgUrl = await uploadOgImg();
      }
      
      const payload = { 
        ...event, 
        event_img: eventImgUrl,
        og_image: ogImgUrl
      };
      
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error('Failed to update event');
      }
      
      alert('事件更新成功！');
      navigate('/events');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('儲存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  // 刪除事件
  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這個事件嗎？此操作無法復原。')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Failed to delete event');
      }
      alert('事件刪除成功！');
      navigate('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('刪除失敗，請重試');
    }
  };

  // Ticket 相關函數
  const handleTicketChange = (e) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...ticketForm,
        cost: Number(ticketForm.cost),
        event: id
      };
      
      if (editingTicket) {
        await fetch(`${TICKET_API}/${ticketForm._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch(TICKET_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      setTicketForm({ ticket_name: '', cost: '', ticket_available_date: '', _id: null });
      setEditingTicket(false);
      fetchTickets();
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('票券儲存失敗，請重試');
    }
  };

  const handleTicketEdit = (ticket) => {
    setTicketForm({ ...ticket, cost: ticket.cost || '', _id: ticket._id });
    setEditingTicket(true);
  };

  const handleTicketDelete = async (ticketId) => {
    if (!window.confirm('確定要刪除這個票券嗎？')) {
      return;
    }
    
    try {
      await fetch(`${TICKET_API}/${ticketId}`, { method: 'DELETE' });
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      alert('票券刪除失敗，請重試');
    }
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
          <h1 className="h3 text-gray-800">編輯事件</h1>
          <p className="text-muted">ID: {event._id}</p>
        </div>
        <div>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate('/events')}
          >
            返回列表
          </button>
          <button 
            className="btn btn-info me-2" 
            onClick={() => navigate(`/events/${id}/guests`)}
          >
            參加者列表
          </button>
          <button 
            className="btn btn-danger me-2" 
            onClick={handleDelete}
          >
            刪除事件
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>

      <div className="row">
        {/* 左側：基本資訊 */}
        <div className="col-lg-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">基本資訊</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">事件標題 *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="title" 
                    value={event.title || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">日期時間 *</label>
                  <input 
                    type="datetime-local" 
                    className="form-control" 
                    name="date" 
                    value={event.date || ''} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">地點</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="location" 
                    value={event.location || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">分類 *</label>
                  <select 
                    className="form-control" 
                    name="category" 
                    value={event.category || ''} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">選擇分類</option>
                    {categories.map(cat => (
                      <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">費用</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="cost" 
                    value={event.cost || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">主辦者 *</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      name="owner"
                      placeholder="搜尋主辦者"
                      value={ownerSearch || (event.owner && users.find(u => u._id === event.owner) ? `${users.find(u => u._id === event.owner).first_name || ''} ${users.find(u => u._id === event.owner).last_name || ''}` : '')}
                      onChange={handleOwnerSearch}
                      autoComplete="off"
                      required
                    />
                    {ownerSearch && users.length > 0 && (
                      <ul className="list-group position-absolute w-100" style={{ zIndex: 10 }}>
                        {users.map(u => (
                          <li
                            key={u._id}
                            className="list-group-item list-group-item-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setEvent({ ...event, owner: u._id });
                              setOwnerSearch('');
                            }}
                          >
                            {(u.first_name || '') + ' ' + (u.last_name || '')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">描述</label>
                  <textarea 
                    className="form-control" 
                    name="description" 
                    rows="4"
                    value={event.description || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO 設定 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">SEO 設定</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Slug *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="slug" 
                    value={event.slug || ''} 
                    onChange={handleChange} 
                    placeholder="event-slug"
                    required
                  />
                  <small className="text-muted">用於 URL，例如：awesome-concert-2024</small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Meta Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="meta_title" 
                    value={event.meta_title || ''} 
                    onChange={handleChange} 
                    placeholder="SEO 標題"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Meta Keywords</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="meta_keywords" 
                    value={event.meta_keywords || ''} 
                    onChange={handleChange} 
                    placeholder="關鍵字（用逗號分隔）"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">URL 預覽</label>
                  <div className="form-control-plaintext">
                    <small className="text-info">
                      /category/{event.category?.toLowerCase().replace(/\s+/g, '-')}/{event.slug || 'your-slug'}
                    </small>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Meta Description</label>
                  <textarea 
                    className="form-control" 
                    name="meta_description" 
                    rows="3"
                    value={event.meta_description || ''} 
                    onChange={handleChange} 
                    placeholder="SEO 描述"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 票券管理 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">票券管理</h6>
            </div>
            <div className="card-body">
              {/* 票券表單 */}
              <form onSubmit={handleTicketSubmit} className="mb-4">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">票券名稱 *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="ticket_name" 
                      placeholder="票券名稱" 
                      value={ticketForm.ticket_name} 
                      onChange={handleTicketChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">價格 *</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="cost" 
                      placeholder="價格" 
                      value={ticketForm.cost} 
                      onChange={handleTicketChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">開售日期 *</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="ticket_available_date" 
                      value={ticketForm.ticket_available_date ? ticketForm.ticket_available_date.slice(0,10) : ''} 
                      onChange={handleTicketChange} 
                      required 
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">&nbsp;</label>
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                    >
                      {editingTicket ? '更新' : '新增'}
                    </button>
                  </div>
                </div>
              </form>

              {/* 票券列表 */}
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>票券名稱</th>
                      <th>價格</th>
                      <th>開售日期</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket._id}>
                        <td>{ticket.ticket_name}</td>
                        <td>${ticket.cost}</td>
                        <td>{ticket.ticket_available_date ? ticket.ticket_available_date.slice(0,10) : ''}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning me-2" 
                            onClick={() => handleTicketEdit(ticket)}
                          >
                            編輯
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleTicketDelete(ticket._id)}
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          尚未建立任何票券
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：圖片和資訊 */}
        <div className="col-lg-4">
          {/* 事件圖片 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">事件圖片</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">上傳新圖片</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/jpeg,image/png" 
                  ref={eventImgInputRef} 
                  onChange={handleEventImgChange} 
                />
              </div>
              {eventImgPreview && (
                <div className="text-center">
                  <img 
                    src={eventImgPreview} 
                    alt="event preview" 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* OG 圖片 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">社群分享圖片 (OG Image)</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">上傳 OG 圖片</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/jpeg,image/png" 
                  ref={ogImgInputRef} 
                  onChange={handleOgImgChange} 
                />
              </div>
              {ogImgPreview && (
                <div className="text-center">
                  <img 
                    src={ogImgPreview} 
                    alt="OG preview" 
                    className="img-fluid rounded" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 事件資訊 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">事件資訊</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Slug:</strong>
                <div className="text-muted small">{event.slug}</div>
              </div>
              <div className="mb-3">
                <strong>URL:</strong>
                <div className="text-info small">
                  /events/{event.category?.toLowerCase().replace(/\s+/g, '-')}/{event.slug}
                </div>
              </div>
              <div className="mb-3">
                <strong>票券數量:</strong>
                <div className="text-muted small">{tickets.length} 種票券</div>
              </div>
              <div className="mb-3">
                <strong>建立時間:</strong>
                <div className="text-muted small">
                  {new Date(event.created_at).toLocaleString()}
                </div>
              </div>
              <div className="mb-3">
                <strong>最後更新:</strong>
                <div className="text-muted small">
                  {new Date(event.modified_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;

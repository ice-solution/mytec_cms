import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/events';
const CATEGORY_API = process.env.REACT_APP_API_URL + '/api/categories';
const USER_API = process.env.REACT_APP_API_URL + '/api/users';
const UPLOAD_EVENT_IMG_URL = process.env.REACT_APP_API_URL + '/api/events/upload-event-img';

function EventCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [eventImgFile, setEventImgFile] = useState(null);
  const [eventImgPreview, setEventImgPreview] = useState('');
  const [ogImgFile, setOgImgFile] = useState(null);
  const [ogImgPreview, setOgImgPreview] = useState('');
  const eventImgInputRef = useRef();
  const ogImgInputRef = useRef();

  // 事件表單狀態
  const [form, setForm] = useState({
    title: '',
    date: '',
    location: '',
    category: '',
    description: '',
    cost: '',
    owner: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    event_img: '',
    og_image: ''
  });

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

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  // 處理表單輸入
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
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
    if (!eventImgFile) return form.event_img;
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
    if (!ogImgFile) return form.og_image;
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
      let eventImgUrl = form.event_img;
      let ogImgUrl = form.og_image;
      
      if (eventImgFile) {
        eventImgUrl = await uploadEventImg();
      }
      if (ogImgFile) {
        ogImgUrl = await uploadOgImg();
      }
      
      const payload = { 
        ...form, 
        event_img: eventImgUrl,
        og_image: ogImgUrl
      };
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error('Failed to create event');
      }
      
      alert('事件建立成功！');
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('建立失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-gray-800">新增事件</h1>
        </div>
        <div>
          <button 
            className="btn btn-secondary me-2" 
            onClick={() => navigate('/events')}
          >
            返回列表
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '建立中...' : '建立事件'}
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
                    value={form.title} 
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
                    value={form.date} 
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
                    value={form.location} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">分類 *</label>
                  <select 
                    className="form-control" 
                    name="category" 
                    value={form.category} 
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
                    value={form.cost} 
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
                      value={ownerSearch || (form.owner && users.find(u => u._id === form.owner) ? `${users.find(u => u._id === form.owner).first_name || ''} ${users.find(u => u._id === form.owner).last_name || ''}` : '')}
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
                              setForm({ ...form, owner: u._id });
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
                    value={form.description} 
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
                    value={form.slug} 
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
                    value={form.meta_title} 
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
                    value={form.meta_keywords} 
                    onChange={handleChange} 
                    placeholder="關鍵字（用逗號分隔）"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">URL 預覽</label>
                  <div className="form-control-plaintext">
                    <small className="text-info">
                      /events/{form.category?.toLowerCase().replace(/\s+/g, '-')}/{form.slug || 'your-slug'}
                    </small>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Meta Description</label>
                  <textarea 
                    className="form-control" 
                    name="meta_description" 
                    rows="3"
                    value={form.meta_description} 
                    onChange={handleChange} 
                    placeholder="SEO 描述"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：圖片 */}
        <div className="col-lg-4">
          {/* 事件圖片 */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">事件圖片</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">上傳圖片</label>
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
        </div>
      </div>
    </div>
  );
}

export default EventCreate;

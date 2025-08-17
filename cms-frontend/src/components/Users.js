import React, { useEffect, useState, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/users';
const UPLOAD_URL = process.env.REACT_APP_API_URL + '/api/users/upload-avatar';

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    country_code: '',
    phone: '',
    email: '',
    gender: '',
    birth: '',
    password: '',
    avatar: '',
    _id: null
  });
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef();

  // 取得所有用戶
  const fetchUsers = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 處理表單輸入
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 處理圖片選擇
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('只允許 jpg 或 png 圖片');
      fileInputRef.current.value = '';
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // 上傳圖片並取得 URL
  const uploadAvatar = async () => {
    if (!avatarFile) return form.avatar;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url;
  };

  // 新增或更新用戶
  const handleSubmit = async (e) => {
    e.preventDefault();
    let avatarUrl = form.avatar;
    if (avatarFile) {
      avatarUrl = await uploadAvatar();
    }
    const payload = { ...form, avatar: avatarUrl };
    if (!payload.first_name || !payload.last_name || !payload.email) {
      alert('First name, last name, and email are required.');
      return;
    }
    if (payload.password && payload.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (editing) {
      await fetch(`${API_URL}/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setForm({ first_name: '', last_name: '', country_code: '', phone: '', email: '', gender: '', birth: '', password: '', avatar: '', _id: null });
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchUsers();
  };

  // 編輯用戶
  const handleEdit = (user) => {
    setForm({ ...user, birth: user.birth ? user.birth.slice(0, 10) : '', password: '', _id: user._id });
    setEditing(true);
    setAvatarPreview(user.avatar || '');
    setAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 刪除用戶
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchUsers();
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Users</h1>
      {/* User Form */}
      <form onSubmit={handleSubmit} className="mb-4 row g-2 align-items-center">
        <div className="col-md-2">
          <input type="text" className="form-control" name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
        </div>
        <div className="col-md-1">
          <input type="text" className="form-control" name="country_code" placeholder="Code" value={form.country_code} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="text" className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="col-md-2">
          <input type="email" className="form-control" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="col-md-1">
          <select className="form-control" name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div className="col-md-2">
          <input type="date" className="form-control" name="birth" value={form.birth} onChange={handleChange} />
        </div>
        <div className="col-md-2 mt-2">
          <input type="password" className="form-control" name="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="new-password" />
        </div>
        <div className="col-md-3 mt-2">
          <input type="file" className="form-control" accept="image/jpeg,image/png" ref={fileInputRef} onChange={handleAvatarChange} />
          {avatarPreview && (
            <img src={avatarPreview} alt="avatar preview" width={32} height={32} style={{borderRadius: '50%', marginTop: 4}} />
          )}
        </div>
        <div className="col-md-2 mt-2">
          <button type="submit" className="btn btn-primary w-100">{editing ? 'Update' : 'Add'}</button>
        </div>
      </form>
      {/* User Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">User List</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Country</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Gender</th>
                  <th>Birth</th>
                  <th>Avatar</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id}>
                    <td>{idx + 1}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.country_code}</td>
                    <td>{user.phone}</td>
                    <td>{user.email}</td>
                    <td>{user.gender}</td>
                    <td>{user.birth ? user.birth.slice(0, 10) : ''}</td>
                    <td>{user.avatar ? <img src={process.env.REACT_APP_API_URL + user.avatar} alt="avatar" width={32} height={32} style={{borderRadius: '50%'}} /> : ''}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(user)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
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

export default Users; 
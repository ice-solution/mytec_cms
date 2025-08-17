import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/categories';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', display: true, _id: null });
  const [editing, setEditing] = useState(false);

  // 取得所有分類（包含 display: false）
  const fetchCategories = async () => {
    const res = await fetch(API_URL + '?all=1'); // 用 query 參數讓後端回傳全部
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 處理表單輸入
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // 新增或更新分類
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await fetch(`${API_URL}/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }
    setForm({ name: '', slug: '', display: true, _id: null });
    setEditing(false);
    fetchCategories();
  };

  // 編輯分類
  const handleEdit = (cat) => {
    setForm({ ...cat, _id: cat._id });
    setEditing(true);
  };

  // 刪除分類
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  // 切換 display toggle
  const handleToggleDisplay = async (cat) => {
    await fetch(`${API_URL}/${cat._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cat, display: !cat.display })
    });
    fetchCategories();
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Categories</h1>
      {/* Category Form */}
      <form onSubmit={handleSubmit} className="mb-4 row g-2 align-items-end">
        <div className="col-md-3">
          <label className="form-label">分類名稱 *</label>
          <input 
            type="text" 
            className="form-control" 
            name="name" 
            placeholder="Category Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">Slug *</label>
          <input 
            type="text" 
            className="form-control" 
            name="slug" 
            placeholder="category-slug" 
            value={form.slug} 
            onChange={handleChange} 
            required 
          />
          <small className="text-muted">用於 URL，例如：music, technology, food</small>
        </div>
        <div className="col-md-2">
          <label className="form-label">顯示</label>
          <div className="form-check">
            <input 
              type="checkbox" 
              className="form-check-input" 
              name="display" 
              checked={form.display} 
              onChange={handleChange} 
            />
            <label className="form-check-label">啟用</label>
          </div>
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">{editing ? 'Update' : 'Add'}</button>
        </div>
      </form>
      {/* Category Table */}
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Category List</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>URL</th>
                  <th>Display</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat._id}>
                    <td>{idx + 1}</td>
                    <td>{cat.name}</td>
                    <td>
                      <code>{cat.slug}</code>
                    </td>
                    <td>
                      <small className="text-info">/events/{cat.slug}</small>
                    </td>
                    <td>
                      <input type="checkbox" checked={cat.display} onChange={() => handleToggleDisplay(cat)} />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cat)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
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

export default Categories; 
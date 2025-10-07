import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/categories';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', display: true, _id: null });
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);

  // 檢查用戶權限
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // 取得所有分類（包含 display: false）
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL + '?all=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories:', res.statusText);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
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
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (editing) {
        const res = await fetch(`${API_URL}/${form._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          console.error('Failed to update category:', res.statusText);
          return;
        }
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(form)
        });
        if (!res.ok) {
          console.error('Failed to create category:', res.statusText);
          return;
        }
      }
      setForm({ name: '', slug: '', display: true, _id: null });
      setEditing(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // 編輯分類
  const handleEdit = (cat) => {
    setForm({ ...cat, _id: cat._id });
    setEditing(true);
  };

  // 刪除分類
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        fetchCategories();
      } else {
        console.error('Failed to delete category:', res.statusText);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // 切換 display toggle
  const handleToggleDisplay = async (cat) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...cat, display: !cat.display })
      });
      
      if (res.ok) {
        fetchCategories();
      } else {
        console.error('Failed to toggle category display:', res.statusText);
      }
    } catch (error) {
      console.error('Error toggling category display:', error);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Categories</h1>
      
      {/* 權限提示 */}
      {user && user.role !== 'admin' && (
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          您只能查看分類，無法修改。只有管理員可以管理分類。
        </div>
      )}
      
      {/* Category Form - 只有管理員可以看到 */}
      {user && user.role === 'admin' && (
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
      )}
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
                      {user && user.role === 'admin' ? (
                        <input type="checkbox" checked={cat.display} onChange={() => handleToggleDisplay(cat)} />
                      ) : (
                        <span className={`badge ${cat.display ? 'bg-success' : 'bg-secondary'}`}>
                          {cat.display ? '啟用' : '停用'}
                        </span>
                      )}
                    </td>
                    <td>
                      {user && user.role === 'admin' ? (
                        <>
                          <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cat)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat._id)}>Delete</button>
                        </>
                      ) : (
                        <span className="text-muted">只讀</span>
                      )}
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
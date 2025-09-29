import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/subscriptions';

function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEDMModal, setShowEDMModal] = useState(false);
  const [edmForm, setEdmForm] = useState({
    subject: '',
    content: '',
    htmlContent: '',
    targetStatus: 'active',
    tags: []
  });
  const [testEmail, setTestEmail] = useState('');
  const [sendingEDM, setSendingEDM] = useState(false);

  // 獲取訂閱者列表
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/admin/subscriptions?page=${page}&limit=20`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchTerm) url += `&search=${searchTerm}`;

      const response = await fetch(url);
      const data = await response.json();
      
      setSubscriptions(data.subscriptions || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      alert('載入訂閱者列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 獲取統計資料
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [page, statusFilter, searchTerm]);

  // 發送 EDM
  const handleSendEDM = async () => {
    if (!edmForm.subject || !edmForm.content) {
      alert('請填寫主題和內容');
      return;
    }

    if (!window.confirm('確定要發送 EDM 給所有訂閱者嗎？')) {
      return;
    }

    try {
      setSendingEDM(true);
      const response = await fetch(`${API_URL}/admin/send-edm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(edmForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setShowEDMModal(false);
        setEdmForm({ subject: '', content: '', htmlContent: '', targetStatus: 'active', tags: [] });
      } else {
        alert(data.error || '發送失敗');
      }
    } catch (error) {
      console.error('Error sending EDM:', error);
      alert('發送失敗，請稍後再試');
    } finally {
      setSendingEDM(false);
    }
  };

  // 測試發送 EDM
  const handleTestEDM = async () => {
    if (!edmForm.subject || !edmForm.content || !testEmail) {
      alert('請填寫主題、內容和測試郵箱');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/test-edm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...edmForm,
          testEmail
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error || '測試發送失敗');
      }
    } catch (error) {
      console.error('Error testing EDM:', error);
      alert('測試發送失敗，請稍後再試');
    }
  };

  // 更新訂閱者狀態
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchSubscriptions();
        fetchStats();
      } else {
        alert('更新失敗');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('更新失敗，請稍後再試');
    }
  };

  // 刪除訂閱者
  const handleDelete = async (id) => {
    if (!window.confirm('確定要刪除這個訂閱者嗎？')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/subscriptions/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSubscriptions();
        fetchStats();
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge bg-success',
      unsubscribed: 'badge bg-secondary',
      bounced: 'badge bg-danger'
    };
    return badges[status] || 'badge bg-light text-dark';
  };

  const getStatusText = (status) => {
    const texts = {
      active: '已訂閱',
      unsubscribed: '已取消',
      bounced: '退信'
    };
    return texts[status] || status;
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 text-gray-800">
            <i className="fas fa-envelope me-2"></i>
            訂閱管理
          </h1>
          <p className="text-muted">管理電子報訂閱者和發送 EDM</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowEDMModal(true)}
        >
          <i className="fas fa-paper-plane me-2"></i>
          發送 EDM
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-white-50 small">總訂閱者</div>
                  <div className="h4">{stats.total || 0}</div>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-white-50 small">活躍訂閱</div>
                  <div className="h4">{stats.active || 0}</div>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-white-50 small">已取消</div>
                  <div className="h4">{stats.unsubscribed || 0}</div>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-times-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="text-white-50 small">近30天新增</div>
                  <div className="h4">{stats.recent_30_days || 0}</div>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-chart-line fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">狀態篩選</label>
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">全部狀態</option>
                <option value="active">已訂閱</option>
                <option value="unsubscribed">已取消</option>
                <option value="bounced">退信</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">搜尋郵箱</label>
              <input
                type="text"
                className="form-control"
                placeholder="搜尋郵箱地址"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">&nbsp;</label>
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setStatusFilter('');
                  setSearchTerm('');
                }}
              >
                清除篩選
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 訂閱者列表 */}
      <div className="card shadow">
        <div className="card-header">
          <h6 className="m-0 font-weight-bold text-primary">訂閱者列表</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">載入中...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>郵箱</th>
                    <th>狀態</th>
                    <th>訂閱時間</th>
                    <th>最後發送</th>
                    <th>來源</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(subscription => (
                    <tr key={subscription._id}>
                      <td>
                        <div>
                          <div className="fw-bold">{subscription.email}</div>
                          {subscription.tags && subscription.tags.length > 0 && (
                            <div className="small text-muted">
                              {subscription.tags.map(tag => (
                                <span key={tag} className="badge bg-light text-dark me-1">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={getStatusBadge(subscription.status)}>
                          {getStatusText(subscription.status)}
                        </span>
                      </td>
                      <td>
                        {new Date(subscription.subscribed_at).toLocaleDateString()}
                      </td>
                      <td>
                        {subscription.last_email_sent 
                          ? new Date(subscription.last_email_sent).toLocaleDateString()
                          : '從未發送'
                        }
                      </td>
                      <td>
                        <span className="badge bg-info">{subscription.source}</span>
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {subscription.status === 'active' ? (
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => handleUpdateStatus(subscription._id, 'unsubscribed')}
                            >
                              取消訂閱
                            </button>
                          ) : (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleUpdateStatus(subscription._id, 'active')}
                            >
                              重新激活
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(subscription._id)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        <i className="fas fa-inbox fa-3x mb-3"></i>
                        <div>暫無訂閱者</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 分頁 */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    上一頁
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    下一頁
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* EDM 發送 Modal */}
      {showEDMModal && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEDMModal(false);
            }
          }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-paper-plane me-2"></i>
                  發送 EDM
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEDMModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">郵件主題 *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={edmForm.subject}
                      onChange={(e) => setEdmForm({...edmForm, subject: e.target.value})}
                      placeholder="輸入郵件主題"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">純文字內容 *</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={edmForm.content}
                      onChange={(e) => setEdmForm({...edmForm, content: e.target.value})}
                      placeholder="輸入郵件內容（純文字）"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label">HTML 內容</label>
                    <textarea
                      className="form-control"
                      rows="6"
                      value={edmForm.htmlContent}
                      onChange={(e) => setEdmForm({...edmForm, htmlContent: e.target.value})}
                      placeholder="輸入 HTML 內容（可選）"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">目標狀態</label>
                    <select
                      className="form-select"
                      value={edmForm.targetStatus}
                      onChange={(e) => setEdmForm({...edmForm, targetStatus: e.target.value})}
                    >
                      <option value="active">已訂閱</option>
                      <option value="unsubscribed">已取消</option>
                      <option value="bounced">退信</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">測試郵箱</label>
                    <input
                      type="email"
                      className="form-control"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="輸入測試郵箱"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEDMModal(false)}
                >
                  取消
                </button>
                <button 
                  type="button" 
                  className="btn btn-info" 
                  onClick={handleTestEDM}
                  disabled={sendingEDM}
                >
                  測試發送
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSendEDM}
                  disabled={sendingEDM}
                >
                  {sendingEDM ? '發送中...' : '發送 EDM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionManagement;

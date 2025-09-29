import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL + '/api/subscriptions';

function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('請輸入您的郵箱地址');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || '訂閱成功！感謝您的關注');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.error || '訂閱失敗，請稍後再試');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage('網路錯誤，請稍後再試');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-subscription">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-primary mb-3">
                    <i className="fas fa-envelope me-2"></i>
                    訂閱最新資訊
                  </h3>
                  <p className="text-muted">
                    訂閱我們的電子報，獲取最新活動資訊、優惠消息和精彩內容！
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-8">
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="請輸入您的郵箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          訂閱中...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          立即訂閱
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {message && (
                  <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mt-3`}>
                    <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                    {message}
                  </div>
                )}

                <div className="row mt-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-muted">
                      <i className="fas fa-shield-alt me-2"></i>
                      <small>我們承諾保護您的隱私，不會分享您的郵箱</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center text-muted">
                      <i className="fas fa-times-circle me-2"></i>
                      <small>隨時可以取消訂閱</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsletterSubscription;

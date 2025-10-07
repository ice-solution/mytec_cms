import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL + '/api/auth';

function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 檢查用戶, 2: 重置密碼
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 檢查用戶是否存在
  const checkUser = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('請輸入電子郵件地址');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        setStep(2);
        setSuccess('用戶驗證成功，請設置新密碼');
      } else {
        setError('用戶不存在，請檢查電子郵件地址');
      }
    } catch (error) {
      console.error('Check user error:', error);
      setError('檢查用戶時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 重置密碼
  const resetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('密碼確認不匹配');
      return;
    }

    if (newPassword.length < 6) {
      setError('密碼長度至少需要 6 個字符');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('密碼重置成功！請使用新密碼登入');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.error || '重置密碼失敗');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('重置密碼時發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 返回上一步
  const goBack = () => {
    setStep(1);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="sidebar-brand-icon rotate-n-15 mx-auto mb-3">
                  <i className="fas fa-key fa-3x text-primary"></i>
                </div>
                <h2 className="fw-bold text-primary">
                  {step === 1 ? '重置密碼' : '設置新密碼'}
                </h2>
                <p className="text-muted">
                  {step === 1 
                    ? '請輸入您的電子郵件地址' 
                    : '請為您的帳戶設置新密碼'
                  }
                </p>
              </div>

              {step === 1 ? (
                // 步驟 1: 檢查用戶
                <form onSubmit={checkUser}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">電子郵件地址</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="請輸入您的電子郵件"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        檢查中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        檢查用戶
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // 步驟 2: 重置密碼
                <form onSubmit={resetPassword}>
                  <div className="mb-3">
                    <label className="form-label">電子郵件</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">新密碼</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="請輸入新密碼"
                        required
                        disabled={loading}
                        minLength="6"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">確認新密碼</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="請再次輸入新密碼"
                        required
                        disabled={loading}
                        minLength="6"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-danger">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      {success}
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          重置中...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          重置密碼
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={goBack}
                      disabled={loading}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      返回上一步
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="fas fa-shield-alt me-1"></i>
                  密碼重置功能僅限於已註冊的用戶
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;


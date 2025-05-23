import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import googleLoginImg from '../assets/google_login.png';
import {useAlert} from '../AlertContext'
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {show} = useAlert();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://test-sso.online/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('accessToken', data.accessToken);

        // 토큰 헤더로 completed 여부 확인
        const completedRes = await fetch('https://test-sso.online/users/basic-info/completed', {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });
        const completedData = await completedRes.json();
        if (completedData.completed) {
          navigate('/main');
        } else {
          navigate('/initial');
        }
      } else {
        const data = await res.json();
        show(data.message || '로그인에 실패했습니다.');
      }
    } catch {
      show('서버 오류로 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://test-sso.online/auth/google';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
      }}
    >
      <img src={logoImg} alt="토닥이 로고" style={{ width: 140, marginBottom: 40 }} />
      <form
        onSubmit={handleLogin}
        style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '48px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          minWidth: 320,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 24, color: '#333' }}>로그인</h2>
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '14px 0',
            background: '#fff',
            color: '#444',
            border: '2px solid #ddd',
            borderRadius: 16,
            fontSize: '1.08rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#f5f5f5';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
          }}
        >
          <img src={googleLoginImg} alt="Google" style={{ width: 24 }} />
          Google 계정으로 로그인
        </button>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', border: '1.5px solid #eee', borderRadius: 8, fontSize: '1rem', width: '100%' }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', border: '1.5px solid #eee', borderRadius: 8, fontSize: '1rem', width: '100%' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px 0',
            background: '#FFD772',
            color: '#222',
            border: 'none',
            borderRadius: 16,
            fontWeight: 700,
            fontSize: '1.18rem',
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#FFC940')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#FFD772')}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <span
          style={{
            color: '#3a7bd5',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
            marginTop: 8,
          }}
          onClick={() => navigate('/')}
        >
          메인으로 돌아가기
        </span>
      </form>
    </div>
  );
};

export default LoginPage;

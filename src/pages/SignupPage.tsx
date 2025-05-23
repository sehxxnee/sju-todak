import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import {useAlert} from '../AlertContext'
const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {show} = useAlert();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://test-sso.online/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
      });
      if (res.ok) {
        show('회원가입이 완료되었습니다.');
        navigate('/');
      } else {
        const data = await res.json();
        show(data.message || '회원가입에 실패했습니다.');
      }
    } catch {
      show('서버 오류로 회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
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
        onSubmit={handleSignup}
        style={{
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          padding: '48px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          minWidth: 320,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 24, color: '#333' }}>회원가입</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', border: '1.5px solid #eee', borderRadius: 8, fontSize: '1rem', width: '100%' }}
        />
        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {loading ? '가입 중...' : '회원가입'}
        </button>
        <span
          style={{
            color: '#3a7bd5',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '1rem',
          }}
          onClick={() => navigate('/')}
        >
          메인으로 돌아가기
        </span>
      </form>
    </div>
  );
};

export default SignupPage;

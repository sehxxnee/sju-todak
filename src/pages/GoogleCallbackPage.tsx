import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

const GoogleCallbackPage: React.FC = () => {
  useEffect(() => {
    // 예: #/auth/google/callback?accessToken=xxx
    const hash = window.location.hash; // "#/auth/google/callback?accessToken=xxx"
    const queryString = hash.split('?')[1] || '';
    const params = new URLSearchParams(queryString);
    const accessToken = params.get('accessToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    // 완전히 해시를 덮어써서 /initial로 이동
    window.location.replace(window.location.origin + window.location.pathname + '#/initial');
  }, []);

  return <div>로그인 처리 중...</div>;
};

export default GoogleCallbackPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../InitialPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

const TestCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visibleMessages, setVisibleMessages] = useState(1);
  const result = location.state?.result;

  const chatMessages = [
    
    {
      sender: '토닥이',
      text: `설문하느라 수고했어! \n 설문 결과, ${result?.totalScore}점이야.\n ${result?.interpretation}로 보여.`,
    },
    {
      sender: '토닥이',
      text: '이제 너에 대해 잘 알았어. \n앞으로 친하게 지내자.',
    }, 
  ];

  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(visibleMessages + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <div
      className="initial-root"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="initial-container"
        style={{
          gap: '32px',
          maxWidth: 1200,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {/* 왼쪽: 채팅 메시지 영역 */}
        <div
          className="chat-section"
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '50%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            height: '100%',
          }}
        >
          {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
            <div className={'chat-message' + (idx === visibleMessages - 1 ? ' chat-message-appear' : '')} key={idx}>
              <img src={todakiImg} alt="토닥이" className="todaki-chat-img" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className="sender"
                  style={{ fontWeight: 400, fontSize: '0.93rem', marginBottom: 2, marginLeft: 2 }}
                >
                  {msg.sender}
                </span>
                <div className={'message-content'} style={{ textAlign: 'left' }}>
                  <div className="text">
                    {msg.text.split('\n').map((line: string, i: number) => (
                      <span key={i}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))} 
        </div>
        {/* 오른쪽: 로고, 캐릭터, 버튼 */}
        <div
          className="test-complete-fadein"
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <img src={logoImg} alt="토닥이 로고" style={{ width: 160, marginBottom: 16 }} />
          <img src={todakiImg} alt="토닥이 캐릭터" style={{ width: 180, marginBottom: 24 }} />
          <button
            style={{
              background: '#FFD772',
              color: '#222',
              fontWeight: 500,
              fontSize: '1.13rem',
              border: 'none',
              borderRadius: 22,
              padding: '15px 48px',
              marginTop: 28,
              cursor: 'pointer',
              letterSpacing: '-0.5px',
              boxShadow: '0 4px 16px rgba(255,215,114,0.13)',
              transition: 'box-shadow 0.18s, transform 0.18s, background 0.18s',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
              minWidth: 180,
              fontFamily: 'inherit',
              borderBottom: '3px solid #e6c75c',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#ffe28a';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(255,215,114,0.18)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px) scale(1.04)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FFD772';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(255,215,114,0.13)';
              (e.currentTarget as HTMLButtonElement).style.transform = '';
            }}
            onClick={() => navigate('/main')}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestCompletePage;

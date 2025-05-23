import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../LandingPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';
import chatUiImg from '../assets/landing_chat.png';
import { FcGoogle } from 'react-icons/fc';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = 'https://test-sso.online/auth/google';
  };

  // featureCards 배열 선언
  const featureCards = [
    {
      icon: '📌',
      title: '심리이론 기반 전문 상담',
      desc: '인지행동치료, 정신역동치료, 내담자중심치료, 수용전념치료, 해결중심상담의 심리상담 이론을 전문 상담을 진행합니다.',
    },
    {
      icon: '💬',
      title: '페르소나 맞춤 대화',
      desc: '다양한 상담 페르소나를 선택할 수 있으며, 각 페르소나는 말투, 표현, 반응 방식이 다르게 설계되어 있습니다.',
    },
    {
      icon: '📚',
      title: '라이프코칭 실천 미션',
      desc: '상담 결과에 따라 사용자 맞춤 실천 미션을 추천해, 말로 끝나지 않는 행동 변화를 이끕니다.',
    },
    {
      icon: '📅',
      title: '캘린더 연동 멘탈 관리',
      desc: '캘린더와 연동해 상담 주기 관리, 일정 맞춤 알림, 챗봇이 먼저 말 거는 관심 표현까지 함께합니다.',
    },
    {
      icon: '📝',
      title: '상담 분석 리포트 제공',
      desc: '대화 내용을 바탕으로 감정 흐름, 상담 주제 분포, 왜곡이 일어난 표현 등 상담 이력 요약 리포트를 제공하여 자기이해를 돕습니다.',
    },
    {
      icon: '🎙️',
      title: '감정 기반 음성 응답 시스템',
      desc: '사용자의 감정과 맥락을 인식해, 페르소나별 음성으로 몰입감 있는 상담을 제공합니다.',
    },
    {
      icon: '🔍',
      title: '간이 및 전문 심리검사 제공',
      desc: '고민과 나이에 맞는 간이 검사부터 50문항 이상의 전문 검사까지, 사용자의 상태를 정밀하게 파악합니다.',
    },
  ];

  return (
    <div>
      {/* 상단 Hero 영역 (기존 레이아웃/스타일 그대로) */}
    <div className="landing-container">
      <div className="landing-left">
        <img src={logoImg} alt="토닥이 로고" className="logo-img" />
        <img src={todakiImg} alt="토닥이 캐릭터" className="todaki-img" />
          <div className="landing-title">
            라이프 코칭을 통한
            <br />
            멘탈 케어 시스템
          </div>
          <button
            onClick={handleGoogleLogin}
            style={{
              width: 240,
              height: 44,
              borderRadius: 22,
              fontSize: '0.98rem',
              fontWeight: 400,
              background: '#fff',
              color: '#b48a00',
              border: '1.5px solid #F5E0A3',
              boxShadow: '0 2px 8px rgba(245,224,163,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginBottom: 10,
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#fff7d1';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            <FcGoogle style={{ marginRight: 10, verticalAlign: 'middle', fontSize: 20 }} />
            Google 계정으로 로그인
          </button>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              width: 240,
              height: 44,
              borderRadius: 22,
              fontSize: '0.98rem',
              fontWeight: 400,
              background: 'linear-gradient(90deg, #F5E0A3 60%, #fff7d1 100%)',
              color: '#7a6a2f',
              border: 'none',
              boxShadow: '0 2px 8px rgba(245,224,163,0.13)',
              marginTop: 10,
              marginBottom: 10,
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #F0D48C 60%, #fff7d1 100%)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #F5E0A3 60%, #fff7d1 100%)';
            }}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            style={{
              width: 240,
              height: 44,
              borderRadius: 22,
              fontSize: '0.98rem',
              fontWeight: 400,
              background: '#fff',
              color: '#b48a00',
              border: '1.5px solid #F5E0A3',
              boxShadow: '0 2px 8px rgba(245,224,163,0.10)',
              marginBottom: 10,
              cursor: 'pointer',
              transition: 'background 0.18s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#fff7d1';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#fff';
            }}
          >
            회원가입
          </button>
        </div>
        <div className="landing-right">
          <img src={chatUiImg} alt="채팅 UI" className="chat-ui-img" />
        </div>
      </div>

      {/* 아래로 스크롤되는 소개 섹션 */}
      <div className="landing-scroll-sections">
        {/* 토닥이, 이런 점이 달라요 카드형 섹션 */}
        <section className="landing-section landing-feature-section2">
          <h2>토닥이, 이런 점이 달라요</h2>
          <div className="feature-card-rows">
            <div className="feature-card-row">
              {featureCards.slice(0, 4).map((card, idx) => (
                <div className="feature-card" key={idx}>
                  <div className="feature-icon">{card.icon}</div>
                  <div className="feature-title">{card.title}</div>
                  <div className="feature-desc">{card.desc}</div>
                </div>
              ))}
            </div>
            <div className="feature-card-row feature-card-row-offset">
              {featureCards.slice(4).map((card, idx) => (
                <div className="feature-card" key={idx + 4}>
                  <div className="feature-icon">{card.icon}</div>
                  <div className="feature-title">{card.title}</div>
                  <div className="feature-desc">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* 1. 심리이론 기반 전문 상담 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>심리이론 기반 전문 상담</h2>
              <p>
                인지행동치료, 정신역동치료, 내담자중심치료 등 다양한 심리상담 이론을 바탕으로
                <br />
                전문적이고 체계적인 상담을 제공합니다.
              </p>
            </div>
            <img src={chatUiImg} alt="전문 상담 UI" className="feature-img" />
          </div>
        </section>
        {/* 2. 페르소나 맞춤 대화 */}
        <section className="feature-section">
          <div className="feature-content reverse">
            <div className="feature-text">
              <h2>페르소나 맞춤 대화</h2>
              <p>
                다양한 상담 페르소나를 선택해
                <br />
                나에게 맞는 말투, 반응, 공감 방식을 경험할 수 있습니다.
              </p>
            </div>
            <img src={chatUiImg} alt="페르소나 대화 UI" className="feature-img" />
          </div>
        </section>
        {/* 3. 라이프코칭 실천 미션 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>라이프코칭 실천 미션</h2>
              <p>
                상담 결과에 따라 맞춤형 실천 미션을 추천해
                <br />
                말로 끝나지 않는 행동 변화를 이끌어냅니다.
              </p>
            </div>
            <img src={chatUiImg} alt="실천 미션 UI" className="feature-img" />
          </div>
        </section>
        {/* 4. 캘린더 연동 멘탈 관리 */}
        <section className="feature-section">
          <div className="feature-content reverse">
            <div className="feature-text">
              <h2>캘린더 연동 멘탈 관리</h2>
              <p>
                상담 일정, 미션 알림, 주기적 체크인까지
                <br />
                캘린더와 연동해 꾸준한 멘탈 관리를 도와줍니다.
              </p>
            </div>
            <img src={chatUiImg} alt="캘린더 연동 UI" className="feature-img" />
          </div>
        </section>
        {/* 5. 상담 분석 리포트 제공 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>상담 분석 리포트 제공</h2>
              <p>
                대화 내용을 바탕으로 감정 흐름, 상담 주제, 자기이해를 돕는
                <br />
                맞춤형 리포트를 제공합니다.
              </p>
            </div>
            <img src={chatUiImg} alt="리포트 UI" className="feature-img" />
          </div>
        </section>
        {/* 6. 감정 기반 음성 응답 시스템 */}
        <section className="feature-section">
          <div className="feature-content reverse">
            <div className="feature-text">
              <h2>감정 기반 음성 응답 시스템</h2>
              <p>
                사용자의 감정과 맥락을 인식해
                <br />
                페르소나별 음성으로 몰입감 있는 상담을 제공합니다.
              </p>
            </div>
            <img src={chatUiImg} alt="음성 응답 UI" className="feature-img" />
          </div>
        </section>
        {/* 7. 간이 및 전문 심리검사 제공 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>간이 및 전문 심리검사 제공</h2>
              <p>
                고민과 나이에 맞는 간이 검사부터
                <br />
                50문항 이상의 전문 검사까지 정밀하게 제공합니다.
              </p>
            </div>
            <img src={chatUiImg} alt="심리검사 UI" className="feature-img" />
          </div>
        </section>
        {/* 마지막: 어떻게 시작하나요? */}
        <section className="landing-section landing-howto-section">
          <h2>어떻게 시작하나요?</h2>
          <div className="howto-steps">
            <div className="howto-step">
              <div className="howto-num">1</div>
              <div>Google 계정으로 로그인</div>
            </div>
            <div className="howto-step">
              <div className="howto-num">2</div>
              <div>AI 챗봇과 대화하며 고민 나누기</div>
            </div>
            <div className="howto-step">
              <div className="howto-num">3</div>
              <div>자가진단 검사 & 맞춤 리포트 확인</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage; 

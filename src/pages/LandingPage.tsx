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
          <button onClick={handleGoogleLogin} className="landing-btn landing-btn-google">
            <FcGoogle style={{ marginRight: 12, verticalAlign: 'middle' }} />
            Google 계정으로 로그인
          </button>
          <button type="button" onClick={() => navigate('/login')} className="landing-btn landing-btn-login">
            로그인
          </button>
          <button type="button" onClick={() => navigate('/signup')} className="landing-btn landing-btn-signup">
            회원가입
          </button>
          {/* <span
            style={{
              color: '#3a7bd5',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '1rem',
              display: 'block',
              marginTop: 16,
            }}
            onClick={() => navigate('/signup')}
          >
            회원가입
          </span> */}
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
          <div className="feature-card-list">
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <div className="feature-title">24시간 AI 챗봇 상담</div>
              <div className="feature-desc">언제든 고민을 나눌 수 있어요</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <div className="feature-title">심리·진로·학습 자가진단</div>
              <div className="feature-desc">신뢰도 높은 척도로 내 상태를 체크</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-title">맞춤형 리포트 제공</div>
              <div className="feature-desc">나만의 성장 리포트와 동기부여</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <div className="feature-title">캘린더 연동 일정 알림</div>
              <div className="feature-desc">
                중요한 일정 전에 토닥이가 알림을 보내
                <br />
                마음을 안정시킬 수 있어요
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <div className="feature-title">맞춤형 미션 제공</div>
              <div className="feature-desc">
                맞춤형 미션을 통해
                <br />
                행동 개선을 이끌어냅니다
              </div>
            </div>
          </div>
        </section>
        {/* 교차형 섹션 1: 24시간 AI 챗봇 상담 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>24시간 AI 챗봇 상담</h2>
              <p>
                언제든 고민을 나눌 수 있어요.
                <br />
                AI 챗봇이 따뜻하게 대화하며 마음을 돌봐줍니다.
              </p>
            </div>
            <img src={chatUiImg} alt="채팅 UI" className="feature-img" />
          </div>
        </section>
        {/* 교차형 섹션 2: 심리·진로·학습 자가진단 */}
        <section className="feature-section">
          <div className="feature-content reverse">
            <div className="feature-text">
              <h2>심리·진로·학습 자가진단</h2>
              <p>
                신뢰도 높은 척도로 내 상태를 체크할 수 있습니다.
                <br />
                간단한 설문으로 나를 객관적으로 이해해보세요.
              </p>
            </div>
            <img src={chatUiImg} alt="자가진단 UI" className="feature-img" />
          </div>
        </section>
        {/* 교차형 섹션 3: 맞춤형 리포트 제공 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>맞춤형 리포트 제공</h2>
              <p>
                나만의 성장 리포트와 동기부여 메시지를 받아보세요.
                <br />
                꾸준한 변화와 성장을 응원합니다.
              </p>
            </div>
            <img src={chatUiImg} alt="리포트 UI" className="feature-img" />
          </div>
        </section>
        {/* 교차형 섹션 4: 캘린더 연동 일정 알림 */}
        <section className="feature-section">
          <div className="feature-content reverse">
            <div className="feature-text">
              <h2>캘린더 연동 일정 알림</h2>
              <p>
                중요한 일정 전에 토닥이가 알림을 보내
                <br />
                마음을 안정시킬 수 있어요.
              </p>
            </div>
            <img src={chatUiImg} alt="캘린더 알림 UI" className="feature-img" />
          </div>
        </section>
        {/* 교차형 섹션 5: 맞춤형 미션 제공 */}
        <section className="feature-section">
          <div className="feature-content">
            <div className="feature-text">
              <h2>맞춤형 미션 제공</h2>
              <p>
                맞춤형 미션을 통해
                <br />
                행동 개선을 이끌어냅니다.
              </p>
            </div>
            <img src={chatUiImg} alt="미션 UI" className="feature-img" />
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

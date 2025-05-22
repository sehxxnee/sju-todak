import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GoalsPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

interface Goal {
  id: number;
  title: string;
  category: string;
  progress: number;
  isCompleted: boolean;
}

const missionPool = [
  { title: '매일 30분 운동하기', category: '건강' },
  { title: '일주일에 책 1권 읽기', category: '학습' },
  { title: '하루 8잔 물 마시기', category: '건강' },
  { title: '감정 일기 쓰기', category: '마음' },
  { title: '긍정 경험 1개 기록', category: '마음' },
  { title: '친구에게 안부 문자 보내기', category: '관계' },
  { title: '명상 10분 하기', category: '마음' },
  { title: '하루 1번 산책하기', category: '건강' },
];

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeTab, setActiveTab] = useState<'progress' | 'done'>('progress');
  const [showCertModal, setShowCertModal] = useState<{ open: boolean; goalId: number | null }>({
    open: false,
    goalId: null,
  });

  // 1. 미션 목록 불러오기
  const fetchGoals = async () => {
    try {
      const res = await fetch('/missions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch {
      // 에러 처리 필요시 추가
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // 2. 인증(진척도 증가)
  const handleCertConfirm = async () => {
    if (showCertModal.goalId !== null) {
      await fetch(`/missions/${showCertModal.goalId}/progress`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      fetchGoals();
    }
    setShowCertModal({ open: false, goalId: null });
  };

  // 미션 인증(+ 버튼)
  const handleCertClick = (goalId: number) => {
    setShowCertModal({ open: true, goalId });
  };

  // 미션 재발급
  const handleReissue = (goalId: number) => {
    setGoals((prev) => {
      const goalToReissue = prev.find((g) => g.id === goalId);
      if (!goalToReissue) return prev;

      // 랜덤 미션 부여(중복X)
      const usedTitles = prev.filter((g) => g.id !== goalId).map((g) => g.title);
      const candidates = missionPool.filter((m) => !usedTitles.includes(m.title));
      const newMission =
        candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : { title: '새로운 미션', category: '기타' };

      return prev.map((g) =>
        g.id === goalId
          ? { id: Date.now(), title: newMission.title, category: newMission.category, progress: 0, isCompleted: false }
          : g,
      );
    });
  };

  // 새 미션 발급
  const handleNewMission = () => {
    const usedTitles = goals.map((g) => g.title);
    const candidates = missionPool.filter((m) => !usedTitles.includes(m.title));
    const newMission =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : { title: '새로운 미션', category: '기타' };

    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: newMission.title,
        category: newMission.category,
        progress: 0,
        isCompleted: false,
      },
    ]);
  };

  // 탭 필터링
  const progressGoals = goals.filter((g) => !g.isCompleted);
  const doneGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="goalspage-root">
      <nav className="main-nav">
        <img
          src={logoImg}
          alt="토닥이 로고"
          className="main-logo"
          onClick={() => navigate('/main')}
          style={{ cursor: 'pointer' }}
        />
        <div className="main-menu">
          <span onClick={() => navigate('/main')} style={{ cursor: 'pointer' }}>
            채팅
          </span>
          <span onClick={() => navigate('/goals')} style={{ cursor: 'pointer' }}>
            미션
          </span>
          <span onClick={() => navigate('/analysis')} style={{ cursor: 'pointer' }}>
            분석
          </span>
          <span onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>
            캘린더
          </span>
          <span onClick={() => navigate('/test')} style={{ cursor: 'pointer' }}>
            심리검사
          </span>
        </div>
        <span className="profile-menu" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          프로필
        </span>
      </nav>

      <div className="goalspage-content">
        <div className="goals-section">
          <div className="goals-header">
            <h2>나의 미션</h2>
          </div>
          <div className="goals-tabs">
            <button
              className={`tab-btn${activeTab === 'progress' ? ' active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              진행 중
            </button>
            <button className={`tab-btn${activeTab === 'done' ? ' active' : ''}`} onClick={() => setActiveTab('done')}>
              완료
            </button>
          </div>
          <div className="goals-list">
            {(activeTab === 'progress' ? progressGoals : doneGoals).length > 0 ? (
              (activeTab === 'progress' ? progressGoals : doneGoals).map((goal) => (
                <div key={goal.id} className="goal-item">
                  <div
                    className="goal-info"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <h3>{goal.title}</h3>
                    </div>
                    {activeTab === 'progress' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleCertClick(goal.id)}
                          style={{
                            background: '#f7eac2',
                            border: 'none',
                            borderRadius: 12,
                            padding: '6px 12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: '#7a6a2f',
                          }}
                        >
                          + 인증
                        </button>
                        <button
                          onClick={() => handleReissue(goal.id)}
                          style={{
                            background: '#fff',
                            border: '1.5px solid #f7eac2',
                            borderRadius: 12,
                            padding: '6px 12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            color: '#7a6a2f',
                          }}
                        >
                          재발급
                        </button>
                      </div>
                    )}
                  </div>
                  <div
                    className="progress-bar"
                    style={{ background: '#f0f3f7', height: 8, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}
                  >
                    <div
                      className="progress"
                      style={{
                        width: `${goal.progress}%`,
                        height: '100%',
                        background: '#f7eac2',
                        borderRadius: 8,
                        transition: 'width 0.4s',
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{goal.progress}%</span>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <button
                  onClick={handleNewMission}
                  style={{
                    background: '#f7eac2',
                    border: 'none',
                    borderRadius: 12,
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    color: '#7a6a2f',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    fontWeight: 500,
                  }}
                >
                  미션 발급받기
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          className="todaki-section"
          style={{
            minHeight: 420,
            maxHeight: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
          <img src={todakiImg} alt="토닥이" className="todaki-img" />
          {/* 레벨/경험치 UI는 추후 필요시 추가 */}
        </div>
      </div>
      {/* 인증 모달 */}
      {showCertModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>미션 인증</h3>
            <div style={{ marginBottom: 18 }}>미션을 완료하셨나요?</div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowCertModal({ open: false, goalId: null })}>
                취소
              </button>
              <button className="confirm-btn" onClick={handleCertConfirm}>
                인증
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../GoalsPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

interface Mission {
  id: number;
  title: string;
  missionExp: number;
  progress: number;
  frequency?: string;
  isCompleted: boolean;
}

const GoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<{ progressing: Mission[]; completed: Mission[] }>({
    progressing: [],
    completed: [],
  });
  const [activeTab, setActiveTab] = useState<'progress' | 'done'>('progress');
  const [showCertModal, setShowCertModal] = useState<{ open: boolean; missionId: number | null }>({
    open: false,
    missionId: null,
  });
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://test-sso.online';

  // 미션/경험치 불러오기
  const fetchData = async () => {
    setLoading(true);
    try {
      const [missionsRes, expRes] = await Promise.all([
        fetch(`${API_URL}/missions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).then((r) => r.json()),
        fetch(`${API_URL}/users/exp`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        }).then((r) => r.json()),
      ]);
      setMissions(missionsRes);
      setLevel(expRes.level);
      setExp(expRes.exp);
    } catch {
      // 에러 처리 필요시 추가
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 미션 인증(완료)
  const handleCertConfirm = async () => {
    if (showCertModal.missionId !== null) {
      // 1. 진행도 1 증가 (목표치 도달 시 경험치/레벨도 자동 지급됨)
      await fetch(`${API_URL}/missions/${showCertModal.missionId}/progress`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      // 2. 미션/경험치 UI 갱신
      await fetchData();
    }
    setShowCertModal({ open: false, missionId: null });
  };

  // 미션 인증(+ 버튼)
  const handleCertClick = (missionId: number) => {
    setShowCertModal({ open: true, missionId });
  };

  // 탭 필터링
  const progressMissions = missions.progressing;
  const doneMissions = missions.completed;

  return (
    <div className="goalspage-root">
      <nav className="main-nav">
        <img src={logoImg} alt="토닥이 로고" className="main-logo" onClick={() => navigate('/main')} style={{cursor:'pointer'}} />
        <div className="main-menu">
          <span onClick={() => navigate('/main')} style={{cursor:'pointer'}}>채팅</span>
          <span onClick={() => navigate('/goals')} style={{cursor:'pointer'}}>미션</span>
          <span onClick={() => navigate('/analysis')} style={{cursor:'pointer'}}>분석</span>
          <span onClick={() => navigate('/calendar')} style={{cursor:'pointer'}}>캘린더</span>
          <span onClick={() => navigate('/professional-survey')} style={{cursor:'pointer'}}>심리검사</span>
        </div>
        <span className="profile-menu" style={{cursor:'pointer', marginLeft: 'auto', paddingRight: '20px', marginRight: 30}} onClick={() => navigate('/profile')}>프로필</span>
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
            {loading ? (
              <div style={{ color: '#bbb', marginTop: 40 }}>로딩 중...</div>
            ) : (activeTab === 'progress' ? progressMissions : doneMissions).length > 0 ? (
              (activeTab === 'progress' ? progressMissions : doneMissions).map((mission) => {
                // 진행률 계산
                const target = mission.frequency ? parseInt(mission.frequency.match(/\d+/)?.[0] || '1', 10) : 1;
                const percent = Math.round(((mission.progress ?? 0) / target) * 100);
                return (
                  <div key={mission.id} className="goal-item">
                    <div
                      className="goal-info"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <h3 style={{ margin: 0 }}>{mission.title}</h3>
                        <div style={{ color: '#bfae6a', fontWeight: 500, fontSize: 15, marginLeft: 4 }}>
                          +{mission.missionExp} exp
                        </div>
                      </div>
                      {activeTab === 'progress' && (
                        <button
                          onClick={() => handleCertClick(mission.id)}
                          style={{
                            background: '#fffbe9',
                            border: 'none',
                            borderRadius: 12,
                            padding: '8px 18px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            color: '#bfae6a',
                            marginLeft: 16,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          }}
                        >
                          + 인증
                        </button>
                      )}
                    </div>
                    {/* 진행률 바 (진행중 탭에서만) */}
                    {activeTab === 'progress' && (
                      <div
                        style={{
                          width: 'calc(100% - 120px)',
                          marginTop: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 12,
                            background: '#f5f5f7',
                            borderRadius: 8,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${percent}%`,
                              height: '100%',
                              background: '#FFD600',
                              borderRadius: 8,
                              transition: 'width 0.4s',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 15, color: '#aaa', minWidth: 38, textAlign: 'right' }}>{percent}%</div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ color: '#bbb', marginTop: 40 }}>미션이 없습니다.</div>
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
          {/* 레벨/경험치 UI */}
          <div style={{ fontSize: 32, fontWeight: 700, color: '#000000', marginBottom: 8, marginTop: 16 }}>
            Lv.{level}
          </div>
          <div
            style={{
              width: 180,
              height: 18,
              background: '#fffbe9',
              borderRadius: 9,
              marginBottom: 6,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(exp / 50) * 100}%`,
                height: '100%',
                background: '#FFD600',
                borderRadius: 9,
                transition: 'width 0.5s',
              }}
            />
          </div>
          <div style={{ fontSize: 15, color: '#888' }}>{exp} / 50 exp</div>
        </div>
      </div>
      {/* 인증 모달 */}
      {showCertModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>미션 인증</h3>
            <div style={{ marginBottom: 18 }}>미션을 완료하셨나요?</div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowCertModal({ open: false, missionId: null })}>
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

import React, { useState } from 'react';
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
  const [goals, setGoals] = useState<Goal[]>([
    { id: 1, title: '매일 30분 운동하기', category: '건강', progress: 60, isCompleted: false },
    { id: 2, title: '일주일에 책 1권 읽기', category: '학습', progress: 30, isCompleted: false },
    { id: 3, title: '하루 8잔 물 마시기', category: '건강', progress: 100, isCompleted: true },
  ]);
  const [activeTab, setActiveTab] = useState<'progress'|'done'>('progress');
  const [showCertModal, setShowCertModal] = useState<{open: boolean; goalId: number|null}>({open: false, goalId: null});
  const [exp, setExp] = useState(60); // 0~100
  const [level, setLevel] = useState(5);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 미션 인증(+ 버튼)
  const handleCertClick = (goalId: number) => {
    setShowCertModal({open: true, goalId});
  };
  const handleCertConfirm = () => {
    if (showCertModal.goalId !== null) {
      setGoals(prev => prev.map(g =>
        g.id === showCertModal.goalId
          ? {
              ...g,
              progress: Math.min(g.progress + 20, 100),
              isCompleted: g.progress + 20 >= 100 ? true : g.isCompleted
            }
          : g
      ));
      // exp 증가(완료 시만)
      const completedGoal = goals.find(g => g.id === showCertModal.goalId);
      if (completedGoal && completedGoal.progress + 20 >= 100 && !completedGoal.isCompleted) {
        const newExp = Math.min(exp + 20, 100);
        setExp(newExp);
        if (newExp >= 100) {
          setShowLevelUp(true);
          setTimeout(() => {
            setLevel(prev => prev + 1);
            setExp(0);
            setShowLevelUp(false);
          }, 2000);
        }
      }
    }
    setShowCertModal({open: false, goalId: null});
  };

  // 미션 재발급
  const handleReissue = (goalId: number) => {
    setGoals(prev => {
      const goalToReissue = prev.find(g => g.id === goalId);
      if (!goalToReissue) return prev;

      // 랜덤 미션 부여(중복X)
      const usedTitles = prev.filter(g => g.id !== goalId).map(g => g.title);
      const candidates = missionPool.filter(m => !usedTitles.includes(m.title));
      const newMission = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : { title: '새로운 미션', category: '기타' };

      return prev.map(g =>
        g.id === goalId
          ? { id: Date.now(), title: newMission.title, category: newMission.category, progress: 0, isCompleted: false }
          : g
      );
    });
  };

  // 새 미션 발급
  const handleNewMission = () => {
    const usedTitles = goals.map(g => g.title);
    const candidates = missionPool.filter(m => !usedTitles.includes(m.title));
    const newMission = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : { title: '새로운 미션', category: '기타' };

    setGoals(prev => [...prev, {
      id: Date.now(),
      title: newMission.title,
      category: newMission.category,
      progress: 0,
      isCompleted: false
    }]);
  };

  // 탭 필터링
  const progressGoals = goals.filter(g => !g.isCompleted);
  const doneGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="goalspage-root">
      <nav className="main-nav">
        <img src={logoImg} alt="토닥이 로고" className="main-logo" onClick={() => navigate('/main')} style={{cursor:'pointer'}} />
        <div className="main-menu">
          <span onClick={() => navigate('/main')} style={{cursor:'pointer'}}>채팅</span>
          <span onClick={() => navigate('/goals')} style={{cursor:'pointer'}}>미션</span>
          <span onClick={() => navigate('/analysis')} style={{cursor:'pointer'}}>분석</span>
          <span onClick={() => navigate('/calendar')} style={{cursor:'pointer'}}>캘린더</span>
          <span onClick={() => navigate('/test')} style={{cursor:'pointer'}}>심리검사</span>
        </div>
        <span className="profile-menu" style={{cursor:'pointer'}} onClick={() => navigate('/profile')}>프로필</span>
      </nav>

      <div className="goalspage-content">
        <div className="goals-section">
          <div className="goals-header">
            <h2>나의 미션</h2>
          </div>
          <div className="goals-tabs">
            <button className={`tab-btn${activeTab==='progress'?' active':''}`} onClick={()=>setActiveTab('progress')}>진행 중</button>
            <button className={`tab-btn${activeTab==='done'?' active':''}`} onClick={()=>setActiveTab('done')}>완료</button>
          </div>
          <div className="goals-list">
            {(activeTab==='progress'?progressGoals:doneGoals).length > 0 ? (
              (activeTab==='progress'?progressGoals:doneGoals).map(goal => (
                <div key={goal.id} className="goal-item">
                  <div className="goal-info" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <h3>{goal.title}</h3>
                    </div>
                    {activeTab==='progress' && (
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>handleCertClick(goal.id)} style={{background:'#f7eac2',border:'none',borderRadius:12,padding:'6px 12px',fontWeight:600,cursor:'pointer',color:'#7a6a2f'}}>+ 인증</button>
                        <button onClick={()=>handleReissue(goal.id)} style={{background:'#fff',border:'1.5px solid #f7eac2',borderRadius:12,padding:'6px 12px',fontWeight:500,cursor:'pointer',color:'#7a6a2f'}}>재발급</button>
                      </div>
                    )}
                  </div>
                  <div className="progress-bar" style={{background:'#f0f3f7',height:8,borderRadius:8,overflow:'hidden',marginBottom:6}}>
                    <div className="progress" style={{width: `${goal.progress}%`,height:'100%',background:'#f7eac2',borderRadius:8,transition:'width 0.4s'}}></div>
                  </div>
                  <span className="progress-text">{goal.progress}%</span>
                </div>
              ))
            ) : (
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'200px'}}>
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
                    fontWeight: 500
                  }}
                >
                  미션 발급받기
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="todaki-section" style={{minHeight:420,maxHeight:420,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start'}}>
          <img src={todakiImg} alt="토닥이" className="todaki-img" />
          <div className="todaki-level">Lv. {level}</div>
          <div className="exp-bar" style={{width:'90%',height:14,background:'#f0f3f7',borderRadius:8,marginTop:8,overflow:'hidden'}}>
            <div className="exp-progress" style={{width: `${exp}%`,height:'100%',background:'#f7eac2',borderRadius:8,transition:'width 0.4s'}}></div>
          </div>
          <div className="exp-text">다음 레벨까지 {100-exp}점</div>
          {showLevelUp && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              animation: 'fadeIn 0.5s'
            }}>
              <div style={{
                background: '#fff',
                padding: '24px 48px',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
                textAlign: 'center',
                animation: 'scaleIn 0.5s'
              }}>
                <h2 style={{color: '#FFD700', marginBottom: 12}}>레벨 업!</h2>
                <p style={{color: '#666'}}>Lv.{level} → Lv.{level + 1}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 인증 모달 */}
      {showCertModal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>미션 인증</h3>
            <div style={{marginBottom:18}}>미션을 완료하셨나요?</div>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={()=>setShowCertModal({open:false,goalId:null})}>취소</button>
              <button className="confirm-btn" onClick={handleCertConfirm}>인증</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsPage; 
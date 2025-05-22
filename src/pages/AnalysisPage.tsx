import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AnalysisPage.css';
import '../MainPage.css';
import logoImg from '../assets/logo.png';
import html2canvas from 'html2canvas';
import { authFetch } from '../utils/authFetch';
// import { FaRegSmile, FaRegFrown, FaRegAngry, FaRegMeh, FaRegGrinStars } from 'react-icons/fa';

// 감정 분석 바 (막대 전체 연회색, 감정값만 노란색)                                                                                                                                                                                                                                                         
const EmotionBar = ({ label, value }: { label: string, value: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
    <span style={{ width: 48, color: '#444', fontWeight: 500, fontSize: 16 }}>{label}</span>
    <div style={{ flex: 1, marginLeft: 12, background: '#F3F4F7', borderRadius: 8, height: 18, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
      <div style={{
        width: `${value}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #FFE9A0 60%, #FFF7D1 100%)',
        borderRadius: 8,
        transition: 'width 1.1s cubic-bezier(.4,2,.6,1)',
        position: 'absolute',
        left: 0, top: 0
      }} />
    </div>
  </div>
);

// 왼쪽 말풍선
const LeftBubble = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 8 }}>
    <div style={{
      background: '#FFF7D1',
      color: '#222',
      borderRadius: '16px 16px 16px 4px',
      padding: '12px 18px',
      fontSize: '1.04rem',
      fontWeight: 500,
      maxWidth: 420,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      textAlign: 'left',
      position: 'relative',
      marginLeft: 0
    }}>
      {children}
      <span style={{
        position: 'absolute',
        left: -10,
        top: 16,
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: '10px solid #FFF7D1',
        borderLeft: 'none',
        content: '""'
      }} />
    </div>
  </div>
);
// 오른쪽 말풍선
const RightBubble = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
    <div style={{
      background: '#FFF7D1',
      color: '#b48a00',
      borderRadius: '16px 16px 4px 16px',
      padding: '12px 18px',
      fontSize: '0.98rem',
      fontWeight: 500,
      maxWidth: 420,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      textAlign: 'left',
      position: 'relative',
      marginRight: 0
    }}>
      {children}
      <span style={{
        position: 'absolute',
        right: -10,
        top: 16,
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: '10px solid #FFF7D1',
        borderRight: 'none',
        content: '""'
      }} />
    </div>
  </div>
);

const sectionTitleStyle = {color:'#888', fontSize:'1.13rem', marginBottom:14, letterSpacing:'-0.5px', textAlign:'left' as const, marginLeft:36, fontWeight:400};
const cardStyleWide = {
  background: '#fff',
  borderRadius: 16,
  padding: '40px 48px 36px 48px',
  marginBottom: 0,
  maxWidth: '70%',
  margin: '0 auto',
  textAlign: 'left'
} as React.CSSProperties;
const dividerStyle = {width:'80%',height:1,background:'#e0e0e0',margin:'48px 0',marginLeft:80,marginRight:80};

type ChatRoom = { text: string; turn: number; chatId: number; isAnalyzable: boolean };

interface Distortion {
  name: string;
  example: string;
  explanation: string;
  advice: string;
}

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(0); // 기록 선택 인덱스
  const [recordList, setRecordList] = useState<ChatRoom[]>([]);
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 채팅방 목록 조회 API 연동
    const fetchChatRooms = async () => {
      try {
        const res = await authFetch('https://test-sso.online/chat', { method: 'GET' });
        if (res.ok) {
          const data: { chatId: number; title: string; isAnalyzable?: boolean }[] = await res.json();
          const mapped: ChatRoom[] = data.map((item) => ({
            text: item.title,
            turn: 0,
            chatId: item.chatId,
            isAnalyzable: item.isAnalyzable ?? false
          }));
          setRecordList(mapped);
          // 첫 번째 기록 자동 분석 조회 (분석 가능할 때만)
          const first = mapped.find(r => r.isAnalyzable);
          if (first) {
            fetchAnalysis(first.chatId);
          }
        }
      } catch {}
    };
    fetchChatRooms();
  }, []);

  // 분석 결과 조회 함수
  const fetchAnalysis = async (chatId: number) => {
    try {
      const res = await authFetch(`https://test-sso.online/analytics/${chatId}`, { method: 'GET' });
      if (res.ok) {
        const data: Record<string, unknown> = await res.json();
        setAnalysis(data);
      } else {
        setAnalysis(null);
      }
    } catch {
      setAnalysis(null);
    }
  };

  // 기록 클릭 시 분석 결과 불러오기
  const handleRecordClick = (idx: number, chatId: number, isActive: boolean) => {
    if (!isActive) return;
    setSelectedRecord(idx);
    fetchAnalysis(chatId);
  };

  // 다운로드 기능 (바깥에 padding 48px 추가)
  const handleDownload = async () => {
    if (reportRef.current) {
      const wrapper = document.createElement('div');
      wrapper.style.background = '#f6f8f7';
      wrapper.style.padding = '48px';
      wrapper.style.display = 'inline-block';
      wrapper.appendChild(reportRef.current.cloneNode(true));
      document.body.appendChild(wrapper);
      await html2canvas(wrapper, {backgroundColor: null}).then(canvas => {
        const link = document.createElement('a');
        link.download = 'report.png';
        link.href = canvas.toDataURL();
        link.click();
      });
      document.body.removeChild(wrapper);
    }
  };

  return (
    <div className="analysis-root" style={{background: '#fff'}}>
      {/* 네비게이션 바 */}
      <nav className="main-nav" style={{marginBottom:0}}>
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
      <div style={{width:'100%',height:36,background:'#fff'}}></div>
      <div className="analysis-content" style={{maxWidth:1400,margin:'0 auto',display:'flex',gap:0,background:'#fff',padding:0}}>
        {/* 좌측 기록 영역 */}
        <aside className="record-section">
          <div className="record-title-row">
            <div className="record-title">기록</div>
          </div>
          <div className="record-list">
            {recordList.map((item, idx) => {
              const isActive = item.isAnalyzable;
              return (
                <div
                  className={`record-item${selectedRecord === idx && isActive ? ' selected' : ''}${!isActive ? ' disabled' : ''}`}
                  key={item.chatId}
                  onClick={() => handleRecordClick(idx, item.chatId, isActive)}
                  style={{
                    background: selectedRecord === idx && isActive ? '#FFF7D1' : undefined,
                    color: selectedRecord === idx && isActive ? '#b48a00' : undefined,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    opacity: isActive ? 1 : 0.5
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
          {/* 툴크 항상 표시 */}
          <div style={{marginTop:18,display:'flex',justifyContent:'center'}}>
            <div style={{background:'#FFF7D1',color:'#b48a00',fontWeight:500,fontSize:'0.98rem',borderRadius:8,padding:'10px 32px',minWidth:220,boxShadow:'0 1px 4px rgba(0,0,0,0.04)',textAlign:'center',display:'inline-block'}}>
              15턴이 넘지 않는 대화는 레포트 생성이 불가능해요.
            </div>
          </div>
        </aside>
        {/* 우측 레포트 영역 */}
        <section className="chat-section" style={{background:'#fff',borderRadius:16,padding:'48px 0',maxWidth:'90%',margin:'0 auto',flex:1,display:'flex',justifyContent:'center'}}>
          <div ref={reportRef} style={{width: '100%', maxWidth: '90%', margin:'0 auto',background:'#fff',borderRadius:16}}>
            {analysis ? (
              <>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:48}}>
                  <h2 style={{
                    fontSize:'1.25rem', fontWeight:800, color:'#222', lineHeight:1.5,
                    letterSpacing: '-0.5px', textAlign:'left', margin:0, marginLeft:36
                  }}>
                    {analysis.topic && typeof analysis.topic === 'object' && !Array.isArray(analysis.topic)
                      ? Object.keys(analysis.topic as Record<string, unknown>).join(', ')
                      : '분석 결과'}
                  </h2>
                  <button id="report-download-btn" onClick={async () => {
                    const btn = document.getElementById('report-download-btn');
                    if (btn) btn.style.display = 'none';
                    await handleDownload();
                    if (btn) btn.style.display = '';
                  }}
                    style={{
                      background:'#f7eac2',
                      border:'none',
                      borderRadius:12,
                      padding:'6px 12px',
                      fontWeight:600,
                      fontSize:'1rem',
                      color:'#7a6a2f',
                      cursor:'pointer',
                      marginRight:36
                    }}
                  >저장</button>
                </div>
                {/* 감정 분석 */}
                <div style={{marginBottom:12}}><div style={sectionTitleStyle}>감정 분석</div></div>
                <div style={cardStyleWide}>
                  {analysis.emotion && typeof analysis.emotion === 'object' && !Array.isArray(analysis.emotion) ? (
                    Object.entries(analysis.emotion as Record<string, number>).map(([emotion, value]) => (
                      <EmotionBar key={emotion} label={emotion} value={value} />
                    ))
                  ) : null}
                </div>
                <div style={dividerStyle} />
                {/* 인지 왜곡 */}
                <div style={{marginBottom:12}}><div style={sectionTitleStyle}>인지 왜곡</div></div>
                <div style={cardStyleWide}>
                  {Array.isArray(analysis.distortions) && analysis.distortions.length > 0 ? (
                    (analysis.distortions as Distortion[]).map((d, i) => (
                      <div key={i} style={{marginBottom:20}}>
                        <div style={{fontWeight:700, color:'#444', marginBottom:4, fontSize:'1.05rem', textAlign:'left'}}>{d.name}</div>
                        <LeftBubble>{d.example}</LeftBubble>
                        <div style={{color:'#444', fontSize:'1.01rem', marginBottom:5, textAlign:'left'}}>
                          <span style={{color:'#b48a00',fontWeight:700,marginRight:4}}>&rarr;</span>{d.explanation}
                        </div>
                        <RightBubble>{d.advice}</RightBubble>
                      </div>
                    ))
                  ) : (
                    <div style={{color:'#888',padding:'16px 0'}}>인지 왜곡 데이터가 없습니다.</div>
                  )}
                </div>
              </>
            ) : (
              <div style={{padding: 40, color: '#888'}}>분석 결과가 없습니다.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisPage; 
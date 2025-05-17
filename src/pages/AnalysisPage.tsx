import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AnalysisPage.css';
import '../MainPage.css';
import logoImg from '../assets/logo.png';
import html2canvas from 'html2canvas';
// import { FaRegSmile, FaRegFrown, FaRegAngry, FaRegMeh, FaRegGrinStars } from 'react-icons/fa';

// 예시 데이터 (props로 받을 수도 있음)
const reportData = {
  missionTopic: '친구들과의 관계에서 느끼는 실망과 분노, 그리고 과거의 경험이 현재의 감정에 미치는 영향 탐구',
  missionEmotion: {
    '슬픔': 40,
    '분노': 30,
    '불안': 15,
    '기쁨': 10,
    '짜증': 5
  },
  missionDistortion: [
    {
      name: '과잉일반화',
      example: '우리 집이 잘 못 산다는 것을 친구들이 알게 되었을 때 정말 억장이 무너지는 것 같았어.',
      explanation: '한 번의 경험을 바탕으로 모든 친구들과의 관계에서 부정적인 감정을 일반화하고 있음.',
      advice: '모든 친구가 같은 반응을 보이지 않을 수 있다는 점을 기억해주세요. 각 상황은 다르니까요.'
    },
    {
      name: '감정적 추론',
      example: '화나는데 직접 말하기는 뭔가 미안하다랄까.',
      explanation: '감정을 사실로 받아들이고, 그로 인해 행동을 제한하고 있음.',
      advice: '감정은 중요한 신호이지만, 반드시 그 감정에 따라 행동할 필요는 없어요. 감정을 표현하는 방법을 찾아보세요.'
    }
  ],
  mainMission: {
    title: '감정 표현 연습',
    detail: '내 감정을 솔직하게 표현하는 연습을 해보세요. 매일 감정을 기록하고, 그 감정을 친구에게 전달하는 방법을 고민해보세요. 예를 들어, 하루에 한 번 감정을 적고, 그 중 하나를 친구에게 메시지로 보내는 것입니다. 이 미션은 2주 동안 진행해보세요.',
    횟수: '매일 1회',
    기간: '2주'
  },
  subMission: [
    {
      title: '감정 일기 쓰기',
      detail: '매일 느낀 감정을 기록하세요. 감정의 원인과 그에 대한 반응을 적어보세요. 이를 통해 자신의 감정을 더 잘 이해할 수 있습니다.'
    },
    {
      title: '긍정적인 경험 회상하기',
      detail: '하루에 한 번, 긍정적인 경험이나 감정을 떠올려보세요. 그 경험이 왜 긍정적이었는지 적어보세요.'
    },
    {
      title: '친구와의 대화 연습',
      detail: '가까운 친구와 감정에 대해 이야기하는 시간을 가져보세요. 자신의 감정을 솔직하게 나누고, 친구의 감정도 들어보는 기회를 만들어보세요.'
    }
  ]
};

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

const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(0); // 기록 선택 인덱스
  const reportRef = useRef<HTMLDivElement>(null);

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

  // 기록 리스트 예시 (turn 필드 추가)
  const recordList = [
    { text: '지원이와 학교생활 고민 상담', turn: 18 },
    { text: '여름씨와 취준 고민 상담', turn: 12 },
    { text: '서연쌤과 우울증 치료 상담', turn: 21 }
  ];

  return (
    <div className="analysis-root" style={{background: 'linear-gradient(120deg, #f6f8f7 60%, #e6eefa 100%)'}}>
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
              const isActive = item.turn >= 15;
              return (
                <div
                  className={`record-item${selectedRecord === idx && isActive ? ' selected' : ''}${!isActive ? ' disabled' : ''}`}
                  key={idx}
                  onClick={() => isActive && setSelectedRecord(idx)}
                  style={{
                    background: selectedRecord === idx && isActive ? '#FFF7D1' : undefined,
                    color: selectedRecord === idx && isActive ? '#b48a00' : undefined
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
            {/* 상단 제목 + 저장 버튼 */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:48}}>
              <h2 style={{
                fontSize:'1.25rem', fontWeight:800, color:'#222', lineHeight:1.5,
                letterSpacing: '-0.5px', textAlign:'left', margin:0, marginLeft:36
              }}>
                친구들과의 관계에서 느끼는 실망과 분노,<br />그리고 과거의 경험이 현재의 감정에 미치는 영향 탐구
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
              {Object.entries(reportData.missionEmotion).map(([emotion, value]) => (
                <EmotionBar key={emotion} label={emotion} value={value} />
              ))}
            </div>
            <div style={dividerStyle} />
            {/* 미션 */}
            <div style={{marginBottom:12}}><div style={sectionTitleStyle}>미션</div></div>
            <div style={cardStyleWide}>
              <div style={{marginBottom:14, textAlign:'left'}}>
                <div style={{fontWeight:700, fontSize:'1.07rem', marginBottom:7, textAlign:'left'}}>감정 표현 연습</div>
                <div style={{color:'#444', marginBottom:8, fontSize:'1.01rem', textAlign:'left'}}>
                  내 감정을 솔직하게 표현하는 연습을 해보세요. 매일 감정을 기록하고, 그 감정을 친구에게 전달하는 방법을 고민해보세요.<br />
                  예를 들어, 하루에 한 번 감정을 적고, 그 중 하나를 친구에게 메시지로 보내는 것입니다. 이 미션은 2주 동안 진행해보세요.
                </div>
              </div>
              <ul style={{marginLeft:18, color:'#444', fontSize:'1.01rem', paddingLeft:0, marginBottom:0, textAlign:'left'}}>
                <li style={{marginBottom:4}}>감정 일기 쓰기</li>
                <li style={{marginBottom:4}}>긍정적인 경험 회상하기</li>
                <li>친구와의 대화 연습</li>
              </ul>
            </div>
            <div style={dividerStyle} />
            {/* 인지 왜곡 */}
            <div style={{marginBottom:12}}><div style={sectionTitleStyle}>인지 왜곡</div></div>
            <div style={cardStyleWide}>
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:700, color:'#444', marginBottom:4, fontSize:'1.05rem', textAlign:'left'}}>과잉일반화</div>
                <LeftBubble>&quot;우리 집이 못 산다는 걸 친구들이 알았을 때 정말 억장이 무너지는 기분이었어요.&quot;</LeftBubble>
                <div style={{color:'#444', fontSize:'1.01rem', marginBottom:5, textAlign:'left'}}>
                  <span style={{color:'#b48a00',fontWeight:700,marginRight:4}}>&rarr;</span>한 번의 경험을 바탕으로 모든 친구들과의 관계에서 부정적인 감정을 일반화하고 있음
                </div>
                <RightBubble>모든 친구가 같은 반응을 보이지 않을 수 있다는 점을 기억해주세요. 각 상황은 다르니까요.</RightBubble>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalysisPage; 
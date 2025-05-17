import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../InitialPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

// 심리검사 타입 정의
interface TestQuestion {
  id: number;
  text: string;
  category: string;
  reverseScoring: boolean;
}

// 심리검사 문항 데이터
const questions: TestQuestion[] = [
  {
    id: 1,
    text: '흥미를 느끼거나 즐거움을 느끼는 일이 거의 없었다.',
    category: 'depression',
    reverseScoring: false
  },
  {
    id: 2,
    text: '기분이 가라앉거나 우울하거나 절망적인 느낌이 들었다.',
    category: 'depression',
    reverseScoring: false
  },
  {
    id: 3,
    text: '잠들기 어렵거나 자주 깼거나, 또는 너무 많이 잠을 잤다.',
    category: 'sleep',
    reverseScoring: false
  },
  {
    id: 4,
    text: '피로감이나 기운이 없었다.',
    category: 'physical',
    reverseScoring: false
  },
  {
    id: 5,
    text: '식욕이 없거나 과식했다.',
    category: 'physical',
    reverseScoring: false
  },
  {
    id: 6,
    text: '자신을 실패자라고 느꼈거나, 자신이나 가족을 실망시켰다고 생각했다.',
    category: 'mental',
    reverseScoring: false
  },
  {
    id: 7,
    text: '집중하기 어려웠다 (예: 신문 읽기, TV 시청).',
    category: 'mental',
    reverseScoring: false
  },
  {
    id: 8,
    text: '주변 사람이 알아챌 정도로 말이나 행동이 느려졌거나, 너무 안절부절못했다.',
    category: 'behavior',
    reverseScoring: false
  },
  {
    id: 9,
    text: '살아있는 것이 싫거나 자해 또는 죽음에 대해 생각했다.',
    category: 'suicidal',
    reverseScoring: false
  }
];

const RADIO_SIZE = 48;
const RADIO_BORDER = 2;
const RADIO_SELECTED_BORDER = 3;
const RADIO_INNER_SIZE = 24;
const RADIO_COLOR = '#FFD772';
const RADIO_GRAY = '#d1d1d1';

const CustomRadioSlider: React.FC<{
  value: number | null;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, margin: '32px 0 0 0', userSelect: 'none' }}>
      {/* 라벨+구분선 */}
      <div style={{
        width: 410,
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        color: '#b0b0b0',
        fontWeight: 400,
        fontSize: '0.8rem',
        letterSpacing: '-0.5px',
      }}>
        <span style={{whiteSpace:'nowrap'}}>매우 그렇지 않다</span>
        <div style={{flex:0.8, height:1, background:'#e0e0e0', margin:'0 3px'}}></div>
        <span style={{whiteSpace:'nowrap'}}>보통이다</span>
        <div style={{flex: 1, height:1, background:'#e0e0e0', margin:'0 3px'}}></div>
        <span style={{whiteSpace:'nowrap'}}>매우 그렇다</span>
      </div>
      {/* 라디오 그룹 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
        {[1, 2, 3, 4, 5].map(num => (
          <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 48 }}>
            <div
              onClick={() => onChange(num)}
              style={{
                width: RADIO_SIZE,
                height: RADIO_SIZE,
                borderRadius: '50%',
                border: `${value === num ? RADIO_SELECTED_BORDER : RADIO_BORDER}px solid ${value === num ? RADIO_COLOR : RADIO_GRAY}`,
                background: '#fff',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'border 0.2s cubic-bezier(.4,2,.6,1)',
                marginBottom: 0,
                position: 'relative',
              }}
            >
              {value === num && (
                <div style={{
                  width: RADIO_INNER_SIZE,
                  height: RADIO_INNER_SIZE,
                  borderRadius: '50%',
                  background: RADIO_COLOR,
                  transition: 'background 0.2s cubic-bezier(.4,2,.6,1)'
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const chatMessages = [
  {
    sender: '토닥이',
    text: '안녕! 나는 토닥이야. 너의 마음을 토닥토닥 해 줄게.'
  },
  {
    sender: '토닥이',
    text: '이야기 나누기 전에, 몇 가지 질문에 대답해 줄래?'
  },
  {
    sender: '토닥이',
    text: '너에게 맞는 심리검사를 준비했어. 각 항목을 솔직하게 답변해줘!'
  }
];

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 6;
  const [visibleMessages, setVisibleMessages] = useState(2); // 처음 두 개는 바로 보임

  useEffect(() => {
    if (visibleMessages < 3) {
      const timer = setTimeout(() => {
        setVisibleMessages(3);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  const handleSelect = (idx: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(questions.length / questionsPerPage) - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
    if (answers.every(ans => ans !== null)) {
        navigate('/test-complete', { state: { ...location.state, testAnswers: answers } });
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  return (
    <div className="initial-root">
      <nav className="main-nav">
        <img src={logoImg} alt="토닥이 로고" className="main-logo" onClick={() => navigate('/main')} style={{cursor:'pointer'}} />
      </nav>
      <div className="initial-container" style={{flexDirection:'row', gap: '32px', maxWidth: 1200, minWidth: 0}}>
        {/* 왼쪽: 채팅 메시지 영역 */}
        <div className="chat-section">
          {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
            <div className="chat-message" key={idx}>
            <img src={todakiImg} alt="토닥이" className="todaki-chat-img" />
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                <span className="sender" style={{fontWeight:400, fontSize:'0.93rem', marginBottom:2, marginLeft:2}}>{msg.sender}</span>
                <div className={"message-content" + (idx === 2 && visibleMessages === 3 ? ' chat-message-appear' : '')}>
                  <div className="text">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 오른쪽: 심리검사 영역 */}
        <div className="input-section" style={{
          marginTop: 0,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 2px 16px rgba(122,123,213,0.07)',
          padding: '36px 32px',
          minWidth: 0
        }}>
          <div className="test-progress" style={{
            marginBottom: 24, 
            fontWeight: 400,
            fontSize: '0.9rem'
          }}>
            {currentPage + 1} / {Math.ceil(questions.length / questionsPerPage)}
          </div>
          <div className="test-questions" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32
          }}>
            {currentQuestions.map((q, idx) => {
              const questionIndex = currentPage * questionsPerPage + idx;
              return (
                <div key={q.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 18,
                  padding: '24px',
                  background: '#f7f7f7',
                  borderRadius: 12,
                  boxShadow: 'none',
                  border: '1.5px solid #f2f2f2',
                  marginBottom: 24,
                  minWidth: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <div style={{ background: '#FFD772', color: '#fff', borderRadius: 1, fontSize: '0.9rem', fontWeight: 600, padding: '2px 12px', marginRight: 8, letterSpacing: '-0.5px' }}>
                      Q{q.id}.
                    </div>
                    <span style={{ fontWeight: 400, fontSize: '1.13rem', color: '#222', textAlign: 'left', lineHeight: 1.6 }}>{q.text}</span>
        </div>
                  <CustomRadioSlider
                    value={answers[questionIndex] ?? null}
                    onChange={v => handleSelect(questionIndex, v)}
                  />
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 32
          }}>
            <button
              className="submit-btn"
              onClick={handlePrev}
              disabled={currentPage === 0}
            >
              이전
            </button>
          <button
            className="submit-btn"
            onClick={handleNext}
            disabled={currentQuestions.some((_, idx) => answers[currentPage * questionsPerPage + idx] === null)}
          >
            {currentPage === Math.ceil(questions.length / questionsPerPage) - 1 ? '완료' : '다음'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 
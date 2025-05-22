import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../InitialPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

// 카테고리 라벨 → 코드 변환 함수
function getCategoryCode(label: string) {
  const map: Record<string, string> = {
    '우울 / 무기력': 'depression',
    '불안 / 긴장': 'anxiety',
    '대인관계 / 소통 어려움': 'relationship',
    '진로 / 미래 불안': 'future',
    '학업 / 성적 스트레스': 'academic',
    '직장 / 업무 스트레스': 'work',
    '가족 문제': 'family',
    '연애 / 이별': 'romantic',
    '자기이해 / 성격 혼란': 'selfUnderstanding',
    '생활습관 / 신체 문제': 'lifestyle',
  };
  return map[label] || '';
}

// 문항 타입 정의 (API 응답 기준)
interface TestQuestion {
  id: number;
  text?: string;
  content?: string;
  order?: number;
  isReverse?: boolean;
}

const RADIO_SIZE = 48;
const RADIO_BORDER = 2;
const RADIO_SELECTED_BORDER = 3;
const RADIO_INNER_SIZE = 24;
const RADIO_COLOR = '#FFD772';
const RADIO_GRAY = '#d1d1d1';

const CustomRadioSlider: React.FC<{
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}> = ({ value, onChange, min = 1, max = 5 }) => {
  const minNum = Number(min);
  const maxNum = Number(max);
  const range = Array.from({ length: maxNum - minNum + 1 }, (_, i) => minNum + i);
  console.log('CustomRadioSlider range:', { minNum, maxNum, range });
  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '32px 0 0 0',
        userSelect: 'none',
      }}
    >
      {/* 라벨+구분선 */}
      <div
        style={{
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
        }}
      >
        <span style={{ whiteSpace: 'nowrap' }}>매우 그렇지 않다</span>
        <div style={{ flex: 0.8, height: 1, background: '#e0e0e0', margin: '0 3px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>보통이다</span>
        <div style={{ flex: 1, height: 1, background: '#e0e0e0', margin: '0 3px' }}></div>
        <span style={{ whiteSpace: 'nowrap' }}>매우 그렇다</span>
      </div>
      {/* 라디오 그룹 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 16, // gap을 줄임
          width: '100%',
          overflowX: 'auto', // 스크롤 허용
          padding: '0 8px', // 좌우 여백
        }}
      >
        {range.map((num) => (
          <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
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
                <div
                  style={{
                    width: RADIO_INNER_SIZE,
                    height: RADIO_INNER_SIZE,
                    borderRadius: '50%',
                    background: RADIO_COLOR,
                    transition: 'background 0.2s cubic-bezier(.4,2,.6,1)',
                  }}
                />
              )}
            </div>
            <span style={{ marginTop: 6, fontSize: '0.95rem', color: '#b0b0b0', fontWeight: 500 }}>{num}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const chatMessages = [
  {
    sender: '토닥이',
    text: '안녕! 나는 토닥이야. 너의 마음을 토닥토닥 해 줄게.',
  },
  {
    sender: '토닥이',
    text: '이야기 나누기 전에, 몇 가지 질문에 대답해 줄래?',
  },
  {
    sender: '토닥이',
    text: '너에게 맞는 심리검사를 준비했어. 각 항목을 솔직하게 답변해줘!',
  },
];

const TestPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { age, gender, selectedWorries } = location.state || {};
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [surveyType, setSurveyType] = useState('');
  const [minScale, setMinScale] = useState(1);
  const [maxScale, setMaxScale] = useState(5);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 6;
  const [visibleMessages, setVisibleMessages] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL2 = 'https://test-sso.online';
  // state가 없거나 필수값이 없으면 InitialPage로 이동
  useEffect(() => {
    if (!age || !gender || !selectedWorries || !selectedWorries[0]) {
      navigate('/initial', { replace: true });
    }
  }, [age, gender, selectedWorries, navigate]);

  // 문항 불러오기
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await fetch(`${API_BASE_URL2}/users/basic-info/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            age: Number(age),
            gender: gender === '남자' ? 'male' : 'female',
            categoryCode: getCategoryCode(selectedWorries[0]),
          }),
        });
        if (!res.ok) throw new Error('문항을 불러오지 못했습니다.');
        const data = await res.json();
        setQuestions(data.questions || []);
        setSurveyType(data.surveyType || '');
        setMinScale(data.minScale ?? 1);
        setMaxScale(data.maxScale ?? 5);
        setAnswers(Array((data.questions || []).length).fill(null));
      } catch (e) {
        if (e instanceof Error) setError(e.message || '문항 불러오기 실패');
        else setError('문항 불러오기 실패');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
    // eslint-disable-next-line
  }, []);

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

  const handleSubmit = async () => {
    if (!surveyType || answers.some((a) => a === null)) return;
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL2}/users/basic-info/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          surveyType,
          answers: answers.map((a) => Number(a)),
        }),
      });
      if (!res.ok) throw new Error('제출에 실패했습니다.');
      const data = await res.json();
      navigate('/test-complete', { state: { ...location.state, result: data } });
    } catch (e) {
      if (e instanceof Error) alert(e.message || '제출 실패');
      else alert('제출 실패');
    }
  };

  const handleNext = () => {
    if (currentPage < Math.ceil(questions.length / questionsPerPage) - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      if (answers.every((ans) => ans !== null)) {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);

  if (loading) return <div style={{ padding: 80, textAlign: 'center' }}>문항을 불러오는 중입니다...</div>;
  if (error) return <div style={{ padding: 80, color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="initial-root">
      <nav className="main-nav">
        <img
          src={logoImg}
          alt="토닥이 로고"
          className="main-logo"
          onClick={() => navigate('/main')}
          style={{ cursor: 'pointer' }}
        />
      </nav>
      <div className="initial-container" style={{ flexDirection: 'row', gap: '32px', maxWidth: 1200, minWidth: 0 }}>
        {/* 왼쪽: 채팅 메시지 영역 */}
        <div className="chat-section">
          {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
            <div className="chat-message" key={idx}>
              <img src={todakiImg} alt="토닥이" className="todaki-chat-img" />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className="sender"
                  style={{ fontWeight: 400, fontSize: '0.93rem', marginBottom: 2, marginLeft: 2 }}
                >
                  {msg.sender}
                </span>
                <div className={'message-content' + (idx === 2 && visibleMessages === 3 ? ' chat-message-appear' : '')}>
                  <div className="text">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 오른쪽: 심리검사 영역 */}
        <div
          className="input-section"
          style={{
            marginTop: 0,
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 2px 16px rgba(122,123,213,0.07)',
            padding: '36px 32px',
            minWidth: 0,
          }}
        >
          <div
            className="test-progress"
            style={{
              marginBottom: 24,
              fontWeight: 400,
              fontSize: '0.9rem',
            }}
          >
            {currentPage + 1} / {Math.ceil(questions.length / questionsPerPage)}
          </div>
          <div
            className="test-questions"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {currentQuestions.map((q, idx) => {
              const questionIndex = currentPage * questionsPerPage + idx;
              return (
                <div
                  key={q.id}
                  style={{
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
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                    <div
                      style={{
                        background: '#FFD772',
                        color: '#fff',
                        borderRadius: 1,
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        padding: '2px 12px',
                        marginRight: 8,
                        letterSpacing: '-0.5px',
                      }}
                    >
                      Q{q.order}.
                    </div>
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: '1.13rem',
                        color: '#222',
                        textAlign: 'left',
                        lineHeight: 1.6,
                      }}
                    >
                      {q.content}
                    </span>
                  </div>
                  <CustomRadioSlider
                    value={answers[questionIndex] ?? null}
                    onChange={(v) => handleSelect(questionIndex, v)}
                    min={minScale}
                    max={maxScale}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 32,
            }}
          >
            <button className="submit-btn" onClick={handlePrev} disabled={currentPage === 0}>
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

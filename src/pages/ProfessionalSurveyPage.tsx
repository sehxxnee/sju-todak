import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MainPage.css';
import logoImg from '../assets/logo.png';

interface SurveyHistoryItem {
  id: number;
  surveyType: { name: string; code: string };
  totalScore: number;
  interpretation: string;
  createdAt: string;
}

interface SurveyQuestion {
  id: number;
  order: number;
  content: string;
  isReverse?: boolean;
}

interface SurveyResultDetail {
  surveyType?: { name: string };
  createdAt: string;
  totalScore: number;
  resultLabel?: string;
  interpretation?: string;
  resultDescription?: string;
  resultDetail?: string;
  resultFeature?: string;
  resultAdvice?: string;
  detail?: string;
  feature?: string;
  advice?: string;
}

const categories = [
  { label: '우울/무기력', code: 'depression' },
  { label: '불안/긴장', code: 'anxiety' },
  { label: '대인관계/소통어려움', code: 'relationship' },
  { label: '진로/미래불안', code: 'future' },
  { label: '학업/성적 스트레스', code: 'academic' },
  { label: '직장/업무 스트레스', code: 'work' },
  { label: '가족문제', code: 'family' },
  { label: '애착', code: 'attachment' },
  { label: '성격(빅5)', code: 'big5' },
  { label: '건강행동', code: 'health' },
  { label: '해리/정체감', code: 'dissociation' },
];

const API_BASE_URL = 'https://test-sso.online';

export const ProfessionalSurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'list' | 'survey' | 'result'>('list');
  const [history, setHistory] = useState<SurveyHistoryItem[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [surveyType, setSurveyType] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [minScale, setMinScale] = useState(1);
  const [maxScale, setMaxScale] = useState(5);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [result, setResult] = useState<SurveyResultDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultDetail, setResultDetail] = useState<SurveyResultDetail | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const QUESTIONS_PER_PAGE = 10;

  // 1. 이전 설문조사 목록 불러오기
  useEffect(() => {
    if (step === 'list') {
      setLoading(true);
      setError('');
      fetch(`${API_BASE_URL}/surveys/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch(() => setError('이전 설문조사 목록을 불러오지 못했습니다.'))
        .finally(() => setLoading(false));
    }
  }, [step]);

  // 2. 설문 결과 상세 조회
  const fetchResultDetail = async (userSurveyId: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/surveys/${userSurveyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      if (!res.ok) throw new Error('결과를 불러오지 못했습니다.');
      const data = await res.json();
      console.log(data);
      setResultDetail(data);
      setShowResultModal(true);
    } catch {
      setError('결과를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 3. 설문 시작
  const handleStartSurvey = async () => {
    if (!selectedCategory) return;
    setLoading(true);
    setError('');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/surveys/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ categoryCode: selectedCategory }),
      });
      if (!res.ok) throw new Error('설문을 시작할 수 없습니다.');
      const data = await res.json();
      setSurveyType(data.surveyType);
      setQuestions(data.questions || []);
      setMinScale(data.minScale ?? 1);
      setMaxScale(data.maxScale ?? 5);
      setAnswers(Array((data.questions || []).length).fill(null));
      setStep('survey');
      setShowCategoryModal(false);
    } catch {
      setError('설문 시작 실패');
    } finally {
      setLoading(false);
    }
  };

  // 4. 답변 선택
  const handleSelect = (idx: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  // 5. 설문 제출
  const handleSubmit = async () => {
    if (!surveyType || answers.some((a) => a === null)) return;
    setLoading(true);
    setError('');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/surveys/submit`, {
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
      setResult(data);
      setStep('result');
    } catch {
      setError('제출 실패');
    } finally {
      setLoading(false);
    }
  };

  // 기존 서비스 스타일의 원형 라디오 버튼 렌더링
  const renderRadioGroup = (qIdx: number) => {
    const min = Number(minScale);
    const max = Number(maxScale);
    const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const RADIO_SIZE = 48;
    const RADIO_BORDER = 2;
    const RADIO_SELECTED_BORDER = 3;
    const RADIO_INNER_SIZE = 24;
    const RADIO_COLOR = '#FFD772';
    const RADIO_GRAY = '#d1d1d1';
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          marginTop: 8,
        }}
      >
        {range.map((num) => (
          <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
            <div
              onClick={() => handleSelect(qIdx, num)}
              style={{
                width: RADIO_SIZE,
                height: RADIO_SIZE,
                borderRadius: '50%',
                border: `${answers[qIdx] === num ? RADIO_SELECTED_BORDER : RADIO_BORDER}px solid ${answers[qIdx] === num ? RADIO_COLOR : RADIO_GRAY}`,
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
              {answers[qIdx] === num && (
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
    );
  };

  return (
    <div className="mainpage-root min-h-screen bg-[#f9f9fb]">
      <nav className="main-nav">
        <img
          src={logoImg}
          alt="토닥이 로고"
          className="main-logo"
          onClick={() => navigate('/main')}
          style={{ cursor: 'pointer' }}
        />
        <div className="main-menu">
          <span onClick={() => navigate('/main')} style={{ cursor: 'pointer' }}>채팅</span>
          <span onClick={() => navigate('/goals')} style={{ cursor: 'pointer' }}>미션</span>
          <span onClick={() => navigate('/analysis')} style={{ cursor: 'pointer' }}>분석</span>
          <span onClick={() => navigate('/calendar')} style={{ cursor: 'pointer' }}>캘린더</span>
          <span onClick={() => navigate('/professional-survey')} style={{ cursor: 'pointer' }}>심리검사</span>
        </div>
        <span
          className="profile-menu"
          style={{ cursor: 'pointer', marginLeft: 'auto', paddingRight: '20px', marginRight: 30 }}
          onClick={() => navigate('/profile')}
        >
          프로필
        </span>
      </nav>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'transparent',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <div style={{
          maxWidth: 1200,
          minWidth: 0,
          width: '100%',
          marginTop: 30,
          marginLeft: 32,
          marginRight: 32,
          background: '#fff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
          borderRadius: 18,
          minHeight: 720,
          padding: 0
        }}>
          <div style={{ padding: '15px 40px', minHeight: 720, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30, width: '100%', justifyContent: 'space-between' }}>
              {/* 설문 step일 때는 설문 카테고리와 설문지 이름만, 그 외에는 기존처럼 */}
              {step === 'survey' ? (
                <>
                  {selectedCategory && (
                    <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#bfa600', marginLeft: 52, marginTop:50, marginRight: 12 }}>
                      {categories.find(cat => cat.code === selectedCategory)?.label || selectedCategory}
                    </span>
                  )}
                  {surveyType && (
                    <span style={{ fontSize: '1.15rem', fontWeight: 600,marginTop:50, color: '#222' }}>
                      {surveyType}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <h2 style={{ fontWeight: 700, fontSize: '2rem', margin: 0, textAlign: 'left' }}>전문 심리검사</h2>
                </>
              )}
              <div style={{ marginLeft: 'auto' }}>
          {step === 'list' && (
            <button
              onClick={() => setShowCategoryModal(true)}
              style={{
                      background: '#f7eac2',
                      color: '#7a6a2f',
                border: 'none',
                      borderRadius: 12,
                fontWeight: 600,
                      fontSize: '1rem',
                      padding: '6px 12px',
                cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}
            >
              새 설문 시작
            </button>
          )}
        </div>
            </div>
            {/* 구분선 */}
            {step === 'list' && (
              <div style={{ width: '100%', height: 1, background: '#e0e0e0'}} />
            )}
        {loading && <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>}
        {error && <div style={{ color: 'red', marginBottom: 24 }}>{error}</div>}
        {/* 1. 이전 설문 목록 */}
        {step === 'list' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 32,
              justifyContent: 'center',
                  alignItems: history.length === 0 ? 'center' : 'flex-start',
              marginTop: 24,
                  minHeight: 400,
                  height: history.length === 0 ? '400px' : undefined,
            }}
          >
            {history.length === 0 ? (
                  <div style={{ color: '#aaa', fontSize: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                이전에 진행한 전문 심리검사가 없습니다.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="survey-history-card"
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    padding: 32,
                    minWidth: 0,
                    cursor: 'pointer',
                    border: '1.5px solid #f2f2f2',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'box-shadow 0.2s',
                    textAlign: 'center',
                  }}
                  onClick={() => fetchResultDetail(item.id)}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.13rem', marginBottom: 2 }}>{item.surveyType.name}</div>
                  <div style={{ color: '#888', fontSize: '1rem', marginBottom: 2 }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontWeight: 600, margin: '8px 0 0 0' }}>
                    총점: <span style={{ color: '#FFD772', fontWeight: 700 }}>{item.totalScore}</span>
                  </div>
                  <div style={{ color: '#444', fontSize: '1.08rem', marginTop: 2 }}>{item.interpretation}</div>
                  <button
                    style={{
                      marginTop: 10,
                      background: '#f7eac2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 22px',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      color: '#7a6a2f',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    결과 보기
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {/* 2. 결과 상세 모달 */}
        {showResultModal && resultDetail && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
                  maxHeight: '100vh',
                  overflowY: 'auto',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                padding: 40,
                minWidth: 340,
                maxWidth: 420,
                    width: '90vw',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>
                {resultDetail.surveyType?.name || '설문 결과'}
              </div>
              <div style={{ color: '#888', fontSize: '1rem', marginBottom: 4 }}>
                {new Date(resultDetail.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontWeight: 600, margin: '10px 0 0 0' }}>
                총점: <span style={{ color: '#000000', fontWeight: 700 }}>{resultDetail.totalScore}</span>
              </div>
              <div style={{ color: '#444', fontSize: '1.08rem', marginTop: 2 }}>
                {resultDetail.resultLabel || resultDetail.interpretation}
              </div>
              {resultDetail.resultDescription && (
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>{resultDetail.resultDescription}</div>
              )}
                  {resultDetail.resultDetail && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '16px 0 8px 0', color: '#bfa600' }}>
                        상세 설명
                      </div>
                      <div
                        style={{
                          color: '#444',
                          fontSize: '1.05rem',
                          marginBottom: 18,
                          whiteSpace: 'pre-line',
                          textAlign: 'left',
                          lineHeight: 1.8,
                        }}
                      >
                        {resultDetail.resultDetail}
                      </div>
                    </>
                  )}
                  {resultDetail.resultFeature && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '16px 0 8px 0', color: '#bfa600' }}>
                        특징
                      </div>
                      <ul
                        style={{
                          color: '#444',
                          fontSize: '1.05rem',
                          marginBottom: 18,
                          textAlign: 'left',
                          paddingLeft: 0,
                          background: '#fffbe9',
                          borderRadius: 10,
                          padding: '12px 14px',
                          maxWidth: 360,
                          lineHeight: 1.8,
                        }}
                      >
                        {resultDetail.resultFeature.split(/\n|\r|•|- /).map((line, idx) =>
                          line.trim() ? (
                            <li
                              key={idx}
                              style={{ marginBottom: 12, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}
                            >
                              <span style={{ marginRight: 10, fontSize: '1.15em' }}>💡</span>
                              <span style={{ fontWeight: line.includes('경계') || line.includes('전략') ? 700 : 400 }}>
                                {line.trim()}
                              </span>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </>
                  )}
                  {resultDetail.resultAdvice && (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '16px 0 8px 0', color: '#bfa600' }}>
                        조언
                      </div>
                      <ul
                        style={{
                          color: '#444',
                          fontSize: '1.05rem',
                          marginBottom: 18,
                          textAlign: 'left',
                          paddingLeft: 0,
                          background: '#f0f7ff',
                          borderRadius: 10,
                          padding: '12px 14px',
                          maxWidth: 360,
                          lineHeight: 1.8,
                        }}
                      >
                        {resultDetail.resultAdvice.split(/\n|\r|•|- /).map((line, idx) =>
                          line.trim() ? (
                            <li
                              key={idx}
                              style={{ marginBottom: 12, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}
                            >
                              <span style={{ marginRight: 10, fontSize: '1.15em' }}>📝</span>
                              <span style={{ fontWeight: line.includes('책임') || line.includes('전략') ? 700 : 400 }}>
                                {line.trim()}
                              </span>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </>
                  )}
                  <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center', width: '100%' }}>
                <button
                  onClick={() => setShowResultModal(false)}
                  style={{
                    background: '#FFD772',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    color: '#222',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 카테고리 선택 모달 (기존 채팅방 생성 모달 스타일) */}
        {showCategoryModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 40,
                minWidth: 340,
                maxWidth: 480,
                boxShadow: '0 2px 16px rgba(0,0,0,0.13)',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: 8 }}>
                검사를 원하는 고민 유형을 선택하세요.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 8 }}>
                {categories.map((cat) => (
                  <button
                    key={cat.code}
                    onClick={() => setSelectedCategory(cat.code)}
                    style={{
                          background: selectedCategory === cat.code ? '#ffe38e' : '#fff',
                          border: selectedCategory === cat.code ? '1px solid #ffe38e' : '1px solid #E0E0E0',
                          borderRadius: 8,
                          padding: '8px 16px',
                          fontSize: '0.9rem',
                          color: selectedCategory === cat.code ? '#222' : '#444',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center',
                      fontWeight: 500,
                          boxShadow: selectedCategory === cat.code ? '0 2px 8px rgba(255,215,114,0.10)' : 'none',
                        }}
                        onMouseOver={e => {
                          if (selectedCategory !== cat.code) {
                            e.currentTarget.style.background = '#fffbe9';
                            e.currentTarget.style.color = '#444';
                            e.currentTarget.style.borderColor = '#ffe38e';
                          }
                        }}
                        onMouseOut={e => {
                          if (selectedCategory !== cat.code) {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#444';
                            e.currentTarget.style.borderColor = '#E0E0E0';
                          }
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={handleStartSurvey}
                  style={{
                    background: '#FFD772',
                        color: '#222',
                    border: 'none',
                        borderRadius: 22,
                    fontWeight: 600,
                        fontSize: '0.97rem',
                        padding: '8px 18px',
                    cursor: !selectedCategory || loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(245,224,163,0.10)',
                        marginRight: 8,
                        transition: 'background 0.18s',
                  }}
                  disabled={!selectedCategory || loading}
                      onMouseOver={e => { e.currentTarget.style.background = '#ffe28a'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#FFD772'; }}
                >
                  설문 시작
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  style={{
                        background: '#fff',
                        color: '#FFD772',
                        border: '1.5px solid #FFD772',
                        borderRadius: 22,
                        fontWeight: 600,
                        fontSize: '0.97rem',
                        padding: '8px 18px',
                    cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(245,224,163,0.10)',
                        transition: 'background 0.18s',
                  }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fffbe9'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 4. 설문 질문/응답 */}
        {step === 'survey' && (
              <div
                className="input-section"
                style={{
                  marginTop: 0,
                  background: '#fff',
                  borderRadius: 18,
                  padding: '36px 32px',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <div
                  className="test-progress"
                  style={{
                    marginBottom: 24,
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    color: '#666',
                  }}
                >
                  {currentPage + 1} / {Math.ceil(questions.length / QUESTIONS_PER_PAGE)}
                </div>
                <div
                  className="test-questions"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 32,
                    width: '100%',
                    maxWidth: 672,
                    alignItems: 'center',
                  }}
                >
              {questions
                .slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
                    .map((q, idx) => {
                      const questionIndex = currentPage * QUESTIONS_PER_PAGE + idx;
                      return (
                  <div
                    key={q.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 18,
                            padding: '24px',
                            background: '#fff',
                            borderRadius: 12,
                            border: '1.5px solid #f2f2f2',
                            marginBottom: 24,
                            minWidth: 0,
                            width: '100%',
                            maxWidth: 600,
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
                          {/* 매우 그렇지 않다 ~ 매우 그렇다 라벨+구분선: 질문 아래, 라디오 위 */}
                          <div
                            style={{
                              width: 410,
                              maxWidth: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center', 
                              color: '#b0b0b0',
                              fontWeight: 400,
                              fontSize: '0.8rem',
                              letterSpacing: '-0.5px',
                            }}
                          >
                            <span style={{ whiteSpace: 'nowrap', marginLeft:'140px' }}>매우 그렇지 않다</span>
                            <div style={{ flex: 0.8, height: 1, background: '#e0e0e0', margin: '0 3px' }}></div>
                            <span style={{ whiteSpace: 'nowrap' }}>보통이다</span>
                            <div style={{ flex: 1, height: 1, background: '#e0e0e0', margin: '0 3px' }}></div>
                            <span style={{ whiteSpace: 'nowrap' }}>매우 그렇다</span>
                    </div>
                          {renderRadioGroup(questionIndex)}
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
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 0}
                style={{
                  background: '#eee',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                      cursor: 'pointer',
                  color: '#444',
                }}
              >
                이전
              </button>
                  <button
                    onClick={() => {
                      if (currentPage < Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1) {
                        setCurrentPage((prev) => prev + 1);
                      } else {
                        handleSubmit();
                      }
                    }}
                    disabled={questions
                      .slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
                      .some((_, idx) => answers[currentPage * QUESTIONS_PER_PAGE + idx] === null)}
                    style={{
                      background: '#FFD772',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 32px',
                      fontWeight: 500,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      color: '#222',
                    }}
                  >
                    {currentPage === Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1 ? '완료' : '다음'}
                  </button>
                </div>
              </div>
            )}
            {/* 5. 결과 표시 */}
            {step === 'result' && result && (
              <div
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                  maxWidth: 600,
                  margin: '40px auto',
                  padding: '40px 24px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: 8 }}>검사 결과</div>
                {result.totalScore !== undefined && (
                  <div style={{ fontSize: '1.1rem', color: '#000000', fontWeight: 400, marginBottom: 8 }}>
                    총점: <span style={{ color: '#000000' }}>{result.totalScore}</span>
                  </div>
                )}
                {result.interpretation && (
                  <div style={{ fontSize: '1.15rem', fontWeight: 400, marginBottom: 18 }}>{result.interpretation}</div>
                )}
                {/* 상세 설명 */}
                {result.detail && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#bfa600', margin: '32px 0 8px 0' }}>
                      상세 설명
                    </div>
                    <div
                      style={{
                        color: '#444',
                        fontSize: '1.05rem',
                        marginBottom: 32,
                        lineHeight: 1.8,
                        textAlign: 'left',
                        maxWidth: 600,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                      }}
                    >
                      {result.detail}
                    </div>
                  </>
                )}
                {/* 특징 */}
                {result.feature && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#bfa600', margin: '32px 0 8px 0' }}>
                      특징
                    </div>
                    <ul
                      style={{
                        background: '#fffbe9',
                        borderRadius: 10,
                        padding: '12px 14px',
                        maxWidth: 480,
                        color: '#444',
                        fontSize: '1.05rem',
                        margin: '0 auto 32px auto',
                        lineHeight: 1.8,
                        textAlign: 'left',
                      }}
                    >
                      {result.feature.split(/\n|\r|•|- /).map((line, idx) =>
                        line.trim() ? (
                          <li
                            key={idx}
                            style={{ marginBottom: 12, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}
                          >
                            <span style={{ marginRight: 10, fontSize: '1.15em' }}>💡</span>
                            <span>{line.trim()}</span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </>
                )}
                {/* 조언 */}
                {result.advice && (
                  <>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#bfa600', margin: '32px 0 8px 0' }}>
                      조언
                    </div>
                    <ul
                      style={{
                        background: '#f0f7ff',
                        borderRadius: 10,
                        padding: '12px 14px',
                        maxWidth: 480,
                        color: '#444',
                        fontSize: '1.05rem',
                        margin: '0 auto 32px auto',
                        lineHeight: 1.8,
                        textAlign: 'left',
                      }}
                    >
                      {result.advice.split(/\n|\r|•|- /).map((line, idx) =>
                        line.trim() ? (
                          <li
                            key={idx}
                            style={{ marginBottom: 12, listStyle: 'none', display: 'flex', alignItems: 'flex-start' }}
                          >
                            <span style={{ marginRight: 10, fontSize: '1.15em' }}>📝</span>
                            <span>{line.trim()}</span>
                          </li>
                        ) : null,
                      )}
                    </ul>
                  </>
                )}
                <button
                  onClick={() => setStep('list')}
                  style={{
                    marginTop: 18,
                    width: '200px',
                    background: '#FFD772',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontWeight: 400,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    color: '#222',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  목록으로 돌아가기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSurveyPage;

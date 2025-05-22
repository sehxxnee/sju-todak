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
          <span style={{ color: '#FFD772', fontWeight: 700 }}>심리검사</span>
        </div>
        <span
          className="profile-menu"
          style={{ cursor: 'pointer', marginLeft: 'auto', paddingRight: '20px' }}
          onClick={() => navigate('/profile')}
        >
          프로필
        </span>
      </nav>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 0 60px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: '2rem', margin: 0 }}>전문 심리검사</h2>
          {step === 'list' && (
            <button
              onClick={() => setShowCategoryModal(true)}
              style={{
                padding: '12px 32px',
                background: '#FFD772',
                color: '#222',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              새 설문 시작
            </button>
          )}
        </div>
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
              alignItems: 'flex-start',
              marginTop: 24,
            }}
          >
            {history.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: '1.1rem', margin: '40px auto' }}>
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
                      background: '#FFD772',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 22px',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      cursor: 'pointer',
                      color: '#222',
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
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 18,
                padding: 40,
                minWidth: 340,
                maxWidth: 420,
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
                총점: <span style={{ color: '#FFD772', fontWeight: 700 }}>{resultDetail.totalScore}</span>
              </div>
              <div style={{ color: '#444', fontSize: '1.08rem', marginTop: 2 }}>
                {resultDetail.resultLabel || resultDetail.interpretation}
              </div>
              {resultDetail.resultDescription && (
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>{resultDetail.resultDescription}</div>
              )}
              <div style={{ marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center' }}>
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
                      padding: '14px 28px',
                      borderRadius: 10,
                      border: selectedCategory === cat.code ? '2px solid #FFD772' : '1.5px solid #e0e0e0',
                      background: selectedCategory === cat.code ? '#FFF7E0' : '#fff',
                      color: '#333',
                      fontWeight: 500,
                      fontSize: '1.08rem',
                      cursor: 'pointer',
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
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    cursor: !selectedCategory || loading ? 'not-allowed' : 'pointer',
                    color: '#222',
                  }}
                  disabled={!selectedCategory || loading}
                >
                  설문 시작
                </button>
                <button
                  onClick={() => setShowCategoryModal(false)}
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
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        {/* 4. 설문 질문/응답 */}
        {step === 'survey' && (
          <div className="flex flex-col items-center gap-8 mt-8 mb-24 w-full">
            {/* 설문지 이름 강조 + 진행률 */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  background: '#FFD772',
                  color: '#222',
                  fontWeight: 800,
                  fontSize: '2.1rem',
                  borderRadius: 18,
                  boxShadow: '0 4px 18px rgba(255,215,114,0.13)',
                  padding: '18px 44px',
                  marginBottom: 10,
                  textAlign: 'center',
                  letterSpacing: '-1px',
                  display: 'inline-block',
                  minWidth: 320,
                  maxWidth: 600,
                }}
              >
                {categories.find((c) => c.code === selectedCategory)?.label}
                <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#bfa600', marginLeft: 12 }}>
                  ({surveyType})
                </span>
              </div>
              {/* 진행률 바 + 텍스트 */}
              <div style={{ width: '100%', maxWidth: 420, margin: '0 auto', marginTop: 2 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}
                >
                  <span style={{ fontSize: '1.08rem', color: '#b0b0b0', fontWeight: 500 }}>
                    {currentPage * QUESTIONS_PER_PAGE + 1} / {questions.length} 문항
                  </span>
                  <span style={{ fontSize: '1.08rem', color: '#b0b0b0', fontWeight: 500 }}>
                    {Math.round(((currentPage * QUESTIONS_PER_PAGE + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 10,
                    background: '#f5e7b7',
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(255,215,114,0.08)',
                  }}
                >
                  <div
                    style={{
                      width: `${((currentPage * QUESTIONS_PER_PAGE + 1) / questions.length) * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #FFD772 60%, #ffe9a7 100%)',
                      borderRadius: 8,
                      transition: 'width 0.3s cubic-bezier(.4,2,.6,1)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-8 w-full max-w-2xl">
              {questions
                .slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
                .map((q, idx) => (
                  <div
                    key={q.id}
                    className="card bg-base-100 shadow-md rounded-xl p-8 border border-[#f2d772] flex flex-col gap-5"
                    style={{ background: '#fffbe9', boxShadow: '0 4px 16px rgba(255,215,114,0.08)' }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '1.18rem',
                        marginBottom: 18,
                        color: '#222',
                        letterSpacing: '-0.5px',
                        lineHeight: 1.6,
                      }}
                    >
                      Q{q.order}. {q.content}
                    </div>
                    {renderRadioGroup(currentPage * QUESTIONS_PER_PAGE + idx)}
                  </div>
                ))}
            </div>
            {/* 버튼 영역을 질문 카드와 같은 maxWidth로 감싸고 오른쪽 정렬 */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 32,
                width: '100%',
                maxWidth: 672,
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                style={{
                  background: '#eee',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 32px',
                  fontWeight: 500,
                  fontSize: '1.1rem',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  color: '#444',
                }}
                disabled={currentPage === 0}
              >
                이전
              </button>
              {currentPage < Math.ceil(questions.length / QUESTIONS_PER_PAGE) - 1 ? (
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  style={{
                    background: '#FFD772',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    color: '#222',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                  disabled={questions
                    .slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
                    .some((_, idx) => answers[currentPage * QUESTIONS_PER_PAGE + idx] === null)}
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  style={{
                    background: '#FFD772',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 32px',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    cursor: answers.some((a) => a === null) ? 'not-allowed' : 'pointer',
                    color: '#222',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                  disabled={answers.some((a) => a === null) || loading}
                >
                  제출
                </button>
              )}
              <button
                onClick={() => {
                  setStep('list');
                  setCurrentPage(0);
                }}
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
                돌아가기
              </button>
            </div>
          </div>
        )}
        {/* 5. 결과 표시 */}
        {step === 'result' && result && (
          <div className="flex flex-col items-center gap-8 mt-16 mb-24">
            <div className="font-bold text-2xl mb-2">검사 결과</div>
            {result.totalScore !== undefined && (
              <div className="text-xl font-semibold">
                총점: <span className="text-yellow-400 font-bold">{result.totalScore}</span>
              </div>
            )}
            {result.interpretation && <div className="text-lg text-gray-700 mb-2">해석: {result.interpretation}</div>}
            <button onClick={() => setStep('list')} className="btn btn-warning btn-md mt-4">
              목록으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalSurveyPage;

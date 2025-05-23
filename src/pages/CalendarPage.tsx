import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CalendarPage.css';
import {useAlert} from '../AlertContext'
import logoImg from '../assets/logo.png';
import googleLoginImg from '../assets/google_login.png';
import googleCalendarImg from '../assets/google-calendar.png';
const emotionColors = {
  슬픔: '#7a7bd5',
  분노: '#f77b7b',
  불안: '#f7c873',
  기쁨: '#b7e397',
  짜증: '#f3d87e',
};

const emotionList = Object.keys(emotionColors);

const calendarData = [
  { day: 11, emotion: '불안' },
  { day: 17, emotion: '보통' },
  { day: 21, emotion: '분노' },
  { day: 25, emotion: '보통' },
  { day: 28, emotion: '불안' },
  { day: 28, emotion: '행복' },
];

const API_BASE = 'https://test-sso.online';
const API_BASE2 = 'http://localhost:8080';
const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const year = 2025;
  const daysInMonth = 31;
  const firstDayOfWeek = 4; // 1일이 목요일(0:일~6:토)
  const {show} = useAlert();
  // 구글 연동 상태 및 일정 데이터
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [scheduleData, setScheduleData] = useState<
    { day: number; title: string; time: string; eventId: string; emotion?: string }[]
  >([]);
  // 감정 기록 상태
  const [emotionData, setEmotionData] = useState<{ day: number; emotion: string }[]>([]);
  // 감정 입력 모달 상태
  const [modal, setModal] = useState<{ open: boolean; day: number | null }>({ open: false, day: null });
  const [modalEmotions, setModalEmotions] = useState<{ [eventId: string]: string }>({});
  const [modalSchedules, setModalSchedules] = useState<
    { eventId: string; title: string; time: string; emotion?: string }[]
  >([]);
  const [modalDate, setModalDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 페이지 진입 시 DB 이벤트 먼저 조회
  useEffect(() => {
    const fetchDbEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsGoogleConnected(false);
          setScheduleData([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/calendar/db-events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setIsGoogleConnected(false);
          setScheduleData([]);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data && data.events && Array.isArray(data.events)) {
          setScheduleData(
            data.events.map((ev: any) => ({
              day: new Date(ev.start.dateTime).getDate(),
              title: ev.summary,
              time: new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              eventId: ev.id,
              emotion: ev.emotion,
            })),
          );
          setIsGoogleConnected(true);
        } else {
          setIsGoogleConnected(false);
          setScheduleData([]);
        }
      } catch {
        setIsGoogleConnected(false);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDbEvents();
  }, []);

  // 구글 연동 버튼 클릭 시
  const handleGoogleSync = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE}/calendar/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        show('구글 캘린더 연동에 실패했습니다.');
        return;
      }
      // 연동 성공 시 DB 이벤트 다시 불러오기
    setIsGoogleConnected(true);
      // DB 이벤트 재조회
      const dbRes = await fetch(`${API_BASE}/calendar/db-events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (dbRes.ok) {
        const data = await dbRes.json();
        if (data && data.events && Array.isArray(data.events)) {
          setScheduleData(
            data.events.map((ev: any) => ({
              day: new Date(ev.start.dateTime).getDate(),
              title: ev.summary,
              time: new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              eventId: ev.id,
              emotion: ev.emotion,
            })),
          );
        }
      }
    } catch {
      show('구글 캘린더 연동에 실패했습니다.');
    }
  };

  // 셀 클릭 시 모달 오픈
  const openModal = (day: number) => {
    const schedules = scheduleData.filter((s) => s.day === day);
    const initialEmotions: { [eventId: string]: string } = {};
    schedules.forEach((s) => {
      if (s.emotion) initialEmotions[s.eventId] = s.emotion;
    });
    setModalSchedules(schedules);
    setModalEmotions(initialEmotions);
    setModalDate(`${year}-05-${String(day).padStart(2, '0')}`);
    setModal({ open: true, day });
  };
  const closeModal = () => setModal({ open: false, day: null });

  // 감정 선택
  const handleEmotionSelect = async (eventId: string, emotion: string) => {
    setModalEmotions((prev) => ({ ...prev, [eventId]: emotion }));
    // 감정 선택 즉시 PATCH API 호출
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/calendar/event-emotion`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, emotion }),
      });
      if (!res.ok) throw new Error('감정 저장 실패');
      // 성공 시 UI에 반영 (이미 setModalEmotions로 반영됨)
    } catch {
      show('감정 저장에 실패했습니다.');
    }
  };

  // 감정 저장
  const handleSaveEmotions = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    for (const eventId in modalEmotions) {
      const emotion = modalEmotions[eventId];
      if (emotion) {
        await fetch(`${API_BASE}/calendar/event-emotion`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ eventId, emotion }),
        });
      }
    }
    closeModal();
    // 저장 후 DB 이벤트 새로고침
    const res = await fetch(`${API_BASE}/calendar/db-events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.events && Array.isArray(data.events)) {
        setScheduleData(
          data.events.map((ev: any) => ({
            day: new Date(ev.start.dateTime).getDate(),
            title: ev.summary,
            time: new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            eventId: ev.id,
            emotion: ev.emotion,
          })),
        );
      }
    }
  };

  // 달력 2차원 배열 생성
  const weeks: (null | { day: number; emotions: string[]; schedules: { title: string; time: string }[] })[][] = [];
  let day = 1;
  for (let w = 0; w < 6; w++) {
    const week: (null | { day: number; emotions: string[]; schedules: { title: string; time: string }[] })[] = [];
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < firstDayOfWeek) || day > daysInMonth) {
        week.push(null);
      } else {
        // 해당 날짜의 감정들
        const emotions = emotionData.filter((e) => e.day === day).map((e) => e.emotion);
        // 해당 날짜의 일정들 (구글 연동 시에만 표시)
        const schedules: { title: string; time: string; eventId: string; emotion?: string }[] = isGoogleConnected
          ? scheduleData.filter((s) => s.day === day)
          : [];
        week.push({ day, emotions, schedules });
        day++;
      }
    }
    weeks.push(week);
  }

  return (
    <div className="calendar-root">
      {/* 네비게이션 바 */}
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
      <div className="calendar-container">
        {loading ? (
          <div style={{ textAlign: 'center', margin: '40px 0' }}>로딩 중...</div>
        ) : !isGoogleConnected ? (
          <div style={{ textAlign: 'center', margin: '40px 0', color: '#888', fontSize: '1.08rem' }}>
            구글 캘린더 연동이 필요합니다.
            <br />
            아래 버튼을 눌러 연동해 주세요.
          </div>
        ) : null}
        <div className="calendar-header-row">
          <span className="calendar-year">{year}</span>
          <span className="calendar-month">May</span>
          <div className="calendar-legend">
            <span>
              <span className="legend-dot" style={{ background: emotionColors['슬픔'] }}></span>슬픔
            </span>
            <span>
              <span className="legend-dot" style={{ background: emotionColors['분노'] }}></span>분노
            </span>
            <span>
              <span className="legend-dot" style={{ background: emotionColors['불안'] }}></span>불안
            </span>
            <span>
              <span className="legend-dot" style={{ background: emotionColors['기쁨'] }}></span>기쁨
            </span>
            <span>
              <span className="legend-dot" style={{ background: emotionColors['짜증'] }}></span>짜증
            </span>
          </div>
          <button className="google-sync-btn" onClick={handleGoogleSync} disabled={isGoogleConnected}>
            <img src={googleCalendarImg} alt="Google" style={{ width: 22, verticalAlign: 'middle', marginRight: 8 }} />
            {isGoogleConnected ? '연동 완료' : 'Google 캘린더 연동'}
          </button>
        </div>
        <div className="calendar-table">
          {weeks.map((week, wi) => (
            <div className="calendar-week" key={wi}>
              {week.map((cell, di) => (
                <div
                  className={`calendar-cell${cell ? '' : ' empty'}`}
                  key={di}
                  onClick={cell ? () => openModal(cell.day) : undefined}
                  style={{
                    cursor: cell ? 'pointer' : undefined,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    minHeight: 80,
                    padding: '8px 6px 6px 8px',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* 날짜 숫자 좌측 상단 고정 */}
                  {cell && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 10,
                        fontWeight: 700,
                        fontSize: '1.15rem',
                        color: '#222',
                        zIndex: 2,
                      }}
                    >
                      {cell.day}
                    </div>
                  )}
                  {/* 감정 Dot 우측 상단 고정 */}
                  {cell &&
                    (() => {
                      const emotionEvent = (cell.schedules as { emotion?: string }[]).find((s) => s.emotion);
                      if (emotionEvent) {
                        const color = emotionColors[emotionEvent.emotion as keyof typeof emotionColors] || '#bbb';
                        return (
                          <div
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 10,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: color,
                              border: '2px solid #fff',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                              zIndex: 2,
                            }}
                            title={emotionEvent.emotion}
                          />
                        );
                      }
                      return null;
                    })()}
                  {/* 일정 리스트는 marginTop으로 아래에서 시작 */}
                  {cell && (
                    <div
                      className="calendar-schedules"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        minHeight: 24,
                        maxHeight: 36,
                        overflow: 'hidden',
                        padding: '0 6px',
                        zIndex: 1,
                      }}
                    >
                      {cell.schedules.slice(0, 2).map((s, i) => (
                        <span
                          key={s.eventId || i}
                          style={{
                            display: 'block',
                            fontSize: '0.95rem',
                            color: '#222',
                            fontWeight: 400,
                            margin: '2px 0 0 0',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: '100%',
                          }}
                          title={s.title}
                        >
                          {s.title}
                        </span>
                      ))}
                      {cell.schedules.length > 2 && (
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: '#aaa',
                            marginTop: 1,
                            textAlign: 'right',
                            width: '100%',
                          }}
                        >
                          +{cell.schedules.length - 2}개 더보기
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* 감정 입력 모달 */}
        {modal.open && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.18)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 20,
                boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                padding: 36,
                minWidth: 320,
                maxWidth: 420,
                width: '90vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 24, textAlign: 'center' }}>
                {modalDate} 일정 및 감정 기록
              </h3>
              {modalSchedules.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', margin: '32px 0' }}>일정이 없습니다.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {modalSchedules.map((s) => (
                    <div
                      key={s.eventId}
                style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        background: '#f8f8fa',
                        borderRadius: 12,
                        padding: '16px 18px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '1.08rem', marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: '0.98rem', color: '#888' }}>{s.time}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        {emotionList.map((emotion) => (
                  <button
                    key={emotion}
                    style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              border: 'none',
                              background: emotionColors[emotion],
                              opacity: modalEmotions[s.eventId] === emotion ? 1 : 0.3,
                              cursor: 'pointer',
                              transition: 'opacity 0.15s',
                            }}
                            onClick={() => handleEmotionSelect(s.eventId, emotion)}
                            aria-label={emotion}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
                <button
                  style={{
                    minWidth: 90,
                    padding: '10px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: '#f3f3f3',
                    color: '#333',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}
                  onClick={closeModal}
                >
                  닫기
                </button>
                <button
                  style={{
                    minWidth: 90,
                    padding: '10px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: '#7a7bd5',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    cursor: Object.keys(modalEmotions).length === 0 ? 'not-allowed' : 'pointer',
                    opacity: Object.keys(modalEmotions).length === 0 ? 0.5 : 1,
                    transition: 'background 0.18s',
                  }}
                  onClick={handleSaveEmotions}
                  disabled={Object.keys(modalEmotions).length === 0}
                >
                  저장
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage; 

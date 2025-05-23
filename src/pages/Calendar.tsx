import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import EmotionModal from '../components/EmotionModal';
import '../styles/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const emotionColors: { [key: string]: string } = {
  '기쁨': '#FFD700', // 밝은 노란색
  '짜증': '#FF6B6B', // 밝은 빨간색
  '슬픔': '#4A90E2', // 밝은 파란색
  '불안': '#9B59B6', // 보라색
  '화남': '#E74C3C', // 진한 빨간색
  '평온': '#2ECC71', // 초록색
  '피곤': '#95A5A6', // 회색
  '스트레스': '#F39C12', // 주황색
  '걱정': '#8E44AD', // 진한 보라색
  '행복': '#FFD700', // 밝은 노란색
  '짜증남': '#FF6B6B', // 밝은 빨간색
  '우울': '#4A90E2', // 밝은 파란색
  '불안함': '#9B59B6', // 보라색
  '화가남': '#E74C3C', // 진한 빨간색
  '편안함': '#2ECC71', // 초록색
  '지침': '#95A5A6', // 회색
  '스트레스받음': '#F39C12', // 주황색
  '걱정됨': '#8E44AD', // 진한 보라색
};

const emotions = [
  '기쁨', '짜증', '슬픔', '불안', '화남', '평온', '피곤', '스트레스', '걱정',
  '행복', '짜증남', '우울', '불안함', '화가남', '편안함', '지침', '스트레스받음', '걱정됨'
];

const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [emotionData, setEmotionData] = useState<{ [key: string]: string }>({});

  const handleDateClick = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setShowModal(true);
    }
  };

  const handleEmotionSelect = (emotion: string) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    setEmotionData(prev => ({
      ...prev,
      [dateKey]: emotion
    }));
    setShowModal(false);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const dateKey = date.toISOString().split('T')[0];
    const emotion = emotionData[dateKey];
    
    if (emotion) {
      return (
        <div className="emotion-indicator">
          <div 
            className="emotion-circle" 
            style={{ backgroundColor: emotionColors[emotion] || '#95A5A6' }}
          />
          <span className="emotion-label">{emotion}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="calendar-page">
      <nav className="main-nav">
        <div className="main-menu">
          <span style={{cursor:'pointer'}}>채팅</span>
          <span style={{cursor:'pointer'}}>미션</span>
          <span style={{cursor:'pointer'}}>분석</span>
          <span style={{cursor:'pointer'}}>캘린더</span>
          <span style={{cursor:'pointer'}}>심리검사</span>
        </div>
      </nav>
      <h1>감정 캘린더</h1>
      <div className="calendar-container">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName="calendar-tile"
        />
      </div>
      {showModal && (
        <EmotionModal
          onClose={() => setShowModal(false)}
          onSelectEmotion={handleEmotionSelect}
          emotions={emotions}
        />
      )}
    </div>
  );
};

export default CalendarPage; 
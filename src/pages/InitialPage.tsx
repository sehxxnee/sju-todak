import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../InitialPage.css';
import logoImg from '../assets/logo.png';
import todakiImg from '../assets/todaki.png';

const worryCategories = [
  { id: 'depression', label: '우울 / 무기력' },
  { id: 'anxiety', label: '불안 / 긴장' },
  { id: 'relationship', label: '대인관계 / 소통 어려움' },
  { id: 'career', label: '진로 / 미래 불안' },
  { id: 'study', label: '학업 / 성적 스트레스' },
  { id: 'work', label: '직장 / 업무 스트레스' },
  { id: 'family', label: '가족 문제' },
  { id: 'love', label: '연애 / 이별' },
  { id: 'self', label: '자기이해 / 성격 혼란' },
  { id: 'health', label: '생활습관 / 신체 문제' }
];

const chatMessages = [
  {
    sender: '토닥이',
    text: '안녕! 나는 토닥이야.\n너의 마음을 토닥토닥 해 줄게.'
  },
  {
    sender: '토닥이',
    text: '이야기 나누기 전에,\n몇 가지 질문에 대답해 줄래?'
  }
];

const InitialPage: React.FC = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [selectedWorries, setSelectedWorries] = useState<string[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<number>(1);

  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const timer = setTimeout(() => {
        setVisibleMessages(visibleMessages + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  const handleWorrySelect = (category: string) => {
    if (selectedWorries[0] === category) {
      setSelectedWorries([]);
    } else {
      setSelectedWorries([category]);
    }
  };

  const handleNext = () => {
    if (age && gender && selectedWorries.length > 0) {
      navigate('/test', {
        state: {
          age,
          gender,
          selectedWorries
        }
      });
    }
  };

  return (
    <div className="initial-root">
      <nav className="main-nav">
        <img src={logoImg} alt="토닥이 로고" className="main-logo" onClick={() => navigate('/main')} style={{cursor:'pointer'}} />
      </nav>
      <div className="initial-container">
        <div className="chat-section">
          {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
            <div className="chat-message" key={idx}>
              <img src={todakiImg} alt="토닥이" className="todaki-chat-img" />
              <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                <span className="sender" style={{fontWeight:400, fontSize:'0.93rem', marginBottom:2, marginLeft:2}}>{msg.sender}</span>
                <div className={"message-content chat-message-appear"}>
                  <div className="text">{msg.text.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="input-section">
          <div className="input-group">
            <label>너는 몇 살이야?</label>
            <input
              type="number"
              value={age}
              min={1}
              max={100}
              step={1}
              onChange={e => {
                const v = e.target.value;
                if (v === '' || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 100)) {
                  setAge(v.replace(/^0+/, ''));
                }
              }}
              placeholder="나이를 입력해주세요"
            />
          </div>
          <div className="input-group">
            <label>성별은?</label>
            <div className="gender-buttons">
              <button
                className={`gender-btn ${gender === '남자' ? 'selected' : ''}`}
                onClick={() => setGender('남자')}
              >
                남자
              </button>
              <button
                className={`gender-btn ${gender === '여자' ? 'selected' : ''}`}
                onClick={() => setGender('여자')}
              >
                여자
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>주요 고민 유형을 알려줘.</label>
            <div className="worry-categories">
              {worryCategories.map((category) => (
                <button
                  key={category.id}
                  className={`worry-category-btn ${selectedWorries.includes(category.label) ? 'selected' : ''}`}
                  onClick={() => handleWorrySelect(category.label)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <button
            className="submit-btn"
            onClick={handleNext}
            disabled={
              !age ||
              !gender ||
              selectedWorries.length === 0 ||
              isNaN(Number(age)) ||
              Number(age) < 1 ||
              Number(age) > 100 ||
              !Number.isInteger(Number(age))
            }
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialPage; 
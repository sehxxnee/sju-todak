import React, { useRef, useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import defaultProfileImg from '../assets/profile_default.png';

const API_BASE = 'https://test-sso.online';
const API_BASE2 = 'http://localhost:8080';
const ProfilePage: React.FC = () => {
  const [profileImg, setProfileImg] = useState<string>(defaultProfileImg);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 정보 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await fetch(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
        const data = (await res.json()) as { name?: string; age?: number; gender?: string; email?: string; profileImageUrl?: string };
        setName(data.name || '');
        setAge(data.age ? String(data.age) : '');
        setGender(data.gender || ''); // 상태는 'male'/'female'로 유지
        setEmail(data.email || '');
        setProfileImg(data.profileImageUrl || defaultProfileImg);
      } catch {
        alert('사용자 정보를 불러오지 못했습니다.');
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => setEditMode(true);
  // 정보 수정
  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, age: age ? Number(age) : undefined, gender }),
      });
      if (!res.ok) throw new Error('수정에 실패했습니다.');
      setEditMode(false);
      alert('수정이 완료되었습니다.');
    } catch {
      alert('수정에 실패했습니다.');
    }
  };

  const handleProfileImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setProfileImg(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div
      className="profile-root"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#fff' }}
    >
      <NavBar />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: 600,
          margin: '40px auto 0 auto',
        }}
      >
        {/* 프로필 카드만 가운데 정렬 */}
        <div
          className="profile-card"
          style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            padding: 40,
            minWidth: 340,
            maxWidth: 400,
            flex: 1,
            margin: '0 auto',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '1.13rem', marginBottom: 18, textAlign: 'center' }}>프로필</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ position: 'relative', width: 110, height: 110 }}>
              <img
                src={profileImg}
                alt="프로필"
                style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', background: '#e6eefa' }}
              />
              <button
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  background: '#fff',
                  border: '1.5px solid #eee',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                }}
                onClick={() => fileInputRef.current?.click()}
                title="프로필 이미지 변경"
              >
                <span role="img" aria-label="카메라" style={{ fontSize: 20 }}>
                  📷
                </span>
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleProfileImgChange}
              />
            </div>
            <div style={{ marginTop: 16, fontSize: '1.05rem', color: '#444' }}>{email}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ fontWeight: 500, fontSize: '1.05rem', color: '#333' }}>이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editMode}
              style={{
                padding: '10px 12px',
                border: '1.5px solid #eee',
                borderRadius: 8,
                fontSize: '1rem',
                background: editMode ? '#fff' : '#f8f8f8',
              }}
            />
            <label style={{ fontWeight: 500, fontSize: '1.05rem', color: '#333' }}>나이</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              disabled={!editMode}
              style={{
                padding: '10px 12px',
                border: '1.5px solid #eee',
                borderRadius: 8,
                fontSize: '1rem',
                background: editMode ? '#fff' : '#f8f8f8',
              }}
            />
            <label style={{ fontWeight: 500, fontSize: '1.05rem', color: '#333' }}>성별</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={!editMode}
              style={{
                padding: '10px 12px',
                border: '1.5px solid #eee',
                borderRadius: 8,
                fontSize: '1rem',
                background: editMode ? '#fff' : '#f8f8f8',
              }}
            >
              <option value="">선택</option>
              <option value="male">남자</option>
              <option value="female">여자</option>
            </select>
          </div>
          <button
            style={{
              marginTop: 32,
              width: '100%',
              padding: '12px 0',
              background: '#888',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '1.08rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={editMode ? handleComplete : handleEdit}
          >
            {editMode ? '완료' : '수정'}
          </button>
        </div>
      </div>
      {/* 하단 로그아웃 버튼 */}
      <button
        style={{
          margin: '48px auto 0 auto',
          display: 'block',
          background: '#888',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: '1.08rem',
          fontWeight: 500,
          padding: '14px 0',
          width: 320,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
      >
        로그아웃
      </button>
      {/* 스위치 스타일은 CSS에 추가 필요 */}
    </div>
  );
};

export default ProfilePage;

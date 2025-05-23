import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InitialPage from './pages/InitialPage';
import MainPage from './pages/MainPage';
import AnalysisPage from './pages/AnalysisPage';
import GoalsPage from './pages/GoalsPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import TestPage from './pages/TestPage';
import SignupPage from './pages/SignupPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import TestCompletePage from './pages/TestCompletePage';
import ProfessionalSurveyPage from './pages/ProfessionalSurveyPage';
import LoginPage from './pages/LoginPage';
import './App.css';
import { onMessageListener } from './utils/firebase';
import { AlertProvider } from './AlertContext';
function AutoRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('accessToken') && location.pathname === '/') {
      navigate('/main', { replace: true });
    }
  }, [location, navigate]);
  return null;
}

function App() {
  useEffect(() => {
    onMessageListener().then((payload: any) => {
      if (payload?.notification && Notification.permission === 'granted') {
        new Notification(payload.notification.title || '', {
          body: payload.notification.body || '',
          icon: '/assets/notification-icon.png',
        });
      }
    });
  }, []);
  return (
    <AlertProvider>
      <Router>
        <AutoRedirect />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/initial" element={<InitialPage />} />
          <Route path="/login" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/test-complete" element={<TestCompletePage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/professional-survey" element={<ProfessionalSurveyPage />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;

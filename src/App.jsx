import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Library from './pages/Library';
import Stories from './pages/Stories';
import Messages from './pages/Messages';
import Following from './pages/Following';
import Search from './pages/Search';
import Company from './pages/Company';
import Notifications from './pages/Notifications';
import Write from './pages/Write';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-theme');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no auth required */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected: Write page (fullscreen, custom header) */}
        <Route path="/write" element={
          <ProtectedRoute><Write /></ProtectedRoute>
        } />

        {/* Protected: Core App with Sidebar and Header nested inside Layout */}
        <Route element={
          <ProtectedRoute><Layout /></ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/stories/:postId" element={<Stories />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/following" element={<Following />} />
          <Route path="/search" element={<Search />} />
          <Route path="/company" element={<Company />} />
          <Route path="/company/:companyName" element={<Company />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={
            <div style={{ padding: '3rem', fontFamily: 'Inter, sans-serif' }}>
              <h1>404 - Page Not Found</h1>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

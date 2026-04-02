import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const BRANCH_LABELS = {
  cse: 'Computer Science', it: 'Information Technology',
  ece: 'Electronics', me: 'Mechanical', ce: 'Civil',
};

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Derived display values from real auth data
  const displayName = userProfile?.name || currentUser?.displayName || 'User';
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();
  const branch = BRANCH_LABELS[userProfile?.branch] || userProfile?.branch || '';
  const batch = userProfile?.batch || '';
  const linkedin = userProfile?.linkedin || '';
  const degree = userProfile?.degree?.toUpperCase() || '';
  const email = currentUser?.email || '';

  // Fetch this user's published posts
  useEffect(() => {
    if (!currentUser?.uid) return;
    const fetchMyPosts = async () => {
      setPostsLoading(true);
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', currentUser.uid),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setMyPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        // Fallback without where('status') if index isn't ready
        try {
          const q2 = query(collection(db, 'posts'), where('authorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
          const snap2 = await getDocs(q2);
          setMyPosts(snap2.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => p.status === 'published'));
        } catch (e) { console.error(e); }
      } finally {
        setPostsLoading(false);
      }
    };
    fetchMyPosts();
  }, [currentUser]);

  return (
    <div className="profile-layout" style={{ display: 'flex', gap: '2rem', padding: '2.5rem 2rem', alignItems: 'flex-start', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Profile Main Column */}
      <div className="profile-main" style={{ flex: 1, minWidth: 0 }}>

        {/* Cover + Avatar */}
        <div className="profile-card">
          <div className="profile-cover"><div className="cover-gradient"></div></div>
          <div className="profile-identity">
            <div className="avatar-wrapper">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="profile-avatar" />
                : <div className="profile-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '2rem', borderRadius: '50%' }}>{initials}</div>
              }
            </div>
            <div className="profile-actions">
              <button className="btn btn-primary" onClick={() => navigate('/write')}>
                <i className="fa-solid fa-plus"></i> Write Post
              </button>
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">
              {displayName}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" className="profile-linkedin-icon" title="LinkedIn Profile">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              )}
            </h1>
            <p className="profile-headline">
              {degree && `${degree}`}{branch && ` · ${branch}`}{batch && ` · Class of ${batch}`}
            </p>
            <div className="profile-meta-row">
              {branch && <span className="profile-meta-item"><i className="fa-solid fa-graduation-cap"></i> {branch}{batch && ` · Class of ${batch}`}</span>}
              <span className="profile-meta-item"><i className="fa-regular fa-envelope"></i> {email}</span>
            </div>
            <div className="profile-stats">
              <div className="stat-item"><span className="stat-number">{myPosts.length}</span><span className="stat-label">Posts</span></div>
              <div className="stat-divider"></div>
              <div className="stat-item"><span className="stat-number">0</span><span className="stat-label">Followers</span></div>
              <div className="stat-divider"></div>
              <div className="stat-item"><span className="stat-number">0</span><span className="stat-label">Following</span></div>
              <div className="stat-divider"></div>
              <div className="stat-item"><span className="stat-number">0</span><span className="stat-label">Reactions</span></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-section-card">
          <div className="profile-tabs">
            <button className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
            <button className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            <div className="tab-content active">
              {postsLoading && [1, 2].map(n => (
                <div key={n} className="post-card" style={{ pointerEvents: 'none' }}>
                  <div className="post-content">
                    <div style={{ height: 16, width: '60%', borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.5rem' }} />
                    <div style={{ height: 12, width: '85%', borderRadius: 6, background: 'var(--hover-bg)' }} />
                  </div>
                </div>
              ))}

              {!postsLoading && myPosts.length === 0 && (
                <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                  <i className="fa-regular fa-newspaper" style={{ fontSize: '2.5rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
                  <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>You haven't published any posts yet.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/write')}>
                    <i className="fa-solid fa-plus"></i> Write your first post
                  </button>
                </div>
              )}

              {!postsLoading && myPosts.map((post) => (
                <article key={post.id} className="post-card" onClick={() => navigate(`/stories/${post.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="post-content">
                    <div className="post-meta">
                      {avatarUrl
                        ? <img src={avatarUrl} alt={displayName} className="author-avatar" />
                        : <div className="author-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', borderRadius: '50%', width: 32, height: 32 }}>{initials}</div>
                      }
                      <span className="author-name">{displayName}</span>
                      <span className="meta-dot">&middot;</span>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-preview">{post.excerpt || ''}</p>
                    <div className="post-footer">
                      <div className="tags">
                        {post.company && <span className="tag">#{post.company}</span>}
                        {post.role && <span className="tag">#{post.role.replace(/\s+/g, '')}</span>}
                      </div>
                      <div className="post-actions">
                        <button className="action-btn" onClick={(e) => e.stopPropagation()}><i className="fa-solid fa-ellipsis"></i></button>
                      </div>
                    </div>
                  </div>
                  <div className="post-company-logo">
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                      {(post.company || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="tab-content active">
              <div className="about-section">
                {degree && branch && <div className="about-row"><i className="fa-solid fa-graduation-cap"></i><span>{degree} in <strong>{BRANCH_LABELS[userProfile?.branch] || branch}</strong>{batch && ` — Class of ${batch}`}</span></div>}
                {email && <div className="about-row"><i className="fa-regular fa-envelope"></i><span>{email}</span></div>}
                {linkedin && <div className="about-row"><i className="fa-brands fa-linkedin"></i><span><a href={linkedin} target="_blank" rel="noreferrer" className="about-link">{linkedin}</a></span></div>}
                {userProfile?.enrollment && <div className="about-row"><i className="fa-regular fa-id-badge"></i><span>Enrollment: <strong>{userProfile.enrollment}</strong></span></div>}
                {!branch && !email && <p style={{ color: 'var(--text-light)', padding: '1rem 0' }}>No profile details yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="profile-sidebar" style={{ width: '300px', flexShrink: 0, position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="sidebar-widget">
          <h4 className="widget-title">Profile Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            <div><i className="fa-solid fa-file-lines" style={{ width: 20, color: 'var(--primary-color)' }}></i> {myPosts.length} post{myPosts.length !== 1 ? 's' : ''} published</div>
            {batch && <div><i className="fa-solid fa-calendar" style={{ width: 20, color: 'var(--primary-color)' }}></i> Batch of {batch}</div>}
            {branch && <div><i className="fa-solid fa-code-branch" style={{ width: 20, color: 'var(--primary-color)' }}></i> {BRANCH_LABELS[userProfile?.branch] || branch}</div>}
          </div>
        </div>
        <div className="sidebar-widget">
          <h4 className="widget-title">Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/write')}>
              <i className="fa-solid fa-plus"></i> Write New Post
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
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
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile: currentUserProfile } = useAuth();
  
  const targetUid = userId || currentUser?.uid;
  const isOwnProfile = !userId || userId === currentUser?.uid;

  const [activeTab, setActiveTab] = useState('posts');
  const [profileUser, setProfileUser] = useState(null);
  
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // 1. Fetch User Profile Data
  useEffect(() => {
    if (!targetUid) return;
    const fetchUser = async () => {
      if (isOwnProfile && currentUserProfile) {
        setProfileUser({ uid: targetUid, email: currentUser.email, ...currentUserProfile });
      } else {
        try {
          const snap = await getDoc(doc(db, 'users', targetUid));
          if (snap.exists()) {
            setProfileUser({ uid: snap.id, ...snap.data() });
          } else {
            console.error('User not found');
          }
        } catch (err) { console.error(err); }
      }
    };
    fetchUser();
  }, [targetUid, isOwnProfile, currentUserProfile, currentUser]);

  // 2. Fetch User's Posts
  useEffect(() => {
    if (!targetUid) return;
    const fetchPosts = async () => {
      setPostsLoading(true);
      try {
        const q = query(
          collection(db, 'posts'),
          where('authorId', '==', targetUid),
          where('status', '==', 'published'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setMyPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        try {
          const q2 = query(collection(db, 'posts'), where('authorId', '==', targetUid), orderBy('createdAt', 'desc'));
          const snap2 = await getDocs(q2);
          setMyPosts(snap2.docs.map((d) => ({ id: d.id, ...d.data() })).filter(p => p.status === 'published'));
        } catch (e) { console.error(e); }
      } finally {
        setPostsLoading(false);
      }
    };
    fetchPosts();
  }, [targetUid]);

  // 3. Fetch Follow State and Counts
  useEffect(() => {
    if (!targetUid) return;
    const fetchFollowData = async () => {
      // Check if current user is following this profile (if it's not their own)
      if (currentUser && !isOwnProfile) {
        const fSnap = await getDoc(doc(db, 'users', currentUser.uid, 'following', targetUid));
        setIsFollowing(fSnap.exists());
      }
      
      // Calculate Follower/Following counts
      try {
        const followersSnap = await getDocs(collection(db, 'users', targetUid, 'followers'));
        setFollowerCount(followersSnap.size);
        
        const followingSnap = await getDocs(collection(db, 'users', targetUid, 'following'));
        setFollowingCount(followingSnap.size);
      } catch (err) { console.error(err); }
    };
    fetchFollowData();
  }, [targetUid, currentUser, isOwnProfile]);

  // Follow/Unfollow Handler
  const handleFollowToggle = async () => {
    if (!currentUser) return alert('Please login to follow users');
    if (isOwnProfile) return;

    const followingRef = doc(db, 'users', currentUser.uid, 'following', targetUid);
    const followerRef = doc(db, 'users', targetUid, 'followers', currentUser.uid);

    try {
      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await setDoc(followingRef, { followedAt: new Date() });
        await setDoc(followerRef, { followedAt: new Date() });
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (err) { console.error('Failed to toggle follow:', err); }
  };

  if (!profileUser) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>Loading Profile...</div>;

  const displayName = profileUser.name || 'User';
  const avatarUrl = profileUser.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();
  const branch = BRANCH_LABELS[profileUser.branch] || profileUser.branch || '';
  const batch = profileUser.batch || '';
  const linkedin = profileUser.linkedin || '';
  const degree = profileUser.degree?.toUpperCase() || '';
  const email = profileUser.email || '';

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
              {isOwnProfile ? (
                 <button className="btn" style={{ border: '1px solid var(--border-color)', background: 'var(--surface-color)' }} onClick={() => alert('Settings page coming soon!')}>
                   <i className="fa-solid fa-pen"></i> Edit Profile
                 </button>
              ) : (
                <button 
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Following' : <><i className="fa-solid fa-user-plus"></i> Follow</>}
                </button>
              )}
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
              {!isOwnProfile && <span className="profile-meta-item"><i className="fa-regular fa-envelope"></i> Reach out to connect</span>}
              {isOwnProfile && email && <span className="profile-meta-item"><i className="fa-regular fa-envelope"></i> {email}</span>}
            </div>
            
            <div className="profile-stats">
              <div className="stat-item"><span className="stat-number">{myPosts.length}</span><span className="stat-label">Posts</span></div>
              <div className="stat-divider"></div>
              <div className="stat-item"><span className="stat-number">{followerCount}</span><span className="stat-label">Followers</span></div>
              <div className="stat-divider"></div>
              <div className="stat-item"><span className="stat-number">{followingCount}</span><span className="stat-label">Following</span></div>
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
                  <p style={{ color: 'var(--text-light)', marginBottom: '1rem' }}>
                    {isOwnProfile ? "You haven't published any posts yet." : "This user hasn't published any posts yet."}
                  </p>
                  {isOwnProfile && (
                    <button className="btn btn-primary" onClick={() => navigate('/write')}>
                      <i className="fa-solid fa-plus"></i> Write your first post
                    </button>
                  )}
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
                {degree && branch && <div className="about-row"><i className="fa-solid fa-graduation-cap"></i><span>{degree} in <strong>{BRANCH_LABELS[profileUser.branch] || branch}</strong>{batch && ` — Class of ${batch}`}</span></div>}
                {email && isOwnProfile && <div className="about-row"><i className="fa-regular fa-envelope"></i><span>{email}</span></div>}
                {linkedin && <div className="about-row"><i className="fa-brands fa-linkedin"></i><span><a href={linkedin} target="_blank" rel="noreferrer" className="about-link">{linkedin}</a></span></div>}
                {profileUser.enrollment && isOwnProfile && <div className="about-row"><i className="fa-regular fa-id-badge"></i><span>Enrollment: <strong>{profileUser.enrollment}</strong></span></div>}
                {!branch && !linkedin && <p style={{ color: 'var(--text-light)', padding: '1rem 0' }}>No profile details provided.</p>}
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
            {branch && <div><i className="fa-solid fa-code-branch" style={{ width: 20, color: 'var(--primary-color)' }}></i> {BRANCH_LABELS[profileUser.branch] || branch}</div>}
          </div>
        </div>
        
        {isOwnProfile && (
          <div className="sidebar-widget">
            <h4 className="widget-title">Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
               <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/write')}>
                 <i className="fa-solid fa-plus"></i> Write New Post
               </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default Profile;

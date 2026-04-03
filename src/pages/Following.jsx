import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/following.css';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const COMPANY_LOGOS = {
  google:    'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  meta:      'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  apple:     'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
};
const getCompanyLogo = (company = '') => {
  const key = company.toLowerCase().trim();
  return COMPANY_LOGOS[key] || null;
};

// Simple skeleton loader
const SkeletonCard = () => (
  <article className="post-card" style={{ pointerEvents: 'none' }}>
    <div className="post-content">
      <div className="post-meta" style={{ gap: '0.5rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--hover-bg)' }} />
        <div style={{ width: 80, height: 12, borderRadius: 6, background: 'var(--hover-bg)' }} />
      </div>
      <div style={{ height: 18, width: '70%', borderRadius: 6, background: 'var(--hover-bg)', margin: '0.6rem 0 0.4rem' }} />
      <div style={{ height: 12, width: '90%', borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.3rem' }} />
      <div style={{ height: 12, width: '75%', borderRadius: 6, background: 'var(--hover-bg)' }} />
    </div>
  </article>
);

const Following = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('Latest');
  const [posts, setPosts] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  // In a real app we'd fetch actual followed user IDs. 
  // For now, we mock fetching following state and grab the newest posts.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch bookmarked IDs to sync bookmark heart state
        if (currentUser) {
          const bmSnap = await getDocs(collection(db, 'users', currentUser.uid, 'bookmarks'));
          const bmSet = new Set(bmSnap.docs.map(d => d.id));
          setBookmarkedIds(bmSet);
        }

        // Fetch recent posts
        let q;
        try {
          q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(30));
        } catch(e) {
          q = query(collection(db, 'posts'), limit(30));
        }
        
        const snap = await getDocs(q);
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.status === 'published');
          
        setPosts(data);
        
        // Extract unique authors safely as "Who to follow"
        const uniqueAuthorsMap = new Map();
        data.forEach(p => {
          if (p.authorId && p.authorName && !uniqueAuthorsMap.has(p.authorId) && p.authorId !== currentUser?.uid) {
            uniqueAuthorsMap.set(p.authorId, {
              id: p.authorId,
              name: p.authorName,
              avatar: p.authorAvatar,
              company: p.company || 'Tech'
            });
          }
        });
        setFollowingUsers(Array.from(uniqueAuthorsMap.values()).slice(0, 5));

      } catch (err) {
        console.error('Failed to fetch following data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, activeTab]);

  const toggleBookmark = async (e, post) => {
    e.stopPropagation();
    if (!currentUser) return;
    const bmRef = doc(db, 'users', currentUser.uid, 'bookmarks', post.id);
    if (bookmarkedIds.has(post.id)) {
      await deleteDoc(bmRef);
      setBookmarkedIds((prev) => { const s = new Set(prev); s.delete(post.id); return s; });
    } else {
      await setDoc(bmRef, {
        title: post.title, company: post.company, role: post.role,
        authorName: post.authorName, authorAvatar: post.authorAvatar || null,
        excerpt: post.excerpt || '', savedAt: serverTimestamp(),
      });
      setBookmarkedIds((prev) => new Set([...prev, post.id]));
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      {/* Following Feed Section */}
      <div className="following-layout">
        <div className="following-main">
          <div className="following-header">
            <div>
              <h1>Following Feed</h1>
              <p className="following-subtitle">Latest posts from people you follow</p>
            </div>
          </div>

          <div className="feed-tabs-bar">
            <button className={`feed-tab-btn ${activeTab === 'Latest' ? 'active' : ''}`} onClick={() => setActiveTab('Latest')}>Latest</button>
            <button className={`feed-tab-btn ${activeTab === 'Most Reacted' ? 'active' : ''}`} onClick={() => setActiveTab('Most Reacted')}>Most Reacted</button>
          </div>

          <div className="following-posts">
            {loading && [1, 2, 3].map(n => <SkeletonCard key={n} />)}

            {!loading && posts.length === 0 && (
               <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-light)' }}>
                 <i className="fa-solid fa-user-group" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}></i>
                 <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Your following feed is empty</h3>
                 <p>Follow more people to see their posts here!</p>
               </div>
            )}

            {!loading && posts.map(post => {
              const logo = getCompanyLogo(post.company);
              const tags = Array.isArray(post.tags) ? post.tags : [];

              return (
                <article key={post.id} className="post-card" onClick={() => navigate(`/stories/${post.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="post-content">
                    <div className="post-meta">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
                      ) : (
                        <div className="author-avatar" style={{
                          background: 'var(--primary-color)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.85rem', borderRadius: '50%',
                          width: 32, height: 32, flexShrink: 0
                        }}>
                          {(post.authorName || 'A').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="author-name">{post.authorName || 'Anonymous'}</span>
                      <span className="following-tag" style={{ marginLeft: '0.5rem', fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', padding: '0.15rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>Following</span>
                      <span className="meta-dot">&middot;</span>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <h3 className="post-title">{post.title}</h3>
                    <p className="post-preview">{post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 180)}…</p>
                    
                    <div className="post-footer">
                      <div className="tags">
                        {post.company && <span className="tag">#{post.company}</span>}
                        {tags.slice(0, 2).map((t) => <span key={t} className="tag">#{t}</span>)}
                      </div>
                      <div className="post-actions">
                        <button className="action-btn" onClick={(e) => toggleBookmark(e, post)}>
                          <i className={bookmarkedIds.has(post.id) ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                             style={bookmarkedIds.has(post.id) ? { color: 'var(--primary-color)' } : {}}
                          ></i>
                        </button>
                        <button className="action-btn" onClick={(e) => e.stopPropagation()}><i className="fa-solid fa-ellipsis"></i></button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="post-company-logo">
                    {logo ? (
                      <img src={logo} alt={post.company} />
                    ) : (
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                        {(post.company || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="following-sidebar">
          <div className="following-widget">
            <h4 className="widget-title">Who to Follow</h4>
            <div className="suggested-follow-list">
              {!loading && followingUsers.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No suggestions right now.</p>}
              {followingUsers.map((u, i) => (
                <div key={i} className="suggest-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  {u.avatar ? (
                    <img src={u.avatar} className="suggest-avatar" alt={u.name} style={{ width: 40, height: 40, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="suggest-info" style={{ flex: 1, overflow: 'hidden' }}>
                    <span className="suggest-name" style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{u.name}</span>
                    <span className="suggest-desc" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)' }}>{u.company}</span>
                  </div>
                  <button className="btn-follow-sm" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderRadius: '20px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', fontWeight: 600 }}>Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="following-widget">
            <h4 className="widget-title">People you follow</h4>
            <div className="following-list-small">
              {followingUsers.slice(0, 3).map((u, i) => (
                <div key={i} className="following-chip" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {u.avatar ? (
                    <img src={u.avatar} className="chip-avatar" alt={u.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Following;

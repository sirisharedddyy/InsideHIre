import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, where, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

// Helper: format Firestore timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Map known companies to logo URLs
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

// Skeleton card shown while loading
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

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Latest');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());

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

  const toggleFollow = async (e, authorId) => {
    e.stopPropagation();
    if (!currentUser || currentUser.uid === authorId) return;
    const followingRef = doc(db, 'users', currentUser.uid, 'following', authorId);
    const followerRef = doc(db, 'users', authorId, 'followers', currentUser.uid);

    try {
      if (followingIds.has(authorId)) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setFollowingIds((prev) => { const s = new Set(prev); s.delete(authorId); return s; });
      } else {
        await setDoc(followingRef, { followedAt: serverTimestamp() });
        await setDoc(followerRef, { followedAt: serverTimestamp() });
        setFollowingIds((prev) => new Set([...prev, authorId]));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };


  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          const followSnap = await getDocs(collection(db, 'users', currentUser.uid, 'following'));
          setFollowingIds(new Set(followSnap.docs.map(d => d.id)));
        }

        let snap;
        try {
          // Preferred query: requires composite index (status + createdAt)
          const q = query(
            collection(db, 'posts'),
            where('status', '==', 'published'),
            orderBy('createdAt', 'desc'),
            limit(20)
          );
          snap = await getDocs(q);
        } catch (indexErr) {
          // Fallback: index may be building — fetch all and filter in memory
          console.warn('Composite index not ready, using fallback query:', indexErr.message);
          const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(20));
          snap = await getDocs(q);
        }
        const data = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => p.status === 'published');
        setPosts(data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      {/* Feed Section */}
      <div className="feed-container">
        <div className="feed-header">
          <h2>For You</h2>
          <div className="feed-tabs">
            {['Latest', 'Top', 'Companies'].map((tab) => (
              <span
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </span>
            ))}
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && [1, 2, 3].map((n) => <SkeletonCard key={n} />)}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: 'var(--text-light)',
          }}>
            <i className="fa-regular fa-newspaper" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.4 }}></i>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No posts yet</h3>
            <p style={{ marginBottom: '1.5rem' }}>Be the first to share your interview experience!</p>
            <button className="btn btn-primary" onClick={() => navigate('/write')}>
              <i className="fa-solid fa-plus"></i> Write a Post
            </button>
          </div>
        )}

        {/* Real post cards */}
        {!loading && posts.map((post) => {
          const logo = getCompanyLogo(post.company);
          const tags = Array.isArray(post.tags) ? post.tags : [];

          return (
            <article
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/stories/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="post-content">
                <div className="post-meta" style={{ alignItems: 'center' }}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${post.authorId}`); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
                    ) : (
                      <div className="author-avatar" style={{
                        background: 'var(--primary-color)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', borderRadius: '50%',
                        width: 32, height: 32, flexShrink: 0,
                      }}>
                        {(post.authorName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="author-name" style={{ fontWeight: 600 }}>{post.authorName || 'Anonymous'}</span>
                  </div>

                  {/* Inline Follow Button */}
                  {currentUser?.uid !== post.authorId && !followingIds.has(post.authorId) && (
                    <button 
                      onClick={(e) => toggleFollow(e, post.authorId)}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--primary-color)',
                        fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer', padding: '0 0.2rem'
                      }}
                    >
                      Follow
                    </button>
                  )}
                  {followingIds.has(post.authorId) && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', background: 'var(--hover-bg)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>Following</span>
                  )}

                  <span className="meta-dot">&middot;</span>
                  <span className="post-date">{formatDate(post.createdAt)}</span>
                  {post.category && (
                    <>
                      <span className="meta-dot">&middot;</span>
                      <span className="read-time">{post.category}</span>
                    </>
                  )}
                </div>

                <h3 className="post-title">{post.title}</h3>
                <p className="post-preview">{post.excerpt || post.content?.replace(/<[^>]+>/g, '').slice(0, 180)}…</p>

                <div className="post-footer">
                  <div className="tags">
                    {post.company && <span className="tag">#{post.company}</span>}
                    {post.role && <span className="tag">#{post.role.replace(/\s+/g, '')}</span>}
                    {tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="post-actions">
                    <button className="action-btn" onClick={(e) => toggleBookmark(e, post)}>
                      <i className={bookmarkedIds.has(post.id) ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'}
                        style={bookmarkedIds.has(post.id) ? { color: 'var(--primary-color)' } : {}}
                      ></i>
                    </button>
                    <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                      <i className="fa-solid fa-ellipsis"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Company logo or icon */}
              <div className="post-company-logo">
                {logo ? (
                  <img src={logo} alt={post.company} />
                ) : (
                  <span style={{
                    fontSize: '1.4rem', fontWeight: 800,
                    color: 'var(--primary-color)', letterSpacing: '-1px',
                  }}>
                    {(post.company || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Right Sidebar */}
      <aside className="right-sidebar" style={{ height: 'calc(100vh - 72px)', top: '72px' }}>
        <div className="widget">
          <h4 className="widget-title">Trending Companies</h4>
          <ul className="trending-list">
            <li><i className="fa-solid fa-arrow-trend-up"></i> Google <span className="trend-count">1.2k posts</span></li>
            <li><i className="fa-solid fa-arrow-trend-up"></i> Meta <span className="trend-count">850 posts</span></li>
            <li><i className="fa-solid fa-arrow-trend-up"></i> Amazon <span className="trend-count">640 posts</span></li>
            <li><i className="fa-solid fa-arrow-trend-up"></i> Apple <span className="trend-count">420 posts</span></li>
          </ul>
        </div>
        <div className="widget">
          <h4 className="widget-title">Recommended Topics</h4>
          <div className="topic-tags">
            <span className="tag">System Design</span>
            <span className="tag">LeetCode Hard</span>
            <span className="tag">Behavioral</span>
            <span className="tag">Negotiation</span>
            <span className="tag">Frontend</span>
            <span className="tag">Backend</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Home;

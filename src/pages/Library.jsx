import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/library.css';

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const COMPANY_LOGOS = {
  google: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
};

const Library = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);   // {postId, postData, savedAt}
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch bookmarks from Firestore subcollection: users/{uid}/bookmarks/{postId}
  useEffect(() => {
    if (!currentUser?.uid) return;
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users', currentUser.uid, 'bookmarks'),
          orderBy('savedAt', 'desc')
        );
        const snap = await getDocs(q);
        setBookmarks(snap.docs.map((d) => ({ bookmarkId: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, [currentUser]);

  const handleRemoveBookmark = async (e, postId) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'bookmarks', postId));
      setBookmarks((prev) => prev.filter((b) => b.bookmarkId !== postId));
    } catch (err) {
      console.error('Remove bookmark error:', err);
    }
  };

  // Filter by company
  const companies = [...new Set(bookmarks.map((b) => b.company).filter(Boolean))];
  const displayed = activeFilter === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.company?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="library-layout">
        <div className="library-main">
          <div className="library-header">
            <div>
              <h1>Your Library</h1>
              <p className="library-subtitle">Bookmarked stories and reading lists</p>
            </div>
            <div className="library-header-actions">
              <button
                className={`lib-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >All</button>
              {companies.map((c) => (
                <button
                  key={c}
                  className={`lib-filter-btn ${activeFilter === c ? 'active' : ''}`}
                  onClick={() => setActiveFilter(c)}
                >{c}</button>
              ))}
            </div>
          </div>

          <div className="saved-posts-list">
            {/* Loading */}
            {loading && [1, 2].map((n) => (
              <div key={n} className="saved-post-card" style={{ pointerEvents: 'none' }}>
                <div className="saved-post-left">
                  <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.5rem' }} />
                  <div style={{ height: 12, width: '80%', borderRadius: 6, background: 'var(--hover-bg)' }} />
                </div>
              </div>
            ))}

            {/* Empty state */}
            {!loading && displayed.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
                <i className="fa-regular fa-bookmark" style={{ fontSize: '3rem', opacity: 0.3, display: 'block', marginBottom: '1rem' }}></i>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No saved posts yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Click the bookmark icon on any post to save it here.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Posts</button>
              </div>
            )}

            {/* Bookmark cards */}
            {!loading && displayed.map((b) => {
              const logo = COMPANY_LOGOS[(b.company || '').toLowerCase()];
              return (
                <article
                  key={b.bookmarkId}
                  className="saved-post-card"
                  onClick={() => navigate(`/stories/${b.bookmarkId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="saved-post-left">
                    <div className="post-meta">
                      {b.authorAvatar
                        ? <img src={b.authorAvatar} alt={b.authorName} className="author-avatar" />
                        : <div className="author-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 32, height: 32 }}>{(b.authorName || 'A').charAt(0)}</div>
                      }
                      <span className="author-name">{b.authorName || 'Anonymous'}</span>
                      <span className="meta-dot">&middot;</span>
                      <span className="post-date">{formatDate(b.savedAt)}</span>
                    </div>
                    <h3 className="post-title">{b.title}</h3>
                    <p className="post-preview">{b.excerpt || ''}</p>
                    <div className="saved-post-footer">
                      <div className="tags">
                        {b.company && <span className="tag">#{b.company}</span>}
                        {b.role && <span className="tag">#{b.role.replace(/\s+/g, '')}</span>}
                      </div>
                      <div className="saved-post-actions">
                        <button
                          className="action-btn saved-btn"
                          title="Remove from Library"
                          onClick={(e) => handleRemoveBookmark(e, b.bookmarkId)}
                        >
                          <i className="fa-solid fa-bookmark"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="post-company-logo">
                    {logo
                      ? <img src={logo} alt={b.company} />
                      : <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)' }}>{(b.company || '?').charAt(0).toUpperCase()}</span>
                    }
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="library-sidebar">
          <div className="lib-sidebar-widget">
            <div className="lib-widget-header">
              <h4>Saved</h4>
            </div>
            <div className="reading-lists">
              <div className="reading-list-item active-list">
                <div className="reading-list-icon"><i className="fa-solid fa-bookmark"></i></div>
                <div className="reading-list-info">
                  <span className="list-name">All Saved</span>
                  <span className="list-count">{bookmarks.length} {bookmarks.length === 1 ? 'story' : 'stories'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="lib-sidebar-widget">
            <h4 className="lib-widget-simple-title">Reading Progress</h4>
            <div className="progress-stat">
              <span className="progress-label">Saved this session</span>
              <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${Math.min(bookmarks.length * 20, 100)}%` }}></div></div>
              <span className="progress-value">{bookmarks.length} posts</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Library;

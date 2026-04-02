import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import './search.css';

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Highlight matching term in text
const highlight = (text = '', term = '') => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch all published posts once
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((p) => p.status === 'published');
        setAllPosts(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter + search in memory
  const applySearch = useCallback(() => {
    let results = [...allPosts];
    const term = searchTerm.toLowerCase().trim();

    if (term) {
      results = results.filter((p) =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.company || '').toLowerCase().includes(term) ||
        (p.role || '').toLowerCase().includes(term) ||
        (p.authorName || '').toLowerCase().includes(term) ||
        (Array.isArray(p.tags) ? p.tags.join(' ') : '').toLowerCase().includes(term) ||
        (p.excerpt || '').toLowerCase().includes(term)
      );
    }

    if (sortBy === 'newest') results.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    setFiltered(results);
  }, [searchTerm, allPosts, sortBy, activeFilter]);

  useEffect(() => { applySearch(); }, [applySearch]);

  const filterPills = [
    { key: 'all', label: 'All', icon: 'fa-layer-group' },
    { key: 'posts', label: 'Posts', icon: 'fa-newspaper' },
  ];

  const displayPosts = activeFilter === 'people' ? [] : filtered;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="search-layout">
        <div className="search-main">

          {/* Live Search Bar */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ position: 'relative' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}></i>
              <input
                id="search-input"
                type="text"
                placeholder="Search by company, role, tag, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem',
                  border: '1.5px solid var(--border-color)', borderRadius: '12px',
                  background: 'var(--surface-color)', color: 'var(--text-main)',
                  fontSize: '0.95rem', fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Result count + sort */}
          <div className="search-meta">
            <p className="result-count">
              <span>{loading ? '…' : displayPosts.length}</span> result{displayPosts.length !== 1 ? 's' : ''}
              {searchTerm && <> for <strong>"{searchTerm}"</strong></>}
            </p>
            <div className="sort-control">
              <label>Sort:</label>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>

          {/* Filter pills */}
          <div className="search-filter-row">
            {filterPills.map((f) => (
              <button
                key={f.key}
                className={`search-filter-pill ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                <i className={`fa-solid ${f.icon}`}></i> {f.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="results-section">
            <h2 className="results-section-title">Posts</h2>

            {loading && [1, 2, 3].map((n) => (
              <div key={n} className="post-card" style={{ pointerEvents: 'none' }}>
                <div className="post-content">
                  <div style={{ height: 14, width: '60%', borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.5rem' }} />
                  <div style={{ height: 12, width: '80%', borderRadius: 6, background: 'var(--hover-bg)' }} />
                </div>
              </div>
            ))}

            {!loading && displayPosts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                <i className="fa-regular fa-face-sad-tear" style={{ fontSize: '2.5rem', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
                <p>No posts found{searchTerm ? ` for "${searchTerm}"` : ''}. Try a different search term.</p>
              </div>
            )}

            {!loading && displayPosts.map((post) => (
              <article
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/stories/${post.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="post-content">
                  <div className="post-meta">
                    {post.authorAvatar
                      ? <img src={post.authorAvatar} alt={post.authorName} className="author-avatar" />
                      : <div className="author-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 32, height: 32 }}>{(post.authorName || 'A').charAt(0)}</div>
                    }
                    <span className="author-name">{post.authorName || 'Anonymous'}</span>
                    <span className="meta-dot">&middot;</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                  </div>
                  <h3
                    className="post-title"
                    dangerouslySetInnerHTML={{ __html: highlight(post.title, searchTerm) }}
                  />
                  <p
                    className="post-preview"
                    dangerouslySetInnerHTML={{ __html: highlight(post.excerpt || '', searchTerm) }}
                  />
                  <div className="post-footer">
                    <div className="tags">
                      {post.company && <span className="tag">#{post.company}</span>}
                      {post.role && <span className="tag">#{post.role.replace(/\s+/g, '')}</span>}
                      {Array.isArray(post.tags) && post.tags.slice(0, 2).map((t) => <span key={t} className="tag">#{t}</span>)}
                    </div>
                    <div className="post-actions">
                      <button className="action-btn" onClick={(e) => e.stopPropagation()}><i className="fa-regular fa-bookmark"></i></button>
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
        </div>

        {/* Sidebar filters */}
        <aside className="search-sidebar">
          <div className="search-widget">
            <h4 className="search-widget-title">Filter by Company</h4>
            <div className="filter-options">
              {['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'].map((c) => {
                const count = allPosts.filter((p) => p.company?.toLowerCase() === c.toLowerCase()).length;
                return (
                  <label key={c} className="filter-check" style={{ cursor: 'pointer' }} onClick={() => setSearchTerm(searchTerm === c ? '' : c)}>
                    <input type="checkbox" readOnly checked={searchTerm.toLowerCase() === c.toLowerCase()} /> {c} <span className="filter-count">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="search-widget">
            <h4 className="search-widget-title">Outcome</h4>
            <div className="filter-options">
              <label className="filter-check"><input type="checkbox" /> Selected Only</label>
              <label className="filter-check"><input type="checkbox" /> Not Selected</label>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Search;

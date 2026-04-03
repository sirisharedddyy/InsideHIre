import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/search.css';

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Highlight matching term in text safely
const highlight = (text = '', term = '') => {
  if (!term.trim()) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const Search = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  const [activeCompanies, setActiveCompanies] = useState(new Set());
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

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
        
        // Load bookmarks
        if (currentUser) {
          const bmSnap = await getDocs(collection(db, 'users', currentUser.uid, 'bookmarks'));
          setBookmarkedIds(new Set(bmSnap.docs.map(d => d.id)));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentUser]);

  // Derived filter options
  const companyOptions = Array.from(new Set(allPosts.map(p => p.company).filter(Boolean)));
  const categoryOptions = Array.from(new Set(allPosts.map(p => p.category).filter(Boolean)));

  // Filter + search in memory
  const applyFilters = useCallback(() => {
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

    if (activeCompanies.size > 0) {
      results = results.filter(p => p.company && activeCompanies.has(p.company));
    }
    
    if (activeCategories.size > 0) {
      results = results.filter(p => p.category && activeCategories.has(p.category));
    }

    if (sortBy === 'newest') results.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
    setFiltered(results);
  }, [searchTerm, allPosts, sortBy, activeCompanies, activeCategories]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  // Handle toggles
  const toggleSet = (set, val, setFn) => {
    setFn(prev => {
      const newSet = new Set(prev);
      if (newSet.has(val)) newSet.delete(val);
      else newSet.add(val);
      return newSet;
    });
  };

  const toggleBookmark = async (e, post) => {
    e.stopPropagation();
    if (!currentUser) return alert('Please login to bookmark');
    const bmRef = doc(db, 'users', currentUser.uid, 'bookmarks', post.id);
    if (bookmarkedIds.has(post.id)) {
      await deleteDoc(bmRef);
      setBookmarkedIds(prev => { const s = new Set(prev); s.delete(post.id); return s; });
    } else {
      await setDoc(bmRef, {
        title: post.title, company: post.company, role: post.role,
        authorName: post.authorName, authorAvatar: post.authorAvatar || null,
        excerpt: post.excerpt || '', savedAt: serverTimestamp(),
      });
      setBookmarkedIds(prev => new Set([...prev, post.id]));
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, background: 'var(--bg-color)', minHeight: '100vh' }}>
      <div className="search-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', gap: '2rem', width: '100%' }}>
        
        {/* Main Center Area */}
        <div className="search-main" style={{ flex: 1 }}>
          <h1 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '2.2rem', color: 'var(--text-main)' }}>Explore Experiences</h1>
          
          {/* Glassmorphic Live Search Bar */}
          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
            <input
              type="text"
              placeholder="Search by company, role, topic, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                border: '1px solid var(--border-color)', borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.6)', 
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                color: 'var(--text-main)', fontSize: '1.1rem', fontFamily: 'inherit',
                boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => { e.target.style.background = 'var(--surface-color)'; e.target.style.borderColor = 'var(--primary-color)'; e.target.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.1)' }}
              onBlur={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.6)'; e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.04)' }}
            />
          </div>

          <div className="search-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <p className="result-count" style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-main)' }}>{loading ? '…' : filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
              {searchTerm && <> for <span style={{ color: 'var(--primary-color)' }}>"{searchTerm}"</span></>}
            </p>
            <div className="sort-control">
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option value="newest">Newest First</option>
                <option value="relevant">Most Relevant</option>
              </select>
            </div>
          </div>

          <div className="results-section">
            {loading && [1, 2, 3].map((n) => (
              <div key={n} style={{ height: 160, borderRadius: 16, background: 'var(--hover-bg)', marginBottom: '1rem' }} />
            ))}

            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-light)', background: 'var(--surface-color)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                <i className="fa-regular fa-face-sad-tear" style={{ fontSize: '3rem', opacity: 0.4, display: 'block', marginBottom: '1rem' }}></i>
                <h3>No exact matches found</h3>
                <p>Try adjusting your filters or searching for something else.</p>
              </div>
            )}

            {!loading && filtered.map((post) => (
              <article
                key={post.id}
                className="post-card"
                onClick={() => navigate(`/stories/${post.id}`)}
                style={{ cursor: 'pointer', marginBottom: '1rem', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '16px', background: 'var(--surface-color)', transition: 'all 0.2s ease', position: 'relative' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                      {post.authorAvatar
                        ? <img src={post.authorAvatar} alt={post.authorName} style={{ width: 28, height: 28, borderRadius: '50%' }} />
                        : <div style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 28, height: 28, fontSize: '0.8rem' }}>{(post.authorName || 'A').charAt(0)}</div>
                      }
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{post.authorName || 'Anonymous'}</span>
                      <span style={{ color: 'var(--text-light)' }}>&middot;</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatDate(post.createdAt)}</span>
                      {post.category && (
                        <>
                           <span style={{ color: 'var(--text-light)' }}>&middot;</span>
                           <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', background: 'var(--hover-bg)', borderRadius: '12px', color: 'var(--text-main)' }}>{post.category}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: highlight(post.title, searchTerm) }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: highlight(post.excerpt || '', searchTerm) }} />
                    
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {post.company && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--text-main)', color: '#fff' }}>{post.company}</span>}
                      {post.role && <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', background: 'var(--hover-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>{post.role}</span>}
                    </div>
                  </div>
                  
                  {/* Decorative Company Initial */}
                  <div style={{ display: 'none' }} className="responsive-logo">
                    <div style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                      {(post.company || '?').charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Bookmark Toggle */}
                <button 
                  onClick={(e) => toggleBookmark(e, post)}
                  style={{ position: 'absolute', right: '1.2rem', top: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <i className={bookmarkedIds.has(post.id) ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'} style={bookmarkedIds.has(post.id) ? { color: 'var(--primary-color)' } : { color: 'var(--text-light)' }}></i>
                </button>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar Filters */}
        <aside className="search-sidebar" style={{ width: '280px', flexShrink: 0, position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {companyOptions.length > 0 && (
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fa-solid fa-building" style={{ color: 'var(--primary-color)' }}></i> Filter by Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {companyOptions.map((c) => (
                  <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: activeCompanies.has(c) ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={activeCompanies.has(c)} onChange={() => toggleSet(activeCompanies, c, setActiveCompanies)} style={{ accentColor: 'var(--primary-color)', width: 16, height: 16, cursor: 'pointer' }} /> 
                    <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {categoryOptions.length > 0 && (
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ marginBottom: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fa-solid fa-layer-group" style={{ color: 'var(--primary-color)' }}></i> Topic Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categoryOptions.map((cat) => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', color: activeCategories.has(cat) ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={activeCategories.has(cat)} onChange={() => toggleSet(activeCategories, cat, setActiveCategories)} style={{ accentColor: 'var(--primary-color)', width: 16, height: 16, cursor: 'pointer' }} /> 
                    <span style={{ flex: 1 }}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
        </aside>
      </div>
    </div>
  );
};

export default Search;

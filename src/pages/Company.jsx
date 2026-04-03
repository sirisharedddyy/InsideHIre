import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, getDocs, limit, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/company.css';

const formatDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const Company = () => {
  const { companyName } = useParams();
  const targetCompany = companyName || 'Google'; // Fallback for direct /company routing
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  
  // Dynamic statistics
  const [stats, setStats] = useState({
    total: 0,
    reactions: 0,
    topRole: 'Unknown',
    trendingTopics: []
  });

  const [activeRole, setActiveRole] = useState('All');

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(150));
        const snap = await getDocs(q);
        
        let allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.status === 'published');
        
        // Isolate posts for this specific company (case-insensitive mathing)
        const companyPosts = allPosts.filter(p => p.company && p.company.toLowerCase() === targetCompany.toLowerCase());
        setPosts(companyPosts);
        
        // Calculate statistical inferences rapidly
        let totalReactions = 0;
        const roleCounts = {};
        const topicCounts = {};
        
        companyPosts.forEach(p => {
          totalReactions += (p.reactions?.helpful || 0) + (p.reactions?.insightful || 0) + (p.reactions?.congrats || 0);
          
          if (p.role) {
            roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
          }
          if (Array.isArray(p.tags)) {
            p.tags.forEach(t => {
               topicCounts[t] = (topicCounts[t] || 0) + 1;
            });
          }
        });
        
        // Derive #1 top role
        const topRole = Object.entries(roleCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Software Engineer';
        // Derive top 6 topics
        const topTopics = Object.entries(topicCounts).sort((a,b) => b[1] - a[1]).slice(0, 6).map(e => e[0]);
        
        setStats({
          total: companyPosts.length,
          reactions: totalReactions,
          topRole,
          trendingTopics: topTopics
        });
        
        // Sync user Library bookmarks
        if (currentUser) {
          const bmSnap = await getDocs(collection(db, 'users', currentUser.uid, 'bookmarks'));
          setBookmarkedIds(new Set(bmSnap.docs.map(d => d.id)));
        }
      } catch (err) {
        console.error('Failed fetching company data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, [targetCompany, currentUser]);

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

  const getCompanyLogo = (name) => (
    <div style={{ width: 80, height: 80, borderRadius: 16, background: 'linear-gradient(135deg, var(--primary-color), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', boxShadow: '0 10px 25px rgba(37,99,235,0.2)', border: '4px solid var(--surface-color)' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );

  const uniqueRoles = ['All', ...Array.from(new Set(posts.map(p => p.role).filter(Boolean)))];
  const displayPosts = activeRole === 'All' ? posts : posts.filter(p => p.role === activeRole);

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', flex: 1 }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="company-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '2rem', width: '100%', alignItems: 'flex-start' }}>
        
        {/* Main Content Pane */}
        <div className="company-main" style={{ flex: 1 }}>
            
            {/* Massive Hero Block */}
            <div className="company-hero-card" style={{ background: 'var(--surface-color)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '1.5rem', position: 'relative' }}>
                <div className="company-hero-bg" style={{ height: '120px', background: 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                
                <div className="company-hero-body" style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginTop: '-40px' }}>
                    <div className="company-logo-large">
                        {getCompanyLogo(targetCompany)}
                    </div>
                    
                    <div className="company-hero-info" style={{ flex: 1, paddingBottom: '0.2rem' }}>
                        <h1 className="company-hero-name" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{targetCompany}</h1>
                        <p className="company-hero-desc" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Technology &middot; InsideHire Hub</p>
                        
                        <div className="company-hero-stats" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="hero-stat" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                              <span className="hero-stat-num" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{stats.total}</span>
                              <span className="hero-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Posts</span>
                            </div>
                            <div style={{ height: 12, width: 1, background: 'var(--border-color)' }}></div>
                            <div className="hero-stat" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                              <span className="hero-stat-num" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{stats.reactions}</span>
                              <span className="hero-stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Engagements</span>
                            </div>
                        </div>
                    </div>
                    
                    <button className="btn btn-primary" onClick={() => alert('Company subscriptions coming soon!')} style={{ borderRadius: '9999px', padding: '0.5rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 600 }}>
                      <i className="fa-solid fa-bell"></i> Subscribe
                    </button>
                </div>
            </div>

            {/* Inferred Quick Stats Bar */}
            <div className="company-stats-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <i className="fa-solid fa-users" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                    <div>
                      <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.topRole}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Most Common Role</span>
                    </div>
                </div>
                <div style={{ flex: 1, background: 'var(--surface-color)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <i className="fa-solid fa-laptop-code" style={{ fontSize: '1.5rem', color: '#10B981' }}></i>
                    <div>
                      <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>DSA & System Design</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Most Common Rounds</span>
                    </div>
                </div>
            </div>

            {/* Filter Ribbons */}
            <div className="company-posts-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>Interview Experiences</h2>
                {uniqueRoles.length > 1 && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {uniqueRoles.slice(0, 5).map(role => (
                        <button key={role} onClick={() => setActiveRole(role)} style={{ padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid', borderColor: activeRole === role ? 'var(--primary-color)' : 'var(--border-color)', background: activeRole === role ? 'var(--primary-color)' : 'transparent', color: activeRole === role ? '#fff' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                          {role}
                        </button>
                      ))}
                  </div>
                )}
            </div>

            {/* Posts Feed mapped beautifully */}
            <div className="company-posts-list">
                {displayPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
                    <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '1rem', display: 'block', color: 'var(--text-main)' }}></i>
                    <p style={{ color: 'var(--text-muted)' }}>No posts matched your criteria for {targetCompany}.</p>
                  </div>
                ) : (
                  displayPosts.map(post => (
                    <article key={post.id} onClick={() => navigate(`/stories/${post.id}`)} style={{ cursor: 'pointer', background: 'var(--surface-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--border-color)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                            {post.authorAvatar 
                              ? <img src={post.authorAvatar} alt="Author" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>{(post.authorName || 'A').charAt(0)}</div>
                            }
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{post.authorName || 'Anonymous'}</span>
                            <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>&middot;</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(post.createdAt)}</span>
                            {post.category && (
                              <span style={{ marginLeft: 'auto', background: 'var(--hover-bg)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{post.category}</span>
                            )}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: 1.3 }}>{post.title}</h3>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {post.role && <span style={{ background: 'var(--hover-bg)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{post.role}</span>}
                                {post.tags?.slice(0,2).map(tag => (
                                  <span key={tag} style={{ background: 'rgba(37,99,235,0.05)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 500 }}>#{tag}</span>
                                ))}
                            </div>
                            
                            <button onClick={(e) => toggleBookmark(e, post)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: bookmarkedIds.has(post.id) ? 'var(--primary-color)' : 'var(--text-light)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                <i className={`fa-${bookmarkedIds.has(post.id) ? 'solid' : 'regular'} fa-bookmark`}></i>
                            </button>
                        </div>
                    </article>
                  ))
                )}
            </div>
        </div>

        {/* Sidebar Info */}
        <aside className="company-sidebar" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '90px' }}>
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Top Topics</h4>
                {stats.trendingTopics.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {stats.trendingTopics.map(topic => (
                        <span key={topic} style={{ background: 'var(--hover-bg)', padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{topic}</span>
                      ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Not enough data yet.</p>
                )}
            </div>
            
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Quick Tip</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>When preparing for {targetCompany}, verify the specific focus areas for your targeted <strong>{stats.topRole}</strong> role using recent interview posts on the left!</p>
            </div>
        </aside>
      </div>
    
    </div>
  );
};

export default Company;

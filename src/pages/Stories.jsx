import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './post.css';

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const BRANCH_LABELS = {
  cse: 'Computer Science', it: 'Information Technology',
  ece: 'Electronics', me: 'Mechanical', ce: 'Civil',
};

const Stories = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) { setNotFound(true); setLoading(false); return; }
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'posts', postId));
        if (docSnap.exists()) setPost({ id: docSnap.id, ...docSnap.data() });
        else setNotFound(true);
      } catch (err) { console.error(err); setNotFound(true); }
      finally { setLoading(false); }
    };
    fetchPost();
  }, [postId]);

  if (loading) return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="post-layout">
        <article className="long-form-article">
          <div className="article-header">
            <div style={{ height: 36, width: '70%', borderRadius: 8, background: 'var(--hover-bg)', marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--hover-bg)' }} />
              <div>
                <div style={{ width: 120, height: 14, borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.4rem' }} />
                <div style={{ width: 80, height: 12, borderRadius: 6, background: 'var(--hover-bg)' }} />
              </div>
            </div>
          </div>
          <div className="article-body">
            {[90, 100, 75, 85, 60].map((w, i) => (
              <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 6, background: 'var(--hover-bg)', marginBottom: '0.75rem' }} />
            ))}
          </div>
        </article>
      </div>
    </div>
  );

  if (notFound) return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', textAlign: 'center' }}>
        <i className="fa-regular fa-newspaper" style={{ fontSize: '3.5rem', opacity: 0.3, marginBottom: '1rem' }}></i>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Post not found</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>This post may have been removed or the link is incorrect.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Feed</button>
      </div>
    </div>
  );

  const tags = Array.isArray(post.tags) ? post.tags : [];
  const branchLabel = BRANCH_LABELS[post.authorBranch] || post.authorBranch || '';

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="post-layout">
        <article className="long-form-article">
          <div className="article-header">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {post.company && <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', background: 'var(--primary-color)', color: '#fff', fontWeight: 600 }}>{post.company}</span>}
              {post.role && <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', background: 'var(--hover-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>{post.role}</span>}
              {post.category && <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', background: 'var(--hover-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{post.category}</span>}
            </div>
            <h1 className="article-title">{post.title}</h1>
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.75rem 0 1rem' }}>
                {tags.map((tag) => <span key={tag} style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', background: 'var(--hover-bg)', color: 'var(--primary-color)', border: '1px solid var(--border-color)' }}>#{tag}</span>)}
              </div>
            )}
            <div className="author-info-section">
              {post.authorAvatar
                ? <img src={post.authorAvatar} alt={post.authorName} className="author-avatar-large" />
                : <div className="author-avatar-large" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', borderRadius: '50%' }}>{(post.authorName || 'A').charAt(0).toUpperCase()}</div>
              }
              <div className="author-details">
                <div className="author-name-row"><span className="full-name">{post.authorName || 'Anonymous'}</span></div>
                <div className="author-meta">
                  {branchLabel && <span className="branch">{branchLabel}</span>}
                  {post.authorBatch && <><span className="meta-dot">&middot;</span><span className="batch">Class of {post.authorBatch}</span></>}
                  {post.createdAt && <><span className="meta-dot">&middot;</span><span className="post-date">{formatDate(post.createdAt)}</span></>}
                </div>
              </div>
            </div>
          </div>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="reaction-bar">
            <div className="reaction-group">
              <button className="reaction-btn"><i className="fa-regular fa-lightbulb"></i><span className="reaction-count">{post.reactions?.insightful ?? 0}</span><span className="reaction-label">Insightful</span></button>
              <button className="reaction-btn"><i className="fa-solid fa-hands-clapping"></i><span className="reaction-count">{post.reactions?.congrats ?? 0}</span><span className="reaction-label">Congrats</span></button>
              <button className="reaction-btn"><i className="fa-solid fa-handshake-angle"></i><span className="reaction-count">{post.reactions?.helpful ?? 0}</span><span className="reaction-label">Helpful</span></button>
            </div>
            <div className="reaction-actions">
              <button className="action-icon-btn"><i className="fa-regular fa-comment"></i> {post.commentCount ?? 0}</button>
              <button className="action-icon-btn"><i className="fa-regular fa-bookmark"></i></button>
              <button className="action-icon-btn" onClick={() => navigate('/')}><i className="fa-solid fa-arrow-left"></i></button>
            </div>
          </div>

          <div className="comments-section">
            <h3>Comments ({post.commentCount ?? 0})</h3>
            <div className="comment-input-area">
              <div className="comment-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 36, height: 36 }}>
                <i className="fa-regular fa-user"></i>
              </div>
              <input type="text" placeholder="Add a comment or ask a question..." className="comment-input" />
              <button className="btn btn-primary btn-sm">Post</button>
            </div>
            {!post.commentCount && (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem', fontSize: '0.9rem' }}>No comments yet. Be the first to start the conversation!</p>
            )}
          </div>
        </article>

        <aside className="post-sidebar">
          <button className="btn btn-secondary share-chat-btn"><i className="fa-solid fa-share"></i> Share to Chat</button>
          <button className="btn" style={{ width: '100%', marginTop: '0.75rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} onClick={() => navigate('/')}>
            <i className="fa-solid fa-arrow-left"></i> Back to Feed
          </button>
        </aside>
      </div>
      <button className="floating-referral-btn"><i className="fa-solid fa-user-plus"></i> Ask for Referral</button>
    </div>
  );
};

export default Stories;

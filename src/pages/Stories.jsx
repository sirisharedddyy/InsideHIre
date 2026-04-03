import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, serverTimestamp, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { notifyUser } from '../utils/notifications';
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
  const { currentUser, userProfile } = useAuth();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch Post and Comments
  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!postId) { setNotFound(true); setLoading(false); return; }
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'posts', postId));
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
          
          // Fetch Comments
          const commentsQuery = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
          const commentsSnap = await getDocs(commentsQuery);
          setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // Check if bookmarked
          if (currentUser) {
            const bmRef = doc(db, 'users', currentUser.uid, 'bookmarks', postId);
            const bmSnap = await getDoc(bmRef);
            setIsBookmarked(bmSnap.exists());
            
            // Check if following author
            const pAuthorId = docSnap.data().authorId;
            if (pAuthorId && currentUser.uid !== pAuthorId) {
              const fRef = doc(db, 'users', currentUser.uid, 'following', pAuthorId);
              const fSnap = await getDoc(fRef);
              setIsFollowing(fSnap.exists());
            }
          }
        } else {
          setNotFound(true);
        }
      } catch (err) { 
        console.error(err); 
        setNotFound(true); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchPostAndComments();
  }, [postId, currentUser]);

  const handleReaction = async (type) => {
    if (!currentUser) return alert('Please login to react.');
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        [`reactions.${type}`]: increment(1)
      });
      setPost(prev => ({
        ...prev,
        reactions: {
          ...prev.reactions,
          [type]: (prev.reactions?.[type] || 0) + 1
        }
      }));

      notifyUser(post.authorId, currentUser.uid, {
        type: 'reaction',
        text: `reacted to your post: "${post.title || ''}"`,
        link: `/stories/${postId}`,
        actorName: userProfile?.name || currentUser.displayName || 'Someone',
        actorAvatar: userProfile?.photoURL || currentUser.photoURL || null
      });
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setPostingComment(true);
    try {
      const commentData = {
        text: newComment.trim(),
        authorId: currentUser.uid,
        authorName: userProfile?.name || currentUser.displayName || 'Anonymous',
        authorAvatar: userProfile?.photoURL || currentUser.photoURL || null,
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
      
      // Update comment count on post
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });
      
      notifyUser(post.authorId, currentUser.uid, {
        type: 'comment',
        text: `commented: "${newComment.slice(0, 40)}${newComment.length > 40 ? '...' : ''}"`,
        link: `/stories/${postId}`,
        actorName: userProfile?.name || currentUser.displayName || 'Anonymous',
        actorAvatar: userProfile?.photoURL || currentUser.photoURL || null
      });
      
      // Update local state
      setComments(prev => [...prev, { id: docRef.id, ...commentData, createdAt: new Date() }]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      setNewComment('');
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setPostingComment(false);
    }
  };

  const toggleBookmark = async () => {
    if (!currentUser || !post) return;
    try {
      const bmRef = doc(db, 'users', currentUser.uid, 'bookmarks', postId);
      if (isBookmarked) {
        await deleteDoc(bmRef);
        setIsBookmarked(false);
      } else {
        await setDoc(bmRef, {
          title: post.title, 
          company: post.company, 
          role: post.role,
          authorName: post.authorName, 
          authorAvatar: post.authorAvatar || null,
          excerpt: post.excerpt || '', 
          savedAt: serverTimestamp(),
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const toggleFollow = async (e) => {
    e.stopPropagation();
    if (!currentUser || !post || currentUser.uid === post.authorId) return;
    const followingRef = doc(db, 'users', currentUser.uid, 'following', post.authorId);
    const followerRef = doc(db, 'users', post.authorId, 'followers', currentUser.uid);

    try {
      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setIsFollowing(false);
      } else {
        await setDoc(followingRef, { followedAt: serverTimestamp() });
        await setDoc(followerRef, { followedAt: serverTimestamp() });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

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
  
  const currentUserInitial = (userProfile?.name || currentUser?.displayName || 'U').charAt(0).toUpperCase();

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
              <div 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/profile/${post.authorId}`)}
              >
                {post.authorAvatar
                  ? <img src={post.authorAvatar} alt={post.authorName} className="author-avatar-large" />
                  : <div className="author-avatar-large" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', borderRadius: '50%' }}>{(post.authorName || 'A').charAt(0).toUpperCase()}</div>
                }
              </div>
              <div className="author-details">
                <div className="author-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="full-name" style={{ cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.authorId}`)}>
                    {post.authorName || 'Anonymous'}
                  </span>
                  {currentUser?.uid !== post.authorId && (
                    <button 
                      onClick={toggleFollow}
                      style={{
                        background: isFollowing ? 'var(--hover-bg)' : 'transparent',
                        border: isFollowing ? '1px solid var(--border-color)' : 'none',
                        color: isFollowing ? 'var(--text-light)' : 'var(--primary-color)',
                        fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                        padding: isFollowing ? '0.15rem 0.6rem' : '0 0.2rem',
                        borderRadius: isFollowing ? '12px' : '0'
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
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
              <button className="reaction-btn" onClick={() => handleReaction('insightful')}><i className="fa-regular fa-lightbulb"></i><span className="reaction-count">{post.reactions?.insightful ?? 0}</span><span className="reaction-label">Insightful</span></button>
              <button className="reaction-btn" onClick={() => handleReaction('congrats')}><i className="fa-solid fa-hands-clapping"></i><span className="reaction-count">{post.reactions?.congrats ?? 0}</span><span className="reaction-label">Congrats</span></button>
              <button className="reaction-btn" onClick={() => handleReaction('helpful')}><i className="fa-solid fa-handshake-angle"></i><span className="reaction-count">{post.reactions?.helpful ?? 0}</span><span className="reaction-label">Helpful</span></button>
            </div>
            <div className="reaction-actions">
              <button className="action-icon-btn"><i className="fa-regular fa-comment"></i> {post.commentCount ?? comments.length}</button>
              <button className="action-icon-btn" onClick={toggleBookmark}>
                <i className={isBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark'} style={isBookmarked ? { color: 'var(--primary-color)' } : {}}></i>
              </button>
              <button className="action-icon-btn" onClick={() => navigate('/')}><i className="fa-solid fa-arrow-left"></i></button>
            </div>
          </div>

          <div className="comments-section">
            <h3>Comments ({post.commentCount ?? comments.length})</h3>
            
            {/* Comment Input */}
            <div className="comment-input-area" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
              <div className="comment-avatar" style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 40, height: 40, flexShrink: 0 }}>
                {currentUserInitial}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea 
                  placeholder="Add a comment or ask a question..." 
                  className="comment-input" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-main)', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }}
                />
                <div style={{ alignSelf: 'flex-end' }}>
                  <button className="btn btn-primary btn-sm" onClick={handlePostComment} disabled={postingComment || !newComment.trim()}>
                    {postingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>

            {/* Comment List */}
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem', fontSize: '0.9rem' }}>No comments yet. Be the first to start the conversation!</p>
            ) : (
              <div className="comment-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item" style={{ display: 'flex', gap: '1rem' }}>
                    {comment.authorAvatar ? (
                      <img src={comment.authorAvatar} alt={comment.authorName} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                    ) : (
                      <div style={{ background: 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '50%', width: 40, height: 40, flexShrink: 0 }}>
                        {(comment.authorName || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="comment-content" style={{ flex: 1, background: 'var(--hover-bg)', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{comment.authorName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{formatDate(comment.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        <aside className="post-sidebar">
          <button className="btn btn-secondary share-chat-btn"><i className="fa-solid fa-share"></i> Share to Chat</button>
          <button className="btn" style={{ width: '100%', marginTop: '0.75rem', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => navigate('/')}>
            <i className="fa-solid fa-arrow-left"></i> Back to Feed
          </button>
        </aside>
      </div>
      <button className="floating-referral-btn"><i className="fa-solid fa-user-plus"></i> Ask for Referral</button>
    </div>
  );
};

export default Stories;

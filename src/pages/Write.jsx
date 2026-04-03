import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/write.css';

const Write = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const editorRef = useRef(null);

  const [scheduleLater, setScheduleLater] = useState(false);
  const [visibility, setVisibility] = useState('Public');
  const [category, setCategory] = useState('Interview Experience');

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    role: '',
    tags: '',
  });

  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('Please fill all required fields before publishing.');

  // ── Toolbar actions ──────────────────────────────────────────────────────
  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // ── Save to Firestore ─────────────────────────────────────────────────────
  const saveToFirestore = async (status = 'published') => {
    const content = editorRef.current?.innerHTML || '';
    const plainText = editorRef.current?.innerText || '';

    const tagsArray = formData.tags
      .split(/[,\s#]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const postData = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      role: formData.role.trim(),
      tags: tagsArray,
      content,           // rich HTML
      excerpt: plainText.slice(0, 200),   // plain text preview for cards
      category,
      visibility,
      status,            // 'published' or 'draft'
      authorId: currentUser.uid,
      authorName: userProfile?.name || currentUser.displayName || 'Anonymous',
      authorAvatar: userProfile?.photoURL || currentUser.photoURL || null,
      authorBranch: userProfile?.branch || '',
      authorBatch: userProfile?.batch || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      reactions: { insightful: 0, congrats: 0, helpful: 0 },
      commentCount: 0,
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);
    return docRef.id;
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    const content = editorRef.current?.innerText?.trim() || '';

    if (!formData.title.trim() || !formData.company.trim() || !formData.role.trim()) {
      setErrorMsg('Please fill in Title, Company, and Role before publishing.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }
    if (!content) {
      setErrorMsg('Your post content cannot be empty.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }

    setPublishing(true);
    try {
      await saveToFirestore('published');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Publish error:', err);
      setErrorMsg('Failed to publish. Please try again.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setPublishing(false);
    }
  };

  // ── Save Draft ────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setErrorMsg('Add a title before saving a draft.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
      return;
    }
    setSaving(true);
    try {
      await saveToFirestore('draft');
      setErrorMsg('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    } catch (err) {
      console.error('Draft save error:', err);
      setErrorMsg('Failed to save draft.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Avatar initials fallback
  const displayName = userProfile?.name || currentUser?.displayName || 'U';
  const avatarUrl = userProfile?.photoURL || currentUser?.photoURL || null;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="write-page" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      {/* Top Navigation Ribbon */}
      <header className="write-header">
        <div className="header-left">
          <div onClick={() => navigate('/')} className="onboarding-brand go-back" style={{ cursor: 'pointer' }}>
            <i className="fa-solid fa-chart-line logo-icon"></i>
            <span className="logo-text">InsideHire</span>
          </div>
          <span className="divider">/</span>
          <span className="draft-status">
            {publishing ? 'Publishing…' : saving ? 'Saving draft…' : 'Draft in progress'}
          </span>
        </div>
        <div className="header-right">
          <button
            className="btn"
            id="saveDraftBtn"
            style={{ background: 'transparent', color: 'var(--text-muted)', paddingRight: '0.5rem' }}
            onClick={handleSaveDraft}
            disabled={saving || publishing}
          >
            {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</> : 'Save as Draft'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePublish}
            disabled={publishing || saving}
          >
            {publishing ? <><i className="fa-solid fa-spinner fa-spin"></i> Publishing…</> : 'Publish'}
          </button>
          <div className="user-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} />
            ) : (
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'var(--primary-color)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '1rem',
              }}>{initials}</div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="write-workspace" style={{ flex: 1 }}>
        {/* Editor Area (Left) */}
        <main className="editor-main">
          <div className="editor-container">
            <h1 className="editor-page-title">New Post</h1>

            {/* Metadata Ribbon */}
            <div className="metadata-ribbon">
              <div className="meta-input-group">
                <input
                  type="text"
                  placeholder="Post Title*"
                  className="meta-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="meta-input-group">
                <input
                  type="text"
                  placeholder="Company Name*"
                  className="meta-input"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="meta-input-group">
                <input
                  type="text"
                  placeholder="Role / Position*"
                  className="meta-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>

            {/* Editor Toolbar */}
            <div className="editor-toolbar">
              <button className="tool-btn" title="Bold" onMouseDown={(e) => { e.preventDefault(); execFormat('bold'); }}>
                <i className="fa-solid fa-bold"></i>
              </button>
              <button className="tool-btn" title="Italic" onMouseDown={(e) => { e.preventDefault(); execFormat('italic'); }}>
                <i className="fa-solid fa-italic"></i>
              </button>
              <button className="tool-btn" title="Underline" onMouseDown={(e) => { e.preventDefault(); execFormat('underline'); }}>
                <i className="fa-solid fa-underline"></i>
              </button>
              <div className="tool-divider"></div>
              <button className="tool-btn" title="Bullet list" onMouseDown={(e) => { e.preventDefault(); execFormat('insertUnorderedList'); }}>
                <i className="fa-solid fa-list-ul"></i>
              </button>
              <button className="tool-btn" title="Numbered list" onMouseDown={(e) => { e.preventDefault(); execFormat('insertOrderedList'); }}>
                <i className="fa-solid fa-list-ol"></i>
              </button>
              <div className="tool-divider"></div>
              <button className="tool-btn" title="Heading 2" onMouseDown={(e) => { e.preventDefault(); execFormat('formatBlock', 'h2'); }}>
                <i className="fa-solid fa-heading"></i>
              </button>
              <button className="tool-btn" title="Blockquote" onMouseDown={(e) => { e.preventDefault(); execFormat('formatBlock', 'blockquote'); }}>
                <i className="fa-solid fa-quote-left"></i>
              </button>
            </div>

            {/* Main Content Editor */}
            <div className="main-content-area">
              <div
                ref={editorRef}
                className="content-editable"
                contentEditable="true"
                data-placeholder="Start writing your behind-the-scenes perspective here..."
                suppressContentEditableWarning={true}
              ></div>
            </div>
          </div>
        </main>

        {/* Sidebar Settings (Right) */}
        <aside className="settings-sidebar">
          <h2 className="sidebar-title">Publish Settings</h2>

          <div className="settings-group">
            <label>Visibility</label>
            <div className="setting-input-wrapper">
              <i className="fa-regular fa-eye setting-icon"></i>
              <select
                className="setting-input"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Public">Public</option>
                <option value="Registered Users Only">Registered Users Only</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>

          <div className="settings-group">
            <label>Publish Timing</label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <label style={{ textTransform: 'none', fontWeight: 'normal', fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text-main)', marginBottom: 0 }}>
                <input type="radio" name="publishTiming" value="now" checked={!scheduleLater} onChange={() => setScheduleLater(false)} /> Publish Now
              </label>
              <label style={{ textTransform: 'none', fontWeight: 'normal', fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text-main)', marginBottom: 0 }}>
                <input type="radio" name="publishTiming" value="later" checked={scheduleLater} onChange={() => setScheduleLater(true)} /> Schedule Later
              </label>
            </div>

            {scheduleLater && (
              <div id="calendarContainer">
                <div className="setting-input-wrapper calendar-trigger active">
                  <i className="fa-regular fa-clock setting-icon"></i>
                  <span className="setting-input pl-mock">Sep 11, 2026</span>
                </div>
                <div className="mock-calendar">
                  <div className="calendar-header">
                    <i className="fa-solid fa-chevron-left"></i>
                    <span>September 2026</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                  <div className="calendar-grid">
                    <span className="day-name">Su</span><span className="day-name">Mo</span><span className="day-name">Tu</span><span className="day-name">We</span><span className="day-name">Th</span><span className="day-name">Fr</span><span className="day-name">Sa</span>
                    <span className="day empty">29</span><span className="day empty">30</span><span className="day empty">31</span><span className="day">1</span><span className="day">2</span><span className="day">3</span><span className="day">4</span>
                    <span className="day">5</span><span className="day">6</span><span className="day">7</span><span className="day">8</span><span className="day">9</span><span className="day">10</span><span className="day active-day">11</span>
                    <span className="day">12</span><span className="day">13</span><span className="day">14</span><span className="day">15</span><span className="day">16</span><span className="day">17</span><span className="day">18</span>
                    <span className="day">19</span><span className="day">20</span><span className="day">21</span><span className="day">22</span><span className="day">23</span><span className="day">24</span><span className="day">25</span>
                  </div>
                  <div className="calendar-footer">
                    <button className="btn btn-sm btn-outline" onClick={() => setScheduleLater(false)}>Cancel</button>
                    <button className="btn btn-sm btn-primary">Schedule</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="settings-group">
            <label>Tags <span style={{ color: 'var(--text-light)', fontWeight: 'normal', fontSize: '0.85rem' }}>(Optional)</span></label>
            <div className="setting-input-wrapper">
              <input
                type="text"
                className="setting-input"
                placeholder="e.g. #Amazon, #SDE"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>

          <div className="settings-group">
            <label>Category</label>
            <div className="setting-input-wrapper">
              <select
                className="setting-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Interview Experience">Interview Experience</option>
                <option value="Preparation Strategy">Preparation Strategy</option>
                <option value="Offer Negotiation">Offer Negotiation</option>
              </select>
            </div>
          </div>
        </aside>
      </div>

      {/* Error Toast */}
      <div className={`toast-notification ${showErrorToast ? 'show' : ''}`}>
        <i className="fa-solid fa-triangle-exclamation"></i>
        <span>{errorMsg}</span>
      </div>

      {/* Success Toast */}
      <div
        className={`toast-notification ${showSuccessToast ? 'show' : ''}`}
        style={{ backgroundColor: '#10B981', color: 'white', borderColor: '#059669' }}
      >
        <i className="fa-solid fa-circle-check"></i>
        <span>{saving ? 'Draft saved!' : 'Post published successfully! Routing home…'}</span>
      </div>
    </div>
  );
};

export default Write;

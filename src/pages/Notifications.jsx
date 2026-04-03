import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/notifications.css';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return `${Math.floor(seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getIconForType = (type) => {
  switch (type) {
    case 'comment': return <i className="fa-regular fa-comment"></i>;
    case 'reaction': return <i className="fa-solid fa-hands-clapping"></i>;
    case 'follow': return <i className="fa-solid fa-user-plus"></i>;
    default: return <i className="fa-regular fa-bell"></i>;
  }
};

const Notifications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const markAllRead = async () => {
    if (!currentUser) return;
    const unread = notifications.filter(n => !n.isRead);
    if (!unread.length) return;
    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'users', currentUser.uid, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const markAsRead = async (id, isRead) => {
    if (!currentUser || isRead) return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', id), { isRead: true });
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    if (!currentUser) return;
    await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', id));
  };

  const handleNotifClick = (notif) => {
    markAsRead(notif.id, notif.isRead);
    if (notif.link) navigate(notif.link);
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      <div className="notif-layout">
        <div className="notif-main">
          
          <div className="notif-header">
            <div>
              <h1>Notifications</h1>
              <p className="notif-subtitle">
                You have <strong>{unreadCount} unread</strong> notification{unreadCount !== 1 && 's'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={markAllRead}>
                <i className="fa-solid fa-check-double"></i> Mark all as read
              </button>
            )}
          </div>

          <div className="notif-tabs">
            {['all', 'reactions', 'comments', 'follows'].map(f => (
              <button key={f} className={`notif-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="notif-list">
            {filteredNotifs.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                <i className="fa-regular fa-bell-slash" style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                <p>No notifications to display.</p>
              </div>
            )}

            {filteredNotifs.map((notif) => (
              <div key={notif.id} className={`notif-item ${notif.isRead ? 'read' : 'unread'}`} style={{ cursor: notif.link ? 'pointer' : 'default' }} onClick={() => handleNotifClick(notif)}>
                <div className={`notif-icon-wrap ${notif.type}-icon ${notif.isRead ? 'dimmed' : ''}`}>
                  {getIconForType(notif.type)}
                </div>
                <div className="notif-body">
                  <p className="notif-text">
                    <strong>{notif.actorName || 'Someone'}</strong> {notif.text}
                  </p>
                  <span className="notif-time"><i className="fa-regular fa-clock"></i> {formatTimeAgo(notif.createdAt)}</span>
                </div>
                <div className="notif-actions">
                  {notif.actorAvatar && (
                    <img src={notif.actorAvatar} className={`notif-thumb-avatar ${notif.isRead ? 'dimmed-img' : ''}`} alt={notif.actorName} />
                  )}
                  <button className="notif-dismiss" onClick={(e) => deleteNotification(e, notif.id)}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="notif-sidebar">
          <div className="notif-sidebar-widget">
            <h4 className="notif-widget-title">Notification Settings</h4>
            <div className="notif-settings-list">
              <div className="notif-setting-item">
                <div className="setting-info">
                  <span className="setting-name">Push Subscriptions</span>
                  <span className="setting-desc">Enable silent push delivery</span>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2rem' }}>
              Advanced notification settings are configured securely in your Profile Settings panel.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Notifications;

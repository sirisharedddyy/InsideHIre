import React from 'react';
import './notifications.css';

const Notifications = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      

        <div className="notif-layout">
            <div className="notif-main">
                
                <div className="notif-header">
                    <div>
                        <h1>Notifications</h1>
                        <p className="notif-subtitle">You have <strong>5 unread</strong> notifications</p>
                    </div>
                    <button className="mark-all-read-btn" id="markAllReadBtn">
                        <i className="fa-solid fa-check-double"></i> Mark all as read
                    </button>
                </div>

                
                <div className="notif-tabs">
                    <button className="notif-tab active" data-filter="all">All</button>
                    <button className="notif-tab" data-filter="reactions">Reactions</button>
                    <button className="notif-tab" data-filter="comments">Comments</button>
                    <button className="notif-tab" data-filter="follows">Follows</button>
                    <button className="notif-tab" data-filter="referrals">Referrals</button>
                </div>

                
                <div className="notif-list" id="notifList">

                    
                    <div className="notif-item unread" data-type="reactions">
                        <div className="notif-icon-wrap reaction-icon">
                            <i className="fa-regular fa-lightbulb"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>Sarah Kim</strong> and <strong>23 others</strong> found your post <a href="post.html" className="notif-link">"Aced My Google SDE Interview"</a> Insightful</p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 10 minutes ago</span>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=12" className="notif-thumb-avatar" alt="Sarah" />
                            <button className="notif-dismiss" title="Dismiss"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                    <div className="notif-item unread" data-type="comments">
                        <div className="notif-icon-wrap comment-icon">
                            <i className="fa-regular fa-comment"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>Michael Ross</strong> replied to your comment: <em>"Could you share which resources..."</em></p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 1 hour ago</span>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=45" className="notif-thumb-avatar" alt="Michael" />
                            <button className="notif-dismiss" title="Dismiss"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                    <div className="notif-item unread" data-type="referrals">
                        <div className="notif-icon-wrap referral-icon">
                            <i className="fa-solid fa-user-check"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>Priya Nair</strong> sent you a <strong>referral request</strong> for <strong>Google SDE</strong> position</p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 2 hours ago</span>
                            <div className="notif-cta-row">
                                <button className="notif-cta-btn accept-btn">Accept</button>
                                <button className="notif-cta-btn decline-btn">Decline</button>
                            </div>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=60" className="notif-thumb-avatar" alt="Priya" />
                        </div>
                    </div>

                    <div className="notif-item unread" data-type="follows">
                        <div className="notif-icon-wrap follow-icon">
                            <i className="fa-solid fa-user-plus"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>David Lee</strong> started following you</p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 3 hours ago</span>
                            <button className="notif-cta-btn follow-back-btn">Follow Back</button>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=11" className="notif-thumb-avatar" alt="David" />
                            <button className="notif-dismiss" title="Dismiss"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                    <div className="notif-item unread" data-type="reactions">
                        <div className="notif-icon-wrap congrats-icon">
                            <i className="fa-solid fa-hands-clapping"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>John Doe</strong> and <strong>11 others</strong> congratulated you on your post <a href="post.html" className="notif-link">"Aced My Google SDE Interview"</a></p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 5 hours ago</span>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=44" className="notif-thumb-avatar" alt="John" />
                            <button className="notif-dismiss" title="Dismiss"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                    
                    <div className="notif-read-divider"><span>Earlier</span></div>

                    
                    <div className="notif-item read" data-type="follows">
                        <div className="notif-icon-wrap follow-icon dimmed">
                            <i className="fa-solid fa-user-plus"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>Emily Davis</strong> started following you</p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> Yesterday</span>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=33" className="notif-thumb-avatar dimmed-img" alt="Emily" />
                        </div>
                    </div>

                    <div className="notif-item read" data-type="comments">
                        <div className="notif-icon-wrap comment-icon dimmed">
                            <i className="fa-regular fa-comment"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>Sarah Kim</strong> commented on your post: <em>"This is incredibly helpful!..."</em></p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 2 days ago</span>
                        </div>
                        <div className="notif-actions">
                            <img src="https://i.pravatar.cc/150?img=12" className="notif-thumb-avatar dimmed-img" alt="Sarah" />
                        </div>
                    </div>

                    <div className="notif-item read" data-type="reactions">
                        <div className="notif-icon-wrap helpful-icon dimmed">
                            <i className="fa-solid fa-handshake-angle"></i>
                        </div>
                        <div className="notif-body">
                            <p className="notif-text"><strong>45 people</strong> found your post <a href="post.html" className="notif-link">"Aced My Google SDE Interview"</a> Helpful</p>
                            <span className="notif-time"><i className="fa-regular fa-clock"></i> 3 days ago</span>
                        </div>
                        <div className="notif-actions">
                            <button className="notif-dismiss" title="Dismiss"><i className="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>

                </div>
            </div>

            
            <aside className="notif-sidebar">
                <div className="notif-sidebar-widget">
                    <h4 className="notif-widget-title">Notification Settings</h4>
                    <div className="notif-settings-list">
                        <div className="notif-setting-item">
                            <div className="setting-info">
                                <span className="setting-name">Reactions</span>
                                <span className="setting-desc">When someone reacts to your post</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="notif-setting-item">
                            <div className="setting-info">
                                <span className="setting-name">Comments</span>
                                <span className="setting-desc">Replies to your posts</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="notif-setting-item">
                            <div className="setting-info">
                                <span className="setting-name">New Followers</span>
                                <span className="setting-desc">When someone follows you</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="notif-setting-item">
                            <div className="setting-info">
                                <span className="setting-name">Referral Requests</span>
                                <span className="setting-desc">New referral requests</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </aside>

        </div>
    
    </div>
  );
};

export default Notifications;

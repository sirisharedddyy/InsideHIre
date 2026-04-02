import React from 'react';
import './following.css';

const Following = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      

        <div className="following-layout">
            <div className="following-main">
                <div className="following-header">
                    <div>
                        <h1>Following Feed</h1>
                        <p className="following-subtitle">Latest posts from people you follow</p>
                    </div>
                </div>

                
                <div className="feed-tabs-bar">
                    <button className="feed-tab-btn active">Latest</button>
                    <button className="feed-tab-btn">Most Reacted</button>
                </div>

                
                <div className="following-posts">
                    
                    <article className="post-card"  >
                        <div className="post-content">
                            <div className="post-meta">
                                <img src="https://i.pravatar.cc/150?img=32" alt="Author" className="author-avatar" />
                                <span className="author-name">Alex Chen</span>
                                <span className="following-tag">Following</span>
                                <span className="meta-dot">&middot;</span>
                                <span className="post-date">Dec 15</span>
                            </div>
                            <h3 className="post-title">Aced My Google SDE Interview: A Detailed Guide</h3>
                            <p className="post-preview">An in-depth breakdown of the coding rounds, system design, and behavioral questions that led to my offer at Google...</p>
                            <div className="post-footer">
                                <div className="tags"><span className="tag">#Google</span><span className="tag">#SDE</span></div>
                                <div className="post-actions">
                                    <button className="action-btn"><i className="fa-regular fa-bookmark"></i></button>
                                    <button className="action-btn"><i className="fa-solid fa-ellipsis"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className="post-company-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                        </div>
                    </article>

                    
                    <article className="post-card">
                        <div className="post-content">
                            <div className="post-meta">
                                <img src="https://i.pravatar.cc/150?img=47" alt="Author" className="author-avatar" />
                                <span className="author-name">Sarah Kim</span>
                                <span className="following-tag">Following</span>
                                <span className="meta-dot">&middot;</span>
                                <span className="post-date">Dec 14</span>
                            </div>
                            <h3 className="post-title">Navigating Amazon's AWS SDE2 Interview Loop</h3>
                            <p className="post-preview">Sharing my experience tackling the Amazon Leadership Principles and technical deep dives during the intense 5-round onsite loop...</p>
                            <div className="post-footer">
                                <div className="tags"><span className="tag">#Amazon</span><span className="tag">#AWS</span></div>
                                <div className="post-actions">
                                    <button className="action-btn"><i className="fa-regular fa-bookmark"></i></button>
                                    <button className="action-btn"><i className="fa-solid fa-ellipsis"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className="post-company-logo amazon-logo"><i className="fa-brands fa-amazon"></i></div>
                    </article>

                    
                    <article className="post-card">
                        <div className="post-content">
                            <div className="post-meta">
                                <img src="https://i.pravatar.cc/150?img=11" alt="Author" className="author-avatar" />
                                <span className="author-name">David Lee</span>
                                <span className="following-tag">Following</span>
                                <span className="meta-dot">&middot;</span>
                                <span className="post-date">Dec 12</span>
                            </div>
                            <h3 className="post-title">SDE II at Microsoft: The Journey</h3>
                            <p className="post-preview">From initial screening to the final onsite, how I prepared for and succeeded in the Microsoft interview process for the Azure team...</p>
                            <div className="post-footer">
                                <div className="tags"><span className="tag">#Microsoft</span><span className="tag">#Career</span></div>
                                <div className="post-actions">
                                    <button className="action-btn"><i className="fa-regular fa-bookmark"></i></button>
                                    <button className="action-btn"><i className="fa-solid fa-ellipsis"></i></button>
                                </div>
                            </div>
                        </div>
                        <div className="post-company-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
                        </div>
                    </article>
                </div>
            </div>

            
            <aside className="following-sidebar">
                <div className="following-widget">
                    <h4 className="widget-title">Who to Follow</h4>
                    <div className="suggested-follow-list">
                        <div className="suggest-item">
                            <img src="https://i.pravatar.cc/150?img=60" className="suggest-avatar" alt="Priya" />
                            <div className="suggest-info">
                                <span className="suggest-name">Priya Nair</span>
                                <span className="suggest-desc">SDE &middot; Meta</span>
                            </div>
                            <button className="btn-follow-sm">Follow</button>
                        </div>
                        <div className="suggest-item">
                            <img src="https://i.pravatar.cc/150?img=51" className="suggest-avatar" alt="Mark" />
                            <div className="suggest-info">
                                <span className="suggest-name">Mark Johnson</span>
                                <span className="suggest-desc">Backend &middot; Netflix</span>
                            </div>
                            <button className="btn-follow-sm">Follow</button>
                        </div>
                        <div className="suggest-item">
                            <img src="https://i.pravatar.cc/150?img=33" className="suggest-avatar" alt="Emily" />
                            <div className="suggest-info">
                                <span className="suggest-name">Emily Davis</span>
                                <span className="suggest-desc">ML Eng &middot; Apple</span>
                            </div>
                            <button className="btn-follow-sm">Follow</button>
                        </div>
                    </div>
                </div>

                <div className="following-widget">
                    <h4 className="widget-title">People you follow</h4>
                    <div className="following-list-small">
                        <div className="following-chip">
                            <img src="https://i.pravatar.cc/150?img=32" className="chip-avatar" alt="Alex" />
                            <span>Alex Chen</span>
                        </div>
                        <div className="following-chip">
                            <img src="https://i.pravatar.cc/150?img=47" className="chip-avatar" alt="Sarah" />
                            <span>Sarah Kim</span>
                        </div>
                        <div className="following-chip">
                            <img src="https://i.pravatar.cc/150?img=11" className="chip-avatar" alt="David" />
                            <span>David Lee</span>
                        </div>
                    </div>
                    <a href="profile.html" className="see-all-link">Manage following</a>
                </div>
            </aside>
        </div>
    
    </div>
  );
};

export default Following;

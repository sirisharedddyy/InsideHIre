import React from 'react';
import './company.css';

const Company = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      

        <div className="company-layout">
            <div className="company-main">
                
                <div className="company-hero-card">
                    <div className="company-hero-bg"></div>
                    <div className="company-hero-body">
                        <div className="company-logo-large">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                        </div>
                        <div className="company-hero-info">
                            <h1 className="company-hero-name">Google</h1>
                            <p className="company-hero-desc">Technology &middot; Mountain View, CA &middot; 100,000+ employees</p>
                            <div className="company-hero-stats">
                                <div className="hero-stat"><span className="hero-stat-num">1.2k</span><span className="hero-stat-label">Posts</span></div>
                                <div className="hero-stat-div"></div>
                                <div className="hero-stat"><span className="hero-stat-num">68%</span><span className="hero-stat-label">Selection Rate</span></div>
                                <div className="hero-stat-div"></div>
                                <div className="hero-stat"><span className="hero-stat-num">4.3</span><span className="hero-stat-label">Avg Difficulty</span></div>
                            </div>
                        </div>
                        <button className="follow-company-btn"><i className="fa-solid fa-bell"></i> Follow</button>
                    </div>
                </div>

                
                <div className="company-stats-bar">
                    <div className="company-stat-item">
                        <i className="fa-solid fa-circle-check" ></i>
                        <div><span className="cstat-num">820</span><span className="cstat-label">Selected</span></div>
                    </div>
                    <div className="company-stat-item">
                        <i className="fa-solid fa-circle-xmark" ></i>
                        <div><span className="cstat-num">380</span><span className="cstat-label">Not Selected</span></div>
                    </div>
                    <div className="company-stat-item">
                        <i className="fa-solid fa-code" ></i>
                        <div><span className="cstat-num">DSA + SD</span><span className="cstat-label">Common Rounds</span></div>
                    </div>
                    <div className="company-stat-item">
                        <i className="fa-solid fa-star" ></i>
                        <div><span className="cstat-num">4.5 / 5</span><span className="cstat-label">Candidate Rating</span></div>
                    </div>
                </div>

                
                <div className="company-posts-header">
                    <h2>Interview Experiences</h2>
                    <div className="company-post-filters">
                        <button className="lib-filter-btn active">All Roles</button>
                        <button className="lib-filter-btn">SDE</button>
                        <button className="lib-filter-btn">Intern</button>
                        <button className="lib-filter-btn">Research</button>
                        <button className="lib-filter-btn">PM</button>
                    </div>
                </div>

                
                <div className="company-posts-list">
                    <article className="post-card"  >
                        <div className="post-content">
                            <div className="post-meta">
                                <img src="https://i.pravatar.cc/150?img=32" alt="Author" className="author-avatar" />
                                <span className="author-name">Alex Chen</span><span className="meta-dot">&middot;</span><span className="post-date">Dec 15</span>
                                <span className="meta-dot">&middot;</span><span ><i className="fa-solid fa-circle-check"></i> Selected</span>
                            </div>
                            <h3 className="post-title">Aced My Google SDE Interview: A Detailed Guide</h3>
                            <p className="post-preview">An in-depth breakdown of the coding rounds, system design, and behavioral questions...</p>
                            <div className="post-footer">
                                <div className="tags"><span className="tag">#SDE</span><span className="tag">#InterviewPrep</span></div>
                                <div className="post-actions"><button className="action-btn"><i className="fa-regular fa-bookmark"></i></button></div>
                            </div>
                        </div>
                        <div className="post-company-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                        </div>
                    </article>

                    <article className="post-card">
                        <div className="post-content">
                            <div className="post-meta">
                                <img src="https://i.pravatar.cc/150?img=60" alt="Author" className="author-avatar" />
                                <span className="author-name">Priya Nair</span><span className="meta-dot">&middot;</span><span className="post-date">Nov 25</span>
                                <span className="meta-dot">&middot;</span><span ><i className="fa-solid fa-circle-xmark"></i> Not Selected</span>
                            </div>
                            <h3 className="post-title">My Google L4 Interview Experience: What Went Wrong</h3>
                            <p className="post-preview">A candid breakdown of where I stumbled in the Google L4 loop and the lessons I learned...</p>
                            <div className="post-footer">
                                <div className="tags"><span className="tag">#SWE</span><span className="tag">#Honest</span></div>
                                <div className="post-actions"><button className="action-btn"><i className="fa-regular fa-bookmark"></i></button></div>
                            </div>
                        </div>
                        <div className="post-company-logo">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" />
                        </div>
                    </article>
                </div>
            </div>

            
            <aside className="company-sidebar">
                <div className="company-sidebar-widget">
                    <h4 className="widget-title">Common Interview Rounds</h4>
                    <ul className="interview-rounds-list">
                        <li><i className="fa-solid fa-laptop-code"></i> Online Assessment</li>
                        <li><i className="fa-solid fa-phone"></i> Phone Screen (45 min)</li>
                        <li><i className="fa-solid fa-code"></i> Technical Round x3</li>
                        <li><i className="fa-solid fa-diagram-project"></i> System Design</li>
                        <li><i className="fa-solid fa-handshake"></i> Googlyness / Culture</li>
                    </ul>
                </div>
                <div className="company-sidebar-widget">
                    <h4 className="widget-title">Top Topics</h4>
                    <div className="topic-cloud">
                        <span className="tag">Graphs</span><span className="tag">DP</span><span className="tag">Trees</span><span className="tag">Sliding Window</span><span className="tag">Heaps</span><span className="tag">System Design</span><span className="tag">STAR Method</span>
                    </div>
                </div>
                <div className="company-sidebar-widget">
                    <h4 className="widget-title">Similar Companies</h4>
                    <div className="similar-companies">
                        <a href="#" className="similar-company-link">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="similar-logo" />
                            <span>Microsoft</span>
                        </a>
                        <a href="#" className="similar-company-link">
                            <i className="fa-brands fa-amazon similar-logo-icon"></i>
                            <span>Amazon</span>
                        </a>
                        <a href="#" className="similar-company-link">
                            <i className="fa-brands fa-meta similar-logo-icon" ></i>
                            <span>Meta</span>
                        </a>
                    </div>
                </div>
            </aside>
        </div>
    
    </div>
  );
};

export default Company;

import React from 'react';
import './settings.css';

const Settings = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      

        <div className="settings-layout">
            
            <aside className="settings-nav">
                <div className="settings-nav-section">
                    <span className="settings-nav-label">Account</span>
                    <a href="#account" className="settings-nav-item active" data-section="account"><i className="fa-regular fa-user"></i> Profile</a>
                    <a href="#account" className="settings-nav-item" data-section="account"><i className="fa-solid fa-lock"></i> Password & Security</a>
                    <a href="#account" className="settings-nav-item" data-section="account"><i className="fa-regular fa-envelope"></i> Email</a>
                </div>
                <div className="settings-nav-section">
                    <span className="settings-nav-label">Preferences</span>
                    <a href="#notifs" className="settings-nav-item" data-section="notifs"><i className="fa-regular fa-bell"></i> Notifications</a>
                    <a href="#appearance" className="settings-nav-item" data-section="appearance"><i className="fa-solid fa-palette"></i> Appearance</a>
                    <a href="#privacy" className="settings-nav-item" data-section="privacy"><i className="fa-solid fa-shield-halved"></i> Privacy</a>
                </div>
                <div className="settings-nav-section">
                    <span className="settings-nav-label">Danger Zone</span>
                    <a href="#danger" className="settings-nav-item danger-link" data-section="danger"><i className="fa-solid fa-triangle-exclamation"></i> Delete Account</a>
                </div>
            </aside>

            
            <div className="settings-content">

                
                <section className="settings-section" id="account">
                    <h2 className="settings-section-title">Profile Information</h2>
                    <p className="settings-section-desc">Update your personal information as it appears on your profile.</p>

                    <div className="settings-avatar-row">
                        <img src="https://i.pravatar.cc/150?img=68" className="settings-avatar" alt="Current Avatar" />
                        <div>
                            <button className="btn btn-primary btn-sm-settings">Change Photo</button>
                            <p className="settings-hint">JPG, PNG or GIF &middot; Max 5MB</p>
                        </div>
                    </div>

                    <div className="settings-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" value="Alex Chen" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <div className="input-prefix-group">
                                    <span className="input-prefix">@</span>
                                    <input type="text" className="form-input prefixed" value="alexchen" />
                                </div>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Branch / Department</label>
                                <input type="text" className="form-input" value="Computer Science" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Batch / Class Year</label>
                                <input type="text" className="form-input" value="2026" />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">Headline</label>
                            <input type="text" className="form-input" value="SDE @ Google · CS '26 · IIT Bombay" />
                        </div>
                        <div className="form-group full-width">
                            <label className="form-label">LinkedIn URL</label>
                            <input type="url" className="form-input" placeholder="https://linkedin.com/in/yourprofile" />
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-primary">Save Changes</button>
                            <button className="btn-cancel">Cancel</button>
                        </div>
                    </div>
                </section>

                <div className="settings-divider"></div>

                
                <section className="settings-section" id="appearance">
                    <h2 className="settings-section-title">Appearance</h2>
                    <p className="settings-section-desc">Customize how InsideHire looks for you.</p>
                    <div className="theme-options">
                        <div className="theme-option selected-theme" id="lightThemeOpt">
                            <div className="theme-preview light-preview">
                                <div className="tp-sidebar"></div>
                                <div className="tp-content">
                                    <div className="tp-card"></div>
                                    <div className="tp-card"></div>
                                </div>
                            </div>
                            <span className="theme-label"><i className="fa-regular fa-sun"></i> Light</span>
                        </div>
                        <div className="theme-option" id="darkThemeOpt">
                            <div className="theme-preview dark-preview">
                                <div className="tp-sidebar dark"></div>
                                <div className="tp-content dark">
                                    <div className="tp-card dark"></div>
                                    <div className="tp-card dark"></div>
                                </div>
                            </div>
                            <span className="theme-label"><i className="fa-regular fa-moon"></i> Dark</span>
                        </div>
                    </div>
                </section>

                <div className="settings-divider"></div>

                
                <section className="settings-section" id="privacy">
                    <h2 className="settings-section-title">Privacy</h2>
                    <p className="settings-section-desc">Control who can see your profile and content.</p>
                    <div className="settings-toggles">
                        <div className="settings-toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-label">Public Profile</span>
                                <span className="toggle-desc">Anyone can see your profile and posts</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-label">Show Selection Status</span>
                                <span className="toggle-desc">Display your Selected / Not Selected badge publicly</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-label">Allow Referral Requests</span>
                                <span className="toggle-desc">Other users can send you referral requests</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="settings-toggle-row">
                            <div className="toggle-info">
                                <span className="toggle-label">Show in Search Results</span>
                                <span className="toggle-desc">Allow your profile to appear in search</span>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" checked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </section>

                <div className="settings-divider"></div>

                
                <section className="settings-section danger-section" id="danger">
                    <h2 className="settings-section-title danger-title">Danger Zone</h2>
                    <p className="settings-section-desc">Irreversible and destructive actions. Proceed with caution.</p>
                    <div className="danger-actions">
                        <div className="danger-row">
                            <div>
                                <span className="danger-action-title">Delete Account</span>
                                <span className="danger-action-desc">Permanently delete your account and all data. This cannot be undone.</span>
                            </div>
                            <button className="danger-btn">Delete Account</button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    
    </div>
  );
};

export default Settings;

import React from 'react';
import '../styles/messages.css';

const Messages = () => {
  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0 }}>
      

            
            <div className="messages-container">
                
                <aside className="chat-sidebar">
                    <div className="chat-sidebar-header">
                        <h2>Messages</h2>
                        <div className="header-actions">
                            <button className="icon-btn"><i className="fa-solid fa-ellipsis"></i></button>
                            <button className="icon-btn new-message-btn"><i className="fa-solid fa-pen-to-square"></i></button>
                        </div>
                    </div>
                    <div className="chat-search">
                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                        <input type="text" placeholder="Search messages..." className="chat-search-input" />
                    </div>
                    
                    <div className="chat-list">
                        
                        <div className="chat-item active unread">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="chat-avatar" />
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">Sarah Kim</span>
                                    <span className="chat-time">10:42 AM</span>
                                </div>
                                <p className="chat-preview">Thanks for the referral advice...</p>
                            </div>
                            <div className="unread-dot"></div>
                        </div>

                        
                        <div className="chat-item unread">
                            <img src="https://i.pravatar.cc/150?img=25" alt="Avatar" className="chat-avatar" />
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">Recruiter (Microsoft)</span>
                                    <span className="chat-time">Yesterday</span>
                                </div>
                                <p className="chat-preview">Hi Alex, following up on your in...</p>
                            </div>
                            <div className="unread-dot"></div>
                        </div>

                        
                        <div className="chat-item">
                            <img src="https://i.pravatar.cc/150?img=44" alt="Avatar" className="chat-avatar" />
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">John Doe</span>
                                    <span className="chat-time">Mon</span>
                                </div>
                                <p className="chat-preview">Sounds good, let's connect s...</p>
                            </div>
                        </div>

                        
                        <div className="chat-item">
                            <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="chat-avatar" />
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">Emily Davis</span>
                                    <span className="chat-time">Oct 12</span>
                                </div>
                                <p className="chat-preview">Did you get a chance to look at...</p>
                            </div>
                        </div>
                        
                        
                        <div className="chat-item">
                            <img src="https://i.pravatar.cc/150?img=51" alt="Avatar" className="chat-avatar" />
                            <div className="chat-info">
                                <div className="chat-name-row">
                                    <span className="chat-name">Mark Johnson</span>
                                    <span className="chat-time">Oct 09</span>
                                </div>
                                <p className="chat-preview">Haha yeah, that round was brutal.</p>
                            </div>
                        </div>
                    </div>
                </aside>

                
                <section className="active-chat">
                    
                    <div className="active-chat-header">
                        <div className="chat-user-info">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="chat-header-avatar" />
                            <div className="chat-user-details">
                                <h3 className="chat-user-name">Sarah Kim</h3>
                                <span className="chat-user-status">
                                    <i className="fa-solid fa-circle online-indicator"></i> Active Now
                                </span>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <button className="icon-btn"><i className="fa-solid fa-phone"></i></button>
                            <button className="icon-btn"><i className="fa-solid fa-video"></i></button>
                            <button className="icon-btn"><i className="fa-solid fa-circle-info"></i></button>
                        </div>
                    </div>

                    
                    <div className="chat-messages-area">
                        <div className="date-divider"><span>Today</span></div>

                        
                        <div className="message-bubble-wrapper received">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="message-avatar" />
                            <div className="message-content">
                                <p>Hey Alex! I read your post about the Google SDE interview loop. It was super helpful.</p>
                                <span className="message-time">10:30 AM</span>
                            </div>
                        </div>

                        
                        <div className="message-bubble-wrapper received grouped">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="message-avatar placeholder" />
                            <div className="message-content">
                                <p>Could you share what you focused on for the System Design round? Did you use any specific platform?</p>
                                <span className="message-time">10:31 AM</span>
                            </div>
                        </div>

                        
                        <div className="message-bubble-wrapper sent">
                            <div className="message-content">
                                <p>Hey Sarah! Glad it helped. For System Design, I mostly relied on Alex Xu's book and Grokking the System Design Interview.</p>
                                <span className="message-time">10:40 AM <i className="fa-solid fa-check-double read-receipt"></i></span>
                            </div>
                        </div>
                        
                        
                        <div className="message-bubble-wrapper received">
                            <img src="https://i.pravatar.cc/150?img=12" alt="Avatar" className="message-avatar" />
                            <div className="message-content">
                                <p>Thanks for the referral advice, it really helped me during my interview!</p>
                                <span className="message-time">10:42 AM</span>
                            </div>
                        </div>

                    </div>

                    
                    <div className="chat-input-container">
                        <button className="icon-btn attachment-btn"><i className="fa-solid fa-plus"></i></button>
                        <button className="icon-btn attachment-btn"><i className="fa-regular fa-image"></i></button>
                        <div className="input-wrapper">
                            <input type="text" placeholder="Write a message..." className="message-input" />
                            <button className="icon-btn emoji-btn"><i className="fa-regular fa-face-smile"></i></button>
                        </div>
                        <button className="btn btn-primary send-btn"><i className="fa-solid fa-paper-plane"></i></button>
                    </div>
                </section>
            </div>
        
    </div>
  );
};

export default Messages;

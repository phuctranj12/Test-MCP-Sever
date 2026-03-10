import React from 'react';

const Message = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <div className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
            <div className="message-content">
                <p>{message.text}</p>
            </div>
        </div>
    );
};

export default Message;
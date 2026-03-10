import React from 'react';
import Message from './Message';

const MessageList = ({ messages, messagesEndRef }) => {
    return (
        <div className="message-list">
            {messages.map((message) => (
                <Message key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
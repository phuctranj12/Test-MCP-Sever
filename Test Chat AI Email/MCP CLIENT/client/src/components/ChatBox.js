import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './ChatBox.css';

const ChatBox = () => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;

        // Add user message
        const userMessage = { id: Date.now(), text: message, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Call backend API that communicates with MCP server
            const response = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            const botMessage = { id: Date.now() + 1, text: data.response, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = { id: Date.now() + 1, text: 'Có lỗi xảy ra khi kết nối với server. Vui lòng thử lại.', sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-box">
            <div className="chat-header">
                <h2>Chat AI</h2>
            </div>
            <MessageList messages={messages} messagesEndRef={messagesEndRef} />
            {isLoading && <div className="loading">Đang xử lý...</div>}
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
        </div>
    );
};

export default ChatBox;
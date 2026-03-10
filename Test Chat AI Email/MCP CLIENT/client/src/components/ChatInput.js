import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, disabled }) => {
    const [input, setInput] = useState('');
    const textareaRef = useRef(null);

    const handleChange = (e) => {
        setInput(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input);
            setInput('');
            // Reset height after send
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    // Reset height when input is cleared
    useEffect(() => {
        if (!input && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }, [input]);

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
            <div className="input-box">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleChange}
                    placeholder="Nhập tin nhắn của bạn..."
                    disabled={disabled}
                    rows={1}
                />
            </div>
            <button type="submit" disabled={disabled || !input.trim()}>
                Gửi
            </button>
        </form>
    );
};

export default ChatInput;
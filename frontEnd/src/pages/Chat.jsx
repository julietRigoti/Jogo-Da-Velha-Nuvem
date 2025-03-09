import React, { useState, useEffect } from 'react';
import styles from '../style/Chat.module.css';

const Chat = ({ messages, sendMessage }) => {
    const [messageToSend, setMessageToSend] = useState('');

    const handleSendMessage = () => {
        if (messageToSend.trim()) {
            sendMessage(messageToSend);
            setMessageToSend('');
        }
    };

    useEffect(() => {
        const chatContent = document.getElementById('chat-content');
        if (chatContent) {
            chatContent.scrollTop = chatContent.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={styles.chatContainer}>
            <div id="chat-content" className={styles.chatContent}>
                {messages.map((msg, index) => (
                    <p key={index} className={styles.chatMessage}>{msg}</p>
                ))}
            </div>

            <div className={styles.chatForm}>
                <input
                    type="text"
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className={styles.chatInput}
                />
                <button
                    disabled={!messageToSend.trim()}
                    onClick={handleSendMessage}
                    className={styles.chatButton}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default Chat;

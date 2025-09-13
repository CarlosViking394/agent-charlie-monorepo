import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import TTSService from '../services/ttsService';
import { N8NService } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  isPlaying?: boolean;
}

interface AgentChatProps {
  agentId: string;
  agentName: string;
  onClose: () => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ agentId, agentName, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      text: `Hi! I'm ${agentName}. How can I help you today?`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      setRecognition(recognition);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play TTS for agent messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'agent' && isTTSEnabled && !lastMessage.isPlaying) {
      handlePlayTTS(lastMessage.id, lastMessage.text);
    }
  }, [messages, isTTSEnabled]);

  const handlePlayTTS = async (messageId: string, text: string) => {
    try {
      // Mark message as playing
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isPlaying: true } : msg
      ));

      // Use the charlie voice ID we configured
      await TTSService.speak(text, { voiceId: '4gEcf8V7EWIeNMLu15SM' });
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      // Mark message as not playing
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isPlaying: false } : msg
      ));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the agent via n8n webhook
      const response = await N8NService.chatWithAgent(agentId, userMessage.text, {
        messages: messages.slice(-5) // Send last 5 messages for context
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: response.message || "I'm here to help! Can you tell me more about what you need?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: "I apologize, I'm having trouble connecting right now. Can you try again in a moment?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="glass-panel glass-panel--elevated w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">Chat with {agentName}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-600">Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              className={`glass-button p-2 ${isTTSEnabled ? 'glass-button--primary' : ''}`}
              title={isTTSEnabled ? 'Disable voice' : 'Enable voice'}
            >
              {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="glass-button p-2">
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'glass-panel--secondary text-white'
                    : 'glass-panel'
                } ${message.isPlaying ? 'ring-2 ring-primary' : ''}`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {message.sender === 'agent' && (
                    <button
                      onClick={() => handlePlayTTS(message.id, message.text)}
                      className="glass-button p-1 ml-2"
                      title="Play message"
                      disabled={message.isPlaying}
                    >
                      {message.isPlaying ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-panel p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-slate-600">Typing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          {/* Listening Indicator */}
          {isListening && (
            <div className="mb-3 p-3 bg-azure-50 border border-azure-200 rounded-lg flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-azure-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-azure-700 font-medium">Listening... Speak now!</span>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "🎤 Listening..." : "Type your message..."}
                className="glass-input w-full py-3 px-4 pr-12 resize-none"
                rows={1}
                disabled={isLoading || isListening}
              />
              <button
                onClick={handleMicrophoneClick}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 glass-button p-2 ${
                  isListening ? 'glass-button--primary animate-pulse' : ''
                }`}
                title={isListening ? "Stop recording" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="glass-button--primary p-3 disabled:opacity-50"
              title="Send message"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
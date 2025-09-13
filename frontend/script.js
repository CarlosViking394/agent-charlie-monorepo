// Agent Charlie - Frontend Interface
class AgentCharlie {
    constructor() {
        this.currentAudio = null;
        this.isPlaying = false;
        this.autoSpeak = false;
        this.apiUrl = 'http://localhost:5678/webhook/tts';
        this.testApiUrl = 'http://localhost:5678/webhook-test/tts';
        this.prodApiUrl = 'https://n8n.agentcharlie.live/webhook/tts';
        this.prodTestApiUrl = 'https://n8n.agentcharlie.live/webhook-test/tts';
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    }

    initializeElements() {
        // TTS Elements
        this.ttsInput = document.getElementById('tts-input');
        this.voiceSelect = document.getElementById('voice-select');
        this.speakBtn = document.getElementById('speak-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.ttsStatus = document.getElementById('tts-status');

        // Chat Elements
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');

        // Settings Elements
        this.apiUrlInput = document.getElementById('api-url');
        this.testApiUrlInput = document.getElementById('test-api-url');
        this.useTestUrlCheckbox = document.getElementById('use-test-url');
        this.autoSpeakCheckbox = document.getElementById('auto-speak');
        this.testConnectionBtn = document.getElementById('test-connection');
    }

    bindEvents() {
        // TTS Events
        this.speakBtn.addEventListener('click', () => this.speak());
        this.stopBtn.addEventListener('click', () => this.stopAudio());
        this.ttsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.speak();
            }
        });

        // Chat Events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Settings Events
        this.apiUrlInput.addEventListener('change', () => this.saveSettings());
        this.testApiUrlInput.addEventListener('change', () => this.saveSettings());
        this.useTestUrlCheckbox.addEventListener('change', () => this.saveSettings());
        this.autoSpeakCheckbox.addEventListener('change', () => this.saveSettings());
        this.testConnectionBtn.addEventListener('click', () => this.testConnection());

        // Voice selection change
        this.voiceSelect.addEventListener('change', () => this.saveSettings());
        
        // Update endpoint display when checkbox changes
        this.useTestUrlCheckbox.addEventListener('change', () => this.updateEndpointDisplay());
    }

    async speak() {
        const text = this.ttsInput.value.trim();
        if (!text) {
            this.showStatus('Please enter some text to speak', 'error');
            return;
        }

        const voiceId = this.voiceSelect.value;
        const currentApiUrl = this.getCurrentApiUrl();
        
        this.showStatus('Converting text to speech...', 'loading');
        this.speakBtn.disabled = true;
        this.stopBtn.disabled = false;

        try {
            const response = await fetch(currentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    voice_id: voiceId || undefined
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is audio or JSON
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                // Handle JSON response (when n8n returns data instead of audio)
                const jsonData = await response.json();
                this.showStatus(`Received response: ${JSON.stringify(jsonData)}. Configure ElevenLabs API to get audio.`, 'error');
                this.resetAudioState();
                return;
            }

            // Handle audio response
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            this.currentAudio = new Audio(audioUrl);
            this.currentAudio.onended = () => {
                this.resetAudioState();
            };
            
            this.currentAudio.onerror = () => {
                this.showStatus('Error playing audio', 'error');
                this.resetAudioState();
            };

            await this.currentAudio.play();
            this.isPlaying = true;
            this.showStatus('Playing audio...', 'success');

        } catch (error) {
            console.error('TTS Error:', error);
            this.showStatus(`Error: ${error.message}`, 'error');
            this.resetAudioState();
        }
    }

    stopAudio() {
        if (this.currentAudio && this.isPlaying) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.resetAudioState();
            this.showStatus('Audio stopped', 'success');
        }
    }

    resetAudioState() {
        this.isPlaying = false;
        this.speakBtn.disabled = false;
        this.stopBtn.disabled = true;
        if (this.currentAudio) {
            URL.revokeObjectURL(this.currentAudio.src);
            this.currentAudio = null;
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addChatMessage(message, 'user');
        this.chatInput.value = '';

        // Simulate AI response (you can replace this with actual AI integration)
        const aiResponse = await this.generateAIResponse(message);
        this.addChatMessage(aiResponse, 'agent');

        // Auto-speak if enabled
        if (this.autoSpeak) {
            this.ttsInput.value = aiResponse;
            setTimeout(() => this.speak(), 500);
        }
    }

    async generateAIResponse(userMessage) {
        // Simple response generation - you can replace this with actual AI API calls
        const responses = [
            "That's an interesting question! Let me think about that.",
            "I understand what you're asking. Here's what I can tell you...",
            "Great question! Based on my knowledge, I'd say...",
            "I'm processing your request. Here's my response...",
            "That's a good point. Let me elaborate on that..."
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addChatMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const icon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
        const content = `
            <div class="message-content">
                <i class="${icon}"></i>
                <span>${this.escapeHtml(text)}</span>
            </div>
        `;
        
        messageDiv.innerHTML = content;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showStatus(message, type = 'success') {
        this.ttsStatus.textContent = message;
        this.ttsStatus.className = `status ${type}`;
        
        if (type !== 'loading') {
            setTimeout(() => {
                this.ttsStatus.textContent = '';
                this.ttsStatus.className = 'status';
            }, 5000);
        }
    }

    getCurrentApiUrl() {
        if (this.useTestUrlCheckbox && this.useTestUrlCheckbox.checked) {
            return this.testApiUrlInput.value || this.testApiUrl;
        }
        return this.apiUrlInput.value || this.apiUrl;
    }

    async testConnection() {
        this.testConnectionBtn.disabled = true;
        this.testConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

        const currentApiUrl = this.getCurrentApiUrl();
        const isTestUrl = this.useTestUrlCheckbox && this.useTestUrlCheckbox.checked;

        try {
            const response = await fetch(currentApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: 'Connection test',
                    voice_id: ''
                })
            });

            if (response.ok) {
                const urlType = isTestUrl ? 'Test' : 'Production';
                this.showStatus(`${urlType} connection successful!`, 'success');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Connection test failed:', error);
            this.showStatus(`Connection failed: ${error.message}`, 'error');
        } finally {
            this.testConnectionBtn.disabled = false;
            this.testConnectionBtn.innerHTML = '<i class="fas fa-plug"></i> Test Connection';
        }
    }

    saveSettings() {
        const settings = {
            apiUrl: this.apiUrlInput.value,
            testApiUrl: this.testApiUrlInput.value,
            useTestUrl: this.useTestUrlCheckbox.checked,
            autoSpeak: this.autoSpeakCheckbox.checked,
            voiceId: this.voiceSelect.value
        };
        
        localStorage.setItem('agentCharlieSettings', JSON.stringify(settings));
        this.apiUrl = settings.apiUrl;
        this.testApiUrl = settings.testApiUrl;
        this.autoSpeak = settings.autoSpeak;
    }

    loadSettings() {
        const saved = localStorage.getItem('agentCharlieSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.apiUrlInput.value = settings.apiUrl || this.apiUrl;
                this.testApiUrlInput.value = settings.testApiUrl || this.testApiUrl;
                this.useTestUrlCheckbox.checked = settings.useTestUrl || false;
                this.autoSpeakCheckbox.checked = settings.autoSpeak || false;
                this.voiceSelect.value = settings.voiceId || '';
                
                this.apiUrl = this.apiUrlInput.value;
                this.testApiUrl = this.testApiUrlInput.value;
                this.autoSpeak = this.autoSpeakCheckbox.checked;
                
                // Update endpoint display after loading settings
                this.updateEndpointDisplay();
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    updateEndpointDisplay() {
        const currentEndpointSpan = document.getElementById('current-endpoint');
        if (currentEndpointSpan) {
            const isTestUrl = this.useTestUrlCheckbox && this.useTestUrlCheckbox.checked;
            currentEndpointSpan.textContent = isTestUrl ? 'Test' : 'Production';
            currentEndpointSpan.style.color = isTestUrl ? '#f59e0b' : '#10b981';
        }
    }

    // Utility method to add sample voices
    addSampleVoices() {
        const voices = [
            { id: '', name: 'Default Voice' },
            { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Friendly)' },
            { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi (Strong)' },
            { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Soft)' },
            { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni (Deep)' },
            { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli (Young)' }
        ];

        this.voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.id;
            option.textContent = voice.name;
            this.voiceSelect.appendChild(option);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new AgentCharlie();
    app.addSampleVoices();
    app.updateEndpointDisplay();
    
    // Add some helpful tips
    console.log('🎉 Agent Charlie is ready!');
    console.log('💡 Tip: Use Ctrl+Enter in the TTS input to quickly convert text to speech');
    console.log('💡 Tip: Enable auto-speak to automatically convert AI responses to speech');
    console.log('💡 Tip: Toggle between Test and Production URLs in Settings');
    
    // Global access for debugging
    window.agentCharlie = app;
});

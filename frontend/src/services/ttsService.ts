import { N8NService } from './api';

const ENABLE_TTS = import.meta.env.VITE_ENABLE_TTS !== 'false';

export interface TTSOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

export class TTSService {
  private static audioCache = new Map<string, string>();
  private static currentAudio: HTMLAudioElement | null = null;

  // Convert text to speech using n8n workflow
  static async textToSpeech(text: string, options: TTSOptions = {}): Promise<string> {
    if (!ENABLE_TTS) {
      console.warn('TTS is disabled');
      return '';
    }

    try {
      // Check cache first
      const cacheKey = `${text}-${options.voiceId || 'default'}`;
      if (this.audioCache.has(cacheKey)) {
        return this.audioCache.get(cacheKey)!;
      }

      console.log('🔊 Converting text to speech:', text.substring(0, 50) + '...');
      
      const response = await N8NService.textToSpeech(text, options.voiceId);
      
      if (response.audioUrl) {
        // Cache the audio URL
        this.audioCache.set(cacheKey, response.audioUrl);
        return response.audioUrl;
      } else if (response.audioBase64) {
        // Convert base64 to blob URL
        const audioBlob = this.base64ToBlob(response.audioBase64, 'audio/mpeg');
        const audioUrl = URL.createObjectURL(audioBlob);
        this.audioCache.set(cacheKey, audioUrl);
        return audioUrl;
      }

      throw new Error('No audio data received');
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  // Play audio from URL or base64
  static async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        this.stopAudio();

        this.currentAudio = new Audio(audioUrl);
        
        this.currentAudio.addEventListener('ended', () => {
          resolve();
        });

        this.currentAudio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          reject(new Error('Audio playback failed'));
        });

        this.currentAudio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Speak text directly (convert and play)
  static async speak(text: string, options: TTSOptions = {}): Promise<void> {
    try {
      const audioUrl = await this.textToSpeech(text, options);
      await this.playAudio(audioUrl);
    } catch (error) {
      console.error('Speak error:', error);
      throw error;
    }
  }

  // Stop current audio
  static stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  // Check if audio is currently playing
  static isPlaying(): boolean {
    return Boolean(this.currentAudio && !this.currentAudio.paused);
  }

  // Get available voices
  static async getVoices(): Promise<any[]> {
    try {
      const response = await N8NService.callWebhook('get-voices', {});
      return response.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      
      // Return default voices
      return [
        { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', category: 'Female' },
        { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', category: 'Female' },
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', category: 'Female' },
        { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', category: 'Male' },
        { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', category: 'Female' }
      ];
    }
  }

  // Utility: Convert base64 to blob
  private static base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Clear cache
  static clearCache(): void {
    // Revoke blob URLs to free memory
    this.audioCache.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    this.audioCache.clear();
  }

  // Preload audio for common phrases
  static async preloadCommonPhrases(): Promise<void> {
    const commonPhrases = [
      'Hello! How can I help you today?',
      'Thank you for your message.',
      'I\'ll be right with you.',
      'Your request has been sent successfully.',
      'Please wait while I process your request.'
    ];

    const preloadPromises = commonPhrases.map(phrase => 
      this.textToSpeech(phrase).catch(err => 
        console.warn(`Failed to preload: "${phrase}"`, err)
      )
    );

    await Promise.allSettled(preloadPromises);
    console.log('🔊 TTS preloading completed');
  }
}

export default TTSService;
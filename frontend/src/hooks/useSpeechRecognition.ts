import { useState, useEffect, useCallback, useRef } from 'react';
import { useActions } from '../store/context';

// Speech Recognition Hook
export function useSpeechRecognition() {
  const actions = useActions();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | undefined>(undefined);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(undefined);
        actions.ui.setSpeechRecognition({ isListening: true, error: undefined });
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0];
        if (result) {
          const newTranscript = result[0].transcript;
          const newConfidence = result[0].confidence;

          setTranscript(newTranscript);
          setConfidence(newConfidence);

          actions.ui.setSpeechRecognition({
            transcript: newTranscript,
            confidence: newConfidence,
          });
        }
      };

      recognition.onerror = (event: any) => {
        const errorMessage = `Speech recognition error: ${event.error}`;
        setError(errorMessage);
        setIsListening(false);

        actions.ui.setSpeechRecognition({
          isListening: false,
          error: errorMessage,
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        actions.ui.setSpeechRecognition({ isListening: false });
      };

      recognitionRef.current = recognition;

      // Update global state
      actions.ui.setSpeechRecognition({
        isSupported: true,
        isListening: false,
        transcript: '',
        confidence: 0,
      });
    } else {
      setIsSupported(false);
      actions.ui.setSpeechRecognition({
        isSupported: false,
        isListening: false,
        transcript: '',
        confidence: 0,
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [actions]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported');
      return false;
    }

    if (isListening) {
      return true;
    }

    try {
      setTranscript('');
      setConfidence(0);
      setError(undefined);
      recognitionRef.current.start();

      // Set a timeout to automatically stop listening after 10 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
        setError('Listening timeout - please try again');
      }, 10000);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMessage);
      return false;
    }
  }, [isSupported, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsListening(false);
    actions.ui.setSpeechRecognition({ isListening: false });
  }, [isListening, actions]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript and reset
  const reset = useCallback(() => {
    stopListening();
    setTranscript('');
    setConfidence(0);
    setError(undefined);

    actions.ui.setSpeechRecognition({
      transcript: '',
      confidence: 0,
      error: undefined,
    });
  }, [stopListening, actions]);

  return {
    isSupported,
    isListening,
    transcript,
    confidence,
    error,
    startListening,
    stopListening,
    toggleListening,
    reset,
  };
}
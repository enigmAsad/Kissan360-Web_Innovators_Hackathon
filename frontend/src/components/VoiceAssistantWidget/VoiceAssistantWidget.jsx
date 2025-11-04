import React, { useState, useRef, useEffect } from 'react';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../../utils/api';
import './VoiceAssistantWidget.scss';

const DEFAULT_LANGUAGE = 'ur';

const VoiceAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseText, setResponseText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  const startRecording = async () => {
    if (isRecording || loading) return;

    setError('');
    setTranscript('');
    setResponseText('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        uploadAudio(audioBlob);
      };

      mediaRecorder.onerror = () => {
        setError('Recording failed. Please try again.');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err?.message || 'Unable to access microphone');
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadAudio = async (blob) => {
    if (!blob || blob.size === 0) {
      setError('No audio captured.');
      return;
    }

    const formData = new FormData();
    formData.append('audio', blob, 'farmer-query.webm');

    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/voice/interact', formData, {
        params: { language },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [(requestData) => requestData],
      });

      setTranscript(data?.transcript || '');
      setResponseText(data?.response_text || '');

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }

      if (data?.audio_base64) {
        const blobUrl = createAudioUrlFromBase64(data.audio_base64, data?.metadata?.tts_format);
        setAudioUrl(blobUrl);
      }
    } catch (err) {
      console.error('Voice assistant request failed:', err);
      const status = err?.response?.status;
      const detail = err?.response?.data;
      let message = '';

      if (detail?.error && typeof detail.error === 'string') {
        message = detail.error;
      } else if (detail?.details?.error) {
        message = detail.details.error;
      } else if (detail?.details?.detail) {
        message = detail.details.detail;
      } else if (typeof err?.message === 'string') {
        message = err.message;
      }

      if (status === 502) {
        message = message || 'Voice assistant service is offline. Please ensure the voice bot backend is running.';
      } else if (status === 413) {
        message = message || 'Audio clip is too long. Please keep recordings shorter.';
      }

      setError(message || 'Voice assistant unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAudioUrlFromBase64 = (base64, format) => {
    try {
      const mimeType = format ? `audio/${format}` : 'audio/mpeg';
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Failed to decode assistant audio:', err);
      return null;
    }
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  return (
    <div className="voice-assistant-widget">
      <button
        type="button"
        className="voice-toggle"
        onClick={toggleWidget}
        aria-label="Toggle voice assistant"
        aria-expanded={isOpen}
      >
        <HeadsetMicIcon />
      </button>

      {isOpen && (
        <div className="voice-panel" role="dialog" aria-modal="false">
          <div className="voice-header">
            <div>
              <h3>Zarai Dost Voice</h3>
              <p>Hold a short conversation with the assistant.</p>
            </div>
            <button type="button" className="close-btn" onClick={toggleWidget} aria-label="Close voice assistant">
              <CloseIcon />
            </button>
          </div>

          <div className="voice-body">
            <label className="language-select">
              <span>Language</span>
              <select value={language} onChange={handleLanguageChange} disabled={isRecording || loading}>
                <option value="ur">Urdu</option>
                <option value="en">English</option>
              </select>
            </label>

            <div className={`recorder ${isRecording ? 'recording' : ''}`}>
              <button
                type="button"
                className="record-btn"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                {isRecording ? <StopIcon /> : <MicIcon />}
                <span>{isRecording ? 'Stop' : 'Talk'}</span>
              </button>

              <div className="status-text">
                {isRecording && <span className="pulse" />} 
                {isRecording ? 'Listening...' : 'Tap to speak'}
              </div>
            </div>

            {loading && (
              <div className="loading-row">
                <CircularProgress size={20} />
                <span>Processing your request...</span>
              </div>
            )}

            {error && <div className="error-text">{error}</div>}

            {transcript && (
              <div className="message-block">
                <h4>You said</h4>
                <p>{transcript}</p>
              </div>
            )}

            {responseText && (
              <div className="message-block assistant">
                <h4>Zarai Dost</h4>
                <p>{responseText}</p>
                {audioUrl && (
                  <button type="button" className="playback-btn" onClick={() => {
                    const audio = new Audio(audioUrl);
                    audio.play().catch((err) => console.error('Playback failed', err));
                  }}>
                    <VolumeUpIcon />
                    <span>Play reply</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistantWidget;



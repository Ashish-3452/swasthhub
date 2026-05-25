import React, { useState, useRef, useEffect } from 'react';
import {
  Container, Typography, TextField, Button, Paper, Box, Avatar, IconButton,
  CircularProgress, Tooltip,
} from '@mui/material';
import {
  Send, Person, LocalHospital, Mic, MicOff, VolumeUp, Image, Refresh,
} from '@mui/icons-material';
import api from '../utils/api';

const generateSessionId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const AIDoctorChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => localStorage.getItem('aiSessionId') || generateSessionId());
  const [isListening, setIsListening] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState('');
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;

  // sessionId localStorage में सेव करें
  useEffect(() => {
    localStorage.setItem('aiSessionId', sessionId);
  }, [sessionId]);

  // चैट हिस्ट्री लोड/सेव करें
  useEffect(() => {
    const saved = localStorage.getItem('aiChatHistory');
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiChatHistory', JSON.stringify(messages));
  }, [messages]);

  // मौसम लें (सिर्फ़ एक बार)
  useEffect(() => {
    api.get('/ai/weather')
      .then(res => setWeatherInfo(res.data.weather))
      .catch(console.error);
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  // ---------- वॉइस इनपुट ----------
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('आपका ब्राउज़र Voice Input सपोर्ट नहीं करता।'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev + ' ' + transcript).trim());
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ---------- इमेज हैंडलिंग ----------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ---------- मैसेज भेजना ----------
  const sendMessage = async (text, retryIndex = null) => {
    const trimmed = text?.trim();
    if (!trimmed && !image) return;

    // नया मैसेज बनाएँ
    const newMsg = { role: 'user', text: trimmed || '🖼️ Image', image: imagePreview, status: 'sending' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setImage(null);
    setImagePreview(null);

    try {
      const formData = new FormData();
      if (trimmed) formData.append('message', trimmed);
      if (image) formData.append('image', image);
      formData.append('sessionId', sessionId);
      if (weatherInfo) formData.append('weather', weatherInfo);

      const res = await api.post('/ai/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessages(prev => prev.map(m => m === newMsg ? { ...m, status: 'sent' } : m)
        .concat({ role: 'model', text: res.data.reply }));
    } catch (err) {
      setMessages(prev => prev.map(m => m === newMsg ? { ...m, status: 'failed' } : m));
    }
  };

  const handleSend = () => sendMessage(input);
  const handleResend = (index) => sendMessage(messages[index].text, index);

  // Enter कुंजी
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // वॉइस आउटपुट (Text-to-Speech)
  const speakText = (text) => {
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    synth.speak(utterance);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ textAlign: 'center', mb: 2 }}>
        <LocalHospital sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Doctor
      </Typography>

      {/* चैट विंडो */}
      <Paper elevation={3} sx={{ height: 450, overflowY: 'auto', p: 2, mb: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
        {messages.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 8 }}>
            नमस्ते! मैं आपका AI डॉक्टर हूँ। कृपया अपनी समस्या बताएं।
          </Typography>
        )}
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start' }}>
            {msg.role === 'model' && <Avatar sx={{ bgcolor: 'primary.main' }}><LocalHospital /></Avatar>}
            <Paper sx={{ p: 1.5, bgcolor: msg.role === 'user' ? '#e3f2fd' : '#fff', maxWidth: '80%', borderRadius: 2 }}>
              {msg.image && <img src={msg.image} alt="upload" style={{ maxWidth: '100%', borderRadius: 8 }} />}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
              {msg.role === 'model' && (
                <IconButton size="small" onClick={() => speakText(msg.text)}>
                  <VolumeUp fontSize="small" />
                </IconButton>
              )}
            </Paper>
            {msg.role === 'user' && (
              <>
                <Avatar sx={{ bgcolor: 'grey.400' }}><Person /></Avatar>
                {msg.status === 'failed' && (
                  <IconButton size="small" color="error" onClick={() => handleResend(idx)}>
                    <Refresh fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Paper>

      {/* इनपुट बार */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton onClick={isListening ? stopListening : startListening} color={isListening ? 'error' : 'default'}>
          {isListening ? <MicOff /> : <Mic />}
        </IconButton>
        <input type="file" accept="image/*" id="img-upload" hidden onChange={handleImageChange} />
        <label htmlFor="img-upload">
          <IconButton component="span">
            <Image />
          </IconButton>
        </label>
        {imagePreview && <Box component="img" src={imagePreview} sx={{ width: 30, height: 30, borderRadius: 1 }} />}
        <TextField fullWidth placeholder="अपनी समस्या बताएं... (Enter से भेजें)" value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} size="small" />
        <Button variant="contained" endIcon={<Send />} onClick={handleSend} disabled={!input.trim() && !image}>
          भेजें
        </Button>
      </Box>
    </Container>
  );
};

export default AIDoctorChat;
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';

// TypeScript declarations for browser speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceMessage {
  id: string;
  text: string;
  timestamp: Date;
  type: 'user' | 'assistant';
  audioUrl?: string;
}

export default function VoiceAgentPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechMethod, setSpeechMethod] = useState<'browser' | 'sarvam' | 'unknown'>('unknown');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = [
    { code: 'en-IN', name: 'English (India)', browserCode: 'en-IN', fallbackCode: 'en-US' },
    { code: 'hi-IN', name: 'Hindi (India)', browserCode: 'hi-IN', fallbackCode: 'hi' },
    { code: 'bn-IN', name: 'Bengali (India)', browserCode: 'bn-IN', fallbackCode: 'bn' },
    { code: 'ta-IN', name: 'Tamil (India)', browserCode: 'ta-IN', fallbackCode: 'ta' },
    { code: 'te-IN', name: 'Telugu (India)', browserCode: 'te-IN', fallbackCode: 'te' },
    { code: 'mr-IN', name: 'Marathi (India)', browserCode: 'mr-IN', fallbackCode: 'mr' },
    { code: 'gu-IN', name: 'Gujarati (India)', browserCode: 'gu-IN', fallbackCode: 'gu' },
    { code: 'kn-IN', name: 'Kannada (India)', browserCode: 'kn-IN', fallbackCode: 'kn' },
    { code: 'ml-IN', name: 'Malayalam (India)', browserCode: 'ml-IN', fallbackCode: 'ml' },
    { code: 'pa-IN', name: 'Punjabi (India)', browserCode: 'pa-IN', fallbackCode: 'pa' }
  ];

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: VoiceMessage = {
      id: '1',
      text: 'Hello! I am your AI medical voice assistant. I can help you with health questions, appointment scheduling, medicine information, and general medical guidance. You can speak to me in any Indian language. How can I assist you today?',
      timestamp: new Date(),
      type: 'assistant'
    };
    setMessages([welcomeMessage]);

    // Load available voices
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    // Load voices immediately
    loadVoices();

    // Load voices when they become available (some browsers load them asynchronously)
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Try browser's built-in speech recognition first (more reliable)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          setSpeechMethod('browser');
          console.log('Browser speech recognition started');
        };

        recognition.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log('Browser speech recognition result:', transcript);
          
          if (transcript.trim()) {
            const userMessage: VoiceMessage = {
              id: Date.now().toString(),
              text: transcript,
              timestamp: new Date(),
              type: 'user'
            };
            setMessages(prev => [...prev, userMessage]);
            setCurrentText(transcript);
            
            // Generate AI response and convert to speech
            await generateAndSpeakResponse(transcript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Browser speech recognition error:', event.error);
          setIsRecording(false);
          // Fallback to MediaRecorder
          startMediaRecorder();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
        return;
      }

      // Fallback to MediaRecorder
      startMediaRecorder();
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1,
          autoGainControl: true
        } 
      });
      
      // Try different MIME types for better compatibility
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav', 'audio/ogg'];
      let selectedMimeType = '';
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      
      console.log('Using MIME type:', selectedMimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType || undefined,
        audioBitsPerSecond: 128000 // Higher bitrate for better quality
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: selectedMimeType || 'audio/webm' 
        });
        console.log('Final audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type
        });
        
        if (audioBlob.size > 0) {
          await processSpeechToText(audioBlob);
        } else {
          console.error('No audio data captured');
          alert('No audio was captured. Please try again.');
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(500); // Collect data every 500ms for better responsiveness
      setIsRecording(true);
      setSpeechMethod('sarvam');
    } catch (error) {
      console.error('Error starting MediaRecorder:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processSpeechToText = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Determine file extension based on blob type
      let fileExtension = 'webm';
      if (audioBlob.type.includes('wav')) fileExtension = 'wav';
      else if (audioBlob.type.includes('mp4')) fileExtension = 'mp4';
      else if (audioBlob.type.includes('ogg')) fileExtension = 'ogg';
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording.${fileExtension}`);

      console.log('Sending audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        extension: fileExtension
      });

      const response = await fetch('/api/voice/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Speech-to-text result:', result);

      if (result.success) {
        const userMessage: VoiceMessage = {
          id: Date.now().toString(),
          text: result.text,
          timestamp: new Date(),
          type: 'user'
        };
        setMessages(prev => [...prev, userMessage]);
        setCurrentText(result.text);
        
        // Generate AI response and convert to speech
        await generateAndSpeakResponse(result.text);
      } else {
        throw new Error(result.error || 'Speech recognition failed');
      }
    } catch (error) {
      console.error('Speech-to-text error:', error);
      alert(`Failed to process speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateAndSpeakResponse = async (userText: string) => {
    try {
      // Add processing message
      const processingMessage: VoiceMessage = {
        id: (Date.now() + 0.5).toString(),
        text: 'Thinking...',
        timestamp: new Date(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, processingMessage]);

      // Get report data from localStorage if available
      let reportData = '';
      try {
        // Try to get from prescription storage first
        const prescriptions = localStorage.getItem('medscan_prescriptions');
        if (prescriptions) {
          const parsedPrescriptions = JSON.parse(prescriptions);
          if (parsedPrescriptions.length > 0) {
            // Use the most recent prescription
            const latestPrescription = parsedPrescriptions[parsedPrescriptions.length - 1];
            reportData = latestPrescription.reportData || '';
          }
        }
        
        // Fallback to extractedReport if no prescriptions found
        if (!reportData) {
          const storedReport = localStorage.getItem('extractedReport');
          if (storedReport) {
            const parsedReport = JSON.parse(storedReport);
            reportData = parsedReport.text || '';
          }
        }
      } catch (error) {
        console.log('No report data found in localStorage');
      }

      // Call Gemini AI API for intelligent response with vector database
      const response = await fetch('/api/voice/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          language: selectedLanguage,
          reportData: reportData
        }),
      });

      const result = await response.json();
      
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id));
      
      let responseText = '';
      if (result.success && result.response) {
        responseText = result.response;
      } else {
        // Fallback response if Gemini fails
        responseText = 'I understand you said: "' + userText + '". I am your medical voice assistant. How can I help you with your health concerns today?';
      }

      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        timestamp: new Date(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Convert response to speech
      await textToSpeech(responseText);
    } catch (error) {
      console.error('Response generation error:', error);
      
      // Remove processing message if it exists
      setMessages(prev => prev.filter(msg => msg.text !== 'Thinking...'));
      
      // Fallback response
      const fallbackText = 'I apologize, but I encountered an issue processing your request. Please try again or visit the dashboard for more options.';
      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        timestamp: new Date(),
        type: 'assistant'
      };
      setMessages(prev => [...prev, assistantMessage]);
      await textToSpeech(fallbackText);
    }
  };

  // Function to get browser-compatible language code
  const getBrowserLanguageCode = (sarvamCode: string): string => {
    const language = languages.find(lang => lang.code === sarvamCode);
    return language?.browserCode || sarvamCode;
  };

  // Function to get available voices for the selected language
  const getVoiceForLanguage = (langCode: string): SpeechSynthesisVoice | null => {
    if (!('speechSynthesis' in window) || availableVoices.length === 0) return null;
    
    const language = languages.find(lang => lang.code === langCode);
    const browserLangCode = language?.browserCode || langCode;
    const fallbackCode = language?.fallbackCode || langCode.split('-')[0];
    
    // Try to find a voice that matches the language exactly
    let voice = availableVoices.find(v => v.lang === browserLangCode);
    if (voice) return voice;
    
    // Try fallback code
    voice = availableVoices.find(v => v.lang === fallbackCode);
    if (voice) return voice;
    
    // Try to find a voice that starts with the language prefix
    const langPrefix = browserLangCode.split('-')[0];
    voice = availableVoices.find(v => v.lang.startsWith(langPrefix));
    if (voice) return voice;
    
    // Try to find any Indian language voice
    voice = availableVoices.find(v => 
      v.lang.includes('IN') || 
      v.lang.includes('hi') || 
      v.lang.includes('bn') || 
      v.lang.includes('ta') || 
      v.lang.includes('te') || 
      v.lang.includes('mr') || 
      v.lang.includes('gu') || 
      v.lang.includes('kn') || 
      v.lang.includes('ml') || 
      v.lang.includes('pa')
    );
    if (voice) return voice;
    
    // Try to find any voice that contains the language code in name
    voice = availableVoices.find(v => 
      v.name.toLowerCase().includes(langPrefix) ||
      v.name.toLowerCase().includes(langCode.split('-')[0])
    );
    if (voice) return voice;
    return null;
  };

  const textToSpeech = async (text: string) => {
    if (isMuted) return;

    try {
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          target_language_code: selectedLanguage
        }),
      });

      const result = await response.json();
      console.log('TTS API result:', result);

      // Try Sarvam TTS first
      if (result.success && result.audio_base64) {
        try {
          // Convert base64 to audio blob
          const audioData = atob(result.audio_base64);
          const audioArray = new Uint8Array(audioData.length);
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i);
          }
          
          const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Create audio element and play
          const audio = new Audio(audioUrl);
          audio.onplay = () => setIsPlaying(true);
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
          };
          audio.onerror = () => {
            console.error('Audio playback error');
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            // Fallback to browser TTS
            fallbackToBrowserTTS(text);
          };
          
          await audio.play();
          return;
        } catch (audioError) {
          console.error('Audio processing error:', audioError);
          // Fallback to browser TTS
          fallbackToBrowserTTS(text);
        }
      } else {
        // Sarvam TTS failed, use browser TTS
        fallbackToBrowserTTS(text);
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Fallback to browser TTS
      fallbackToBrowserTTS(text);
    }
  };

  const fallbackToBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const language = languages.find(lang => lang.code === selectedLanguage);
      const browserLangCode = language?.browserCode || selectedLanguage;
      const voice = getVoiceForLanguage(selectedLanguage);
      
      // Set language with fallback
      utterance.lang = voice ? voice.lang : browserLangCode;
      if (voice) {
        utterance.voice = voice;
        console.log('Using voice:', voice.name, 'for language:', voice.lang);
      } else {
        console.log('No voice found, using language code:', utterance.lang);
      }
      
      // Force language setting
      utterance.lang = browserLangCode;
      console.log('Final utterance settings:', {
        text: text.substring(0, 50) + '...',
        lang: utterance.lang,
        voice: voice?.name || 'default'
      });
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    // Stop any playing audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Stop speech synthesis
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
  };

  const clearMessages = () => {
    setMessages([{
      id: '1',
      text: 'Hello! I am your medical voice assistant. You can speak to me in any Indian language, and I will help you with medical queries, appointment scheduling, and health information.',
      timestamp: new Date(),
      type: 'assistant'
    }]);
    setCurrentText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Voice Medical Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400">Speak naturally in any Indian language for medical assistance</p>
        </div>

        {/* Language Selection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-black dark:text-white mb-2">Response Language</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 text-black dark:text-white w-full"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-2"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
            
            {/* Voice Information */}
            {availableVoices.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Voice for {languages.find(l => l.code === selectedLanguage)?.name}:
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {(() => {
                    const voice = getVoiceForLanguage(selectedLanguage);
                    if (voice) {
                      return `${voice.name} (${voice.lang})`;
                    } else {
                      return 'Using default browser voice';
                    }
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`h-16 w-16 rounded-full ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-cyan-600 hover:bg-cyan-700'
                } text-white`}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              
              {isPlaying && (
                <Button
                  onClick={stopAudio}
                  variant="outline"
                  className="h-12 w-12 rounded-full"
                >
                  <Pause className="h-6 w-6" />
                </Button>
              )}
            </div>
            
            <div className="text-center mt-4">
              {isRecording && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600">Recording...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-cyan-600">Processing...</span>
                </div>
              )}
              {!isRecording && !isProcessing && (
                <p className="text-sm text-gray-500">Click the microphone to start speaking</p>
              )}
            </div>
            
            {speechMethod !== 'unknown' && (
              <div className="text-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {speechMethod === 'browser' ? 'Browser Speech Recognition' : 'Sarvam AI'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Text Display */}
        {currentText && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">You said:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-black dark:text-white">{currentText}</p>
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {message.type === 'user' ? 'You' : 'Assistant'}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

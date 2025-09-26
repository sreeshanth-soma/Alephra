/* eslint-disable react/no-unescaped-entities */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Pause, Volume2, VolumeX, RotateCcw, BarChart3, LayoutDashboard } from 'lucide-react';
import { VoiceChatInteractive } from '@/components/VoiceChatInteractive';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ui/conversation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

// Message component for conversation UI - matching demo.tsx exactly
type MessageProps = {
  from: 'user' | 'bot';
  children: React.ReactNode;
};

const Message = ({ from, children }: MessageProps) => (
  <div
    className={cn(
      'my-2 flex',
      from === 'user' ? 'justify-end' : 'justify-start'
    )}
  >
    <div
      className={cn(
        'max-w-md lg:max-w-lg rounded-lg p-3',
        from === 'user'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-800'
      )}
    >
      {children}
    </div>
  </div>
);

const MessageContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

export default function VoiceAgentPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');
  const [selectedSpeaker, setSelectedSpeaker] = useState('anushka');
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

  const sarvamSpeakers = [
    { code: 'anushka', name: 'Anushka (Female) - Default', gender: 'female' },
    { code: 'manisha', name: 'Manisha (Female)', gender: 'female' },
    { code: 'vidya', name: 'Vidya (Female)', gender: 'female' },
    { code: 'arya', name: 'Arya (Female)', gender: 'female' },
    { code: 'abhilash', name: 'Abhilash (Male)', gender: 'male' },
    { code: 'karun', name: 'Karun (Male)', gender: 'male' },
    { code: 'hitesh', name: 'Hitesh (Male)', gender: 'male' }
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
      speechSynthesis.onvoiceschanged = () => {
        loadVoices();
        // Debug: Log all available voices
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang, voiceURI: v.voiceURI })));
      };
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const startRecording = async () => {
    console.log('startRecording called');
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
        // Context-preserving fallback if Gemini fails
        const safeUser = userText?.trim().slice(0, 300) || '';
        const hasReport = Boolean(reportData && reportData.trim());
        responseText = `You said: "${safeUser}". I’m having trouble reaching the medical AI right now. ${hasReport ? 'I do have your latest report context saved, and we can still discuss general guidance.' : 'We can still talk through general guidance.'} If you want, re-ask your question or specify symptoms, medicines, or lab values, and I’ll help.`;
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
      
      // Context-preserving fallback response
      const safeUser = (currentText || '').trim().slice(0, 300);
      const hasReport = false; // unknown here; avoid extra reads in catch
      const fallbackText = `You said: "${safeUser}". I’m having trouble reaching the medical AI right now. ${hasReport ? 'I still have your report context, and we can continue.' : 'We can still continue.'} Try again in a moment or share more details (symptoms, meds, labs), and I’ll assist.`;
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
    
    console.log('Looking for voice for language:', langCode, 'browserCode:', browserLangCode);
    
        // Special handling for Telugu - prioritize Telugu voices
        if (langCode === 'te-IN') {
          console.log('Available voices for Telugu selection:', availableVoices.map(v => ({ name: v.name, lang: v.lang })));
          
          // First try exact Telugu matches
          let voice = availableVoices.find(v => 
            v.lang === 'te-IN' || 
            v.lang === 'te' ||
            v.name.toLowerCase().includes('telugu')
          );
          if (voice) {
            console.log('Found Telugu voice:', voice.name, voice.lang);
            return voice;
          }
          
          // Try to find any voice that can handle Telugu text better
          // Look for voices that support multiple Indian languages
          voice = availableVoices.find(v => 
            v.name.toLowerCase().includes('indian') ||
            v.name.toLowerCase().includes('multilingual') ||
            v.name.toLowerCase().includes('hindi') // Hindi voices often work better for Telugu than Tamil
          );
          if (voice) {
            console.log('Using multilingual/Indian voice for Telugu:', voice.name, voice.lang);
            return voice;
          }
          
          // Try other South Indian languages (closer to Telugu)
          voice = availableVoices.find(v => 
            v.lang.includes('ta') || // Tamil
            v.lang.includes('kn') || // Kannada
            v.lang.includes('ml')    // Malayalam
          );
          if (voice) {
            console.log('Using South Indian language voice for Telugu:', voice.name, voice.lang);
            return voice;
          }
          
          // Try Hindi voices first (they often handle Telugu better)
          voice = availableVoices.find(v => 
            v.lang.includes('hi') || 
            v.name.toLowerCase().includes('hindi')
          );
          if (voice) {
            console.log('Using Hindi voice for Telugu (better Telugu support):', voice.name, voice.lang);
            return voice;
          }
          
          // Try other Indian languages but avoid English
          voice = availableVoices.find(v => 
            (v.lang.includes('IN') && !v.lang.includes('en')) || 
            v.lang.includes('bn') || 
            v.lang.includes('mr') || 
            v.lang.includes('gu') || 
            v.lang.includes('pa')
          );
          if (voice) {
            console.log('Using Indian language voice for Telugu:', voice.name, voice.lang);
            return voice;
          }
          
          // Last resort - any non-English voice
          voice = availableVoices.find(v => !v.lang.includes('en'));
          if (voice) {
            console.log('Using non-English voice for Telugu:', voice.name, voice.lang);
            return voice;
          }
          
          console.log('No suitable voice found for Telugu');
          return null;
        }
    
    // For other languages, use the original logic
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
    console.log('textToSpeech called with text:', text.substring(0, 50) + '...');
    console.log('textToSpeech called from:', new Error().stack);
    
    if (isMuted) return;

    try {
      const response = await fetch('/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          target_language_code: selectedLanguage,
          speaker: selectedSpeaker
        }),
      });

      const result = await response.json();
      console.log('TTS API result:', result);
      console.log('Selected language for TTS:', selectedLanguage);
      console.log('Selected speaker for TTS:', selectedSpeaker);

      // Try Sarvam TTS first
      if (result.success && result.audio_base64) {
        console.log('Using Sarvam TTS with audio data length:', result.audio_base64.length);
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
          audioRef.current = audio; // Store reference for stopping
          audio.onplay = () => setIsPlaying(true);
          audio.onended = () => {
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
          };
          audio.onerror = (error) => {
            console.error('Audio playback error:', error);
            console.log('Falling back to browser TTS due to audio error');
            setIsPlaying(false);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            // Fallback to browser TTS
            fallbackToBrowserTTS(text);
          };
          
          await audio.play();
          console.log('Sarvam TTS audio playing successfully');
          return;
        } catch (audioError) {
          console.error('Audio processing error:', audioError);
          // Fallback to browser TTS
          fallbackToBrowserTTS(text);
        }
      } else {
        // Sarvam TTS failed, use browser TTS
        console.log('Sarvam TTS failed, falling back to browser TTS. Result:', result);
        
        // Show user-friendly message for subscription issues
        if (result.error === 'Subscription issue') {
          console.log('Sarvam API subscription issue - using browser TTS with improved voice selection');
        }
        
        fallbackToBrowserTTS(text);
      }
    } catch (error) {
      console.error('Text-to-speech error:', error);
      // Fallback to browser TTS
      fallbackToBrowserTTS(text);
    }
  };

  const fallbackToBrowserTTS = (text: string) => {
    console.log('fallbackToBrowserTTS called with text:', text.substring(0, 50) + '...');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const language = languages.find(lang => lang.code === selectedLanguage);
      const browserLangCode = language?.browserCode || selectedLanguage;
      const voice = getVoiceForLanguage(selectedLanguage);
      
      // Set language with fallback
      utterance.lang = voice ? voice.lang : browserLangCode;
      if (voice) {
        utterance.voice = voice;
        // console.log('Using voice:', voice.name, 'for language:', voice.lang);
      } else {
        console.log('No voice found, using language code:', utterance.lang);
        // For Telugu, try to avoid English voices
        if (selectedLanguage === 'te-IN') {
          utterance.lang = 'te-IN';
          console.log('Forcing Telugu language code for utterance');
        }
      }
      
      // Force language setting
      utterance.lang = browserLangCode;
      console.log('Final utterance settings:', {
        text: text.substring(0, 50) + '...',
        lang: utterance.lang,
        voice: voice?.name || 'default',
        selectedLanguage: selectedLanguage
      });
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    console.log('stopAudio called');
    
    // Stop the current audio element (Sarvam TTS)
    if (audioRef.current) {
      console.log('Stopping current audio element');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    // Stop any other playing audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    // Stop speech synthesis (browser TTS)
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      console.log('Stopping speech synthesis');
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
    <div className="h-screen bg-gray-50 dark:bg-black p-2 overflow-hidden relative pt-20">
      <div className="w-full h-full flex flex-col">
        {/* Header - Enhanced */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-3">Voice Agent</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Speak naturally in any Indian language for medical assistance
          </p>
        </div>

        {/* Language Selection - Compact */}
        <Card className="mb-2 border border-gray-300 dark:border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h3 className="text-xs font-medium text-black dark:text-white mb-1">Response Language</h3>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white w-full focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-medium text-black dark:text-white mb-1">Voice Speaker</h3>
                <select
                  value={selectedSpeaker}
                  onChange={(e) => setSelectedSpeaker(e.target.value)}
                  className="px-2 py-1 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 text-black dark:text-white w-full focus:border-gray-400 dark:focus:border-gray-500 focus:outline-none"
                >
                  {sarvamSpeakers.map((speaker) => (
                    <option key={speaker.code} value={speaker.code}>
                      {speaker.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-7 border border-gray-400 dark:border-gray-600"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearMessages}
                  className="flex items-center gap-1 text-xs px-2 py-1 h-7 border border-gray-400 dark:border-gray-600"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Layout */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left Side - Voice Interface (30%) */}
          <div className="w-[30%] border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <VoiceChatInteractive
              onStart={startRecording}
              onStop={stopRecording}
              onStopAudio={stopAudio}
              onVolumeChange={(volume) => console.log(`Volume: ${volume}%`)}
              demoMode={false}
              isRecording={isRecording}
              isProcessing={isProcessing}
              isPlaying={isPlaying}
              className="h-full"
            />
          </div>

          {/* Right Side - Text Display and Chat (70%) */}
          <div className="w-[70%] flex flex-col gap-2 min-h-0">
            {/* Current Text Display - Compact */}
            {currentText && (
              <Card className="flex-shrink-0 border border-gray-300 dark:border-gray-700">
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-sm">You said:</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm text-black dark:text-white">{currentText}</p>
                </CardContent>
              </Card>
            )}

            {/* Messages - New Conversation UI */}
            <div className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-md min-h-0 bg-gray-100 dark:bg-zinc-900">
              <Conversation className="relative w-full h-full">
                <ConversationContent>
                  {messages.map((message) => (
                    <Message 
                      key={message.id} 
                      from={message.type === 'user' ? 'user' : 'bot'}
                    >
                      <MessageContent>{message.text}</MessageContent>
                    </Message>
                  ))}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

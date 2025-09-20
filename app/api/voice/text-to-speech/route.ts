import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, target_language_code, speaker } = await request.json();
    
    if (!text || text.trim() === '') {
      console.log('Empty text provided, returning error');
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Try multiple API keys for better reliability
    const apiKeys = [
      process.env.SARVAM_API_KEY,
      'sk_vnf56acj_KuD1DN8dhtnk1E5M200PWLoY', // Your new key with 1000 credits
      'sk_ss9et7z4_epcVYu9AyouzQebioHCTIamD' // fallback
    ].filter(Boolean);
    
    const apiKey = apiKeys[0];
    
    console.log('Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');
    console.log('API key length:', apiKey ? apiKey.length : 0);
    
    if (!apiKey) {
      console.error('SARVAM_API_KEY is not set');
      return NextResponse.json({ 
        success: false,
        useBrowserTTS: true,
        message: 'Sarvam API key not configured',
        error: 'API key missing'
      });
    }
    
    // Determine target language code
    let targetLanguageCode = target_language_code;
    if (!targetLanguageCode) {
      // Detect language using Sarvam's detect-language endpoint
      try {
        const detectResp = await fetch("https://api.sarvam.ai/detect-language", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey,
          },
          body: JSON.stringify({ text }),
        });
        
        if (detectResp.ok) {
          const detectJson = await detectResp.json();
          targetLanguageCode = detectJson.language_code || detectJson.language || "en-IN";
        } else {
          targetLanguageCode = "en-IN"; // fallback
        }
      } catch (error) {
        console.error('Language detection error:', error);
        targetLanguageCode = "en-IN"; // fallback
      }
    }

    console.log('Using target language:', targetLanguageCode);
    console.log('Text to convert:', text.substring(0, 100) + '...');
    console.log('Full text length:', text.length);
    console.log('Text is empty?', text.trim() === '');

    // Select appropriate speaker based on language
    const getSpeakerForLanguage = (langCode: string): string => {
      const languageSpeakers: { [key: string]: string[] } = {
        'hi-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Hindi
        'te-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Telugu - anushka is default
        'ta-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Tamil
        'bn-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Bengali
        'gu-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Gujarati
        'kn-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Kannada
        'ml-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Malayalam
        'mr-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Marathi
        'pa-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // Punjabi
        'en-IN': ['anushka', 'manisha', 'vidya', 'arya', 'abhilash', 'karun', 'hitesh'], // English
      };
      
      const speakers = languageSpeakers[langCode] || ['anushka'];
      // Use the first speaker (anushka) as default, but you can randomize or let user choose
      return speakers[0];
    };

    // Force anushka for Telugu to ensure compatibility
    const selectedSpeaker = (targetLanguageCode === 'te-IN') ? 'anushka' : (speaker || getSpeakerForLanguage(targetLanguageCode));
    console.log('Selected speaker:', selectedSpeaker, 'for language:', targetLanguageCode);
    console.log('Speaker parameter from request:', speaker);
    console.log('Computed speaker from language:', getSpeakerForLanguage(targetLanguageCode));
    console.log('Forced anushka for Telugu:', targetLanguageCode === 'te-IN');

    // Map language codes to Sarvam AI supported format
    const sarvamLanguageMap: { [key: string]: string } = {
      'te-IN': 'te-IN', // Telugu
      'hi-IN': 'hi-IN', // Hindi
      'ta-IN': 'ta-IN', // Tamil
      'bn-IN': 'bn-IN', // Bengali
      'gu-IN': 'gu-IN', // Gujarati
      'kn-IN': 'kn-IN', // Kannada
      'ml-IN': 'ml-IN', // Malayalam
      'mr-IN': 'mr-IN', // Marathi
      'pa-IN': 'pa-IN', // Punjabi
      'en-IN': 'en-IN', // English
    };

    // Ensure we use the correct Sarvam language code
    const sarvamLanguageCode = sarvamLanguageMap[targetLanguageCode] || targetLanguageCode;
    console.log('Mapped to Sarvam language code:', sarvamLanguageCode);
    

    // Call Sarvam TTS with proper format matching API documentation
    const requestBody = {
      text: text,
      target_language_code: sarvamLanguageCode,
      speaker: selectedSpeaker,
      pitch: 0, // Default: 0
      pace: 1, // Default: 1 (was 0.9, but API default is 1)
      loudness: 1, // Default: 1
      speech_sample_rate: 22050, // Default: 22050 (was 16000)
      enable_preprocessing: false, // Default: false (was true)
      model: "bulbul:v2"
    };
    
    console.log('Sending request to Sarvam TTS:', {
      url: "https://api.sarvam.ai/text-to-speech",
      body: requestBody,
      apiKey: apiKey.substring(0, 10) + '...',
      apiKeyLength: apiKey.length,
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey.substring(0, 10) + '...'
      }
    });
    
    const ttsResp = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!ttsResp.ok) {
      const err = await ttsResp.text();
      console.error('Sarvam TTS API error:', ttsResp.status, err);
      console.error('Request details:', {
        text: text.substring(0, 50) + '...',
        target_language_code: sarvamLanguageCode,
        speaker: selectedSpeaker,
        model: "bulbul:v2",
        fullRequestBody: requestBody
      });
      
      // Handle specific error cases
      if (ttsResp.status === 403) {
        console.error('Sarvam API subscription issue - falling back to browser TTS');
        return NextResponse.json({ 
          success: false,
          useBrowserTTS: true,
          message: 'Sarvam API subscription expired or invalid - using browser TTS',
          error: 'Subscription issue'
        });
      }
      
      if (ttsResp.status === 400) {
        console.error('Sarvam API bad request - check parameters');
        return NextResponse.json({ 
          success: false,
          useBrowserTTS: true,
          message: 'Sarvam API bad request - using browser TTS',
          error: 'Bad request',
          details: err
        });
      }
      
      throw new Error(`TTS failed: ${ttsResp.status} - ${err}`);
    }

    const ttsJson = await ttsResp.json();
    console.log('Sarvam TTS response:', { 
      hasAudios: !!ttsJson.audios, 
      audiosLength: ttsJson.audios?.length || 0,
      requestId: ttsJson.request_id,
      language: targetLanguageCode 
    });

    // Sarvam returns audios array, take the first one
    const audioBase64 = ttsJson.audios && ttsJson.audios.length > 0 ? ttsJson.audios[0] : null;
    
    if (audioBase64) {
      return NextResponse.json({ 
        success: true,
        audio_base64: audioBase64,
        language: targetLanguageCode,
        message: 'Audio generated successfully'
      });
    } else {
      throw new Error('No audio data received from Sarvam AI');
    }

  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json({ 
      success: false,
      useBrowserTTS: true,
      message: 'Using browser text-to-speech as fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

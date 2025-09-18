import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, target_language_code } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY || 'sk_ss9et7z4_epcVYu9AyouzQebioHCTIamD';
    
    // Determine target language code
    let targetLanguageCode = target_language_code;
    if (!targetLanguageCode) {
      // Detect language using Sarvam's detect-language endpoint
      try {
        const detectResp = await fetch("https://api.sarvam.ai/detect-language", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
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

    // Call Sarvam TTS
    const ttsResp = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: text,
        target_language_code: targetLanguageCode,
        model: "bulbul:v2",
        speaker: "anushka",
      }),
    });

    if (!ttsResp.ok) {
      const err = await ttsResp.text();
      console.error('Sarvam TTS API error:', ttsResp.status, err);
      throw new Error(`TTS failed: ${ttsResp.status} - ${err}`);
    }

    const ttsJson = await ttsResp.json();
    console.log('Sarvam TTS response:', { 
      hasAudio: !!ttsJson.audio, 
      audioLength: ttsJson.audio?.length || 0,
      language: targetLanguageCode 
    });

    // Check if we have audio data
    if (ttsJson.audio) {
      return NextResponse.json({ 
        success: true,
        audio_base64: ttsJson.audio,
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

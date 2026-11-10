import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Cache Audio dalam memori bagi ayat dialog yang kerap dimainkan
const audioCache = new Map<string, { buffer: Buffer; mimeType: string }>();

// Inisialisasi Google GenAI Client secara server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API semakan status perkhidmatan suara (Gemini TTS & Azure Speech)
app.get('/api/tts/status', (_req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasAzureKey = Boolean(process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION);
  res.json({
    hasGeminiTTS: hasGeminiKey,
    hasAzureTTS: hasAzureKey,
    primaryProvider: hasGeminiKey ? 'Google Gemini TTS' : hasAzureKey ? 'Microsoft Azure' : 'Browser Web Speech API',
    defaultVoices: {
      narrator: 'ms-MY-YasminNeural',
      guide: 'ms-MY-OsmanNeural',
      geminiVoice: 'Kore (ms-MY Expressive)',
    },
  });
});

// 1. Laluan Google Gemini TTS (Model gemini-3.8-flash-lite-tts dengan sebutan Bahasa Melayu)
app.post('/api/gemini/tts', async (req, res) => {
  const { text, speaker = 'narrator' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Teks diperlukan.' });
  }

  const cacheKey = `gemini_${speaker}_${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey)!;
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('X-Cache', 'HIT');
    return res.send(cached.buffer);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'MY_GEMINI_API_KEY') {
    return res.status(200).json({
      available: false,
      fallback: true,
      message: 'GEMINI_API_KEY tidak disediakan. Beralih ke sandaran audio pelayar.',
    });
  }

  try {
    const voiceName = speaker === 'guide' || speaker === 'pak_osman' ? 'Fenrir' : 'Kore';
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Sila sebut ayat Bahasa Melayu standard Malaysia berikut dengan nada mesra, jelas dan ramah kanak-kanak sekolah rendah: "${text}"`,
              speechMetadata: {
                style: 'Natural warm Malaysian Malay primary school educational narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      audioCache.set(cacheKey, { buffer: audioBuffer, mimeType: 'audio/wav' });

      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('X-Cache', 'MISS');
      return res.send(audioBuffer);
    }

    return res.status(200).json({
      available: false,
      fallback: true,
      message: 'Respons Gemini audio tidak mengandungi data gelombang.',
    });
  } catch (err: any) {
    return res.status(200).json({
      available: false,
      fallback: true,
      error: err.message || 'Ralat sambungan Gemini TTS.',
    });
  }
});

// 2. Laluan Gabungan /api/tts (Semak Gemini TTS dahulu, kemudian Azure Speech, lalu Web Speech)
app.post('/api/tts', async (req, res) => {
  const { text, voice = 'ms-MY-YasminNeural', pitch = '0Hz', rate = '0%', speaker = 'narrator' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Teks diperlukan.' });
  }

  // Semak cache audio
  const cacheKey = `tts_${voice}_${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey)!;
    res.setHeader('Content-Type', cached.mimeType);
    res.setHeader('X-Cache', 'HIT');
    return res.send(cached.buffer);
  }

  // Percubaan 1: Cuba panggil Azure Speech jika tersedia
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const azureRegion = process.env.AZURE_SPEECH_REGION;

  if (azureKey && azureRegion) {
    try {
      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ms-MY">
        <voice name="${voice}">
          <prosody pitch="${pitch}" rate="${rate}">${text}</prosody>
        </voice>
      </speak>`;

      const response = await fetch(
        `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
        {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': azureKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
            'User-Agent': 'MisiTamanLestari-BM',
          },
          body: ssml,
        }
      );

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        audioCache.set(cacheKey, { buffer, mimeType: 'audio/mpeg' });
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(buffer);
      }
    } catch {
      // Teruskan ke fallback
    }
  }

  // Percubaan 2: Cuba Gemini TTS jika GEMINI_API_KEY tersedia
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const voiceName = speaker === 'guide' || speaker === 'pak_osman' ? 'Fenrir' : 'Kore';
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Sebut dalam Bahasa Melayu Malaysia: "${text}"` }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      });

      const b64 = geminiRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        const buf = Buffer.from(b64, 'base64');
        audioCache.set(cacheKey, { buffer: buf, mimeType: 'audio/wav' });
        res.setHeader('Content-Type', 'audio/wav');
        return res.send(buf);
      }
    } catch {
      // Teruskan ke fallback
    }
  }

  // Percubaan 3: Tiada API key luar -> beri arahan fallback ke Web Speech API
  return res.status(200).json({
    available: false,
    fallback: true,
    message: 'Menggunakan Web Speech API pelayar.',
  });
});

// Tetapan Vite Dev Server atau fail statik produksi
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server Misi Taman Lestari sedia di port ${port}`);
});

import express from 'express';

const router = express.Router();

// Note: express.raw() is applied at middleware level in server/index.ts for /vapi/* routes
// This ensures Vapi streams are not parsed as JSON, preventing "stream is not readable" errors
router.post('/vapi/tts', async (req, res) => {
    try {
        let payload;

        // Parse raw body as JSON (body is already a Buffer from express.raw() middleware)
        if (Buffer.isBuffer(req.body)) {
            try {
                const bodyString = req.body.toString('utf-8');
                if (bodyString.trim().length > 0) {
                    payload = JSON.parse(bodyString);
                } else {
                    payload = {};
                }
            } catch (e) {
                console.warn('[Vapi-TTS] Could not parse raw body as JSON. Received raw bytes:', req.body.length);
                payload = {};
            }
        } else {
            payload = req.body || {};
        }

        // Extract text from Vapi payload
        const text = payload?.message?.text;
        const sessionId = payload?.message?.call?.id || "unknown";

        console.log(`[Vapi-TTS] Request: "${typeof text === 'string' ? text.substring(0, 50) : 'undefined'}..." for session ${sessionId}`);

        if (!text || typeof text !== "string") {
            console.error('[Vapi-TTS] Missing TTS text in payload');
            return res.status(400).send("Missing TTS text");
        }

        const elevenKey = process.env.ELEVENLABS_API_KEY;

        if (!elevenKey) {
            console.error('[Vapi-TTS] Missing ELEVENLABS_API_KEY');
            return res.status(500).send("Server configuration error");
        }

        // CRITICAL: Hardcode female voice ID (Rachel) - NO fallback, NO auto-selection
        // Rachel voice ID: 21m00Tcm4TlvDq8ikWAM (confirmed female voice)
        const voiceId = "21m00Tcm4TlvDq8ikWAM";

        // Request PCM 16-bit, Mono, 16000 Hz from ElevenLabs (required for Vapi WebRTC)
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_16000`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": elevenKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_multilingual_v2", // Use multilingual model for better language support
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Vapi-TTS] ElevenLabs Error: ${response.status} - ${errorText}`);
                return res.status(502).send("TTS Provider Error");
            }

            // Get raw PCM audio bytes from ElevenLabs (PCM 16-bit, Mono, 16000 Hz)
            const audioBuffer = await response.arrayBuffer();
            const pcmBuffer = Buffer.from(audioBuffer);

            // CRITICAL: Ensure frame alignment (PCM 16-bit = 2 bytes per sample)
            // Buffer length must be even to avoid partial frames causing clicks
            const alignedLength = pcmBuffer.length - (pcmBuffer.length % 2);
            const alignedPcm = pcmBuffer.subarray(0, alignedLength);

            console.log(`[Vapi-TTS] Received ${pcmBuffer.length} bytes of PCM from ElevenLabs, aligned to ${alignedLength} bytes`);

            // CRITICAL: Vapi expects RAW PCM, NOT WAV container
            // WAV headers cause frame misalignment and clicking sounds
            res.setHeader('Content-Type', 'audio/pcm');
            res.setHeader('Content-Length', alignedPcm.length.toString());
            res.setHeader('Sample-Rate', '16000');
            res.setHeader('Channels', '1');
            res.setHeader('Bits-Per-Sample', '16');
            
            // Send raw PCM directly (NO WAV header, NO container format)
            res.end(alignedPcm);
            console.log(`[Vapi-TTS] Sent ${alignedPcm.length} bytes of raw PCM to Vapi (16-bit, 16kHz, mono)`);

        } catch (error: any) {
            console.error(`[Vapi-TTS] Error: ${error.message}`);
            if (!res.headersSent) {
                res.status(500).send("Internal Server Error during TTS request");
            }
        }

    } catch (error) {
        console.error('[Vapi-TTS] Endpoint Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Internal Server Error');
        }
    }
});

export default router;

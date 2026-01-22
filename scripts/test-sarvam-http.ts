import 'dotenv/config';
import fs from 'fs';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const URL = "https://api.sarvam.ai/text-to-speech";

if (!SARVAM_API_KEY) {
    console.error("Missing SARVAM_API_KEY");
    process.exit(1);
}

async function testHttp() {
    console.log("Testing HTTP POST to:", URL);

    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": SARVAM_API_KEY || ""
            },
            body: JSON.stringify({
                inputs: ["Hello, can you hear me?"],
                target_language_code: "hi-IN", // Hindi? or maybe 'en-IN' for English with accent?
                speaker: "meera", // Trying a known speaker ID or 'anushka' if valid for HTTP
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 16000,
                enable_preprocessing: true,
                model: "bulbul:v1"
            })
        });

        if (!response.ok) {
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            return;
        }

        console.log("✅ HTTP Success! Status:", response.status);
        const buffer = await response.arrayBuffer();
        console.log(`Received ${buffer.byteLength} bytes`);
        // fs.writeFileSync("test_output.wav", Buffer.from(buffer));
        // console.log("Saved to test_output.wav");

    } catch (e: any) {
        console.error("Fetch Error:", e.message);
    }
}

testHttp();

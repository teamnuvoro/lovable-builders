import WebSocket from 'ws';
import 'dotenv/config';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

if (!SARVAM_API_KEY) {
    console.error("❌ SARVAM_API_KEY is missing from .env");
    process.exit(1);
}

console.log(`🔑 Testing with API Key: ${SARVAM_API_KEY.substring(0, 5)}...`);

const configurations = [
    {
        name: "Legacy URL + Query Param (api-subscription-key)",
        url: `wss://api.sarvam.ai/text-to-speech/ws?api-subscription-key=${SARVAM_API_KEY}`,
        headers: {}
    },
    {
        name: "Legacy URL + Query Param (api_key)",
        url: `wss://api.sarvam.ai/text-to-speech/ws?api_key=${SARVAM_API_KEY}`,
        headers: {}
    },
    {
        name: "V1 URL + Query Param (api_key)",
        url: `wss://api.sarvam.ai/v1/text-to-speech/ws?api_key=${SARVAM_API_KEY}`,
        headers: {}
    },
    {
        name: "Bulbul URL + Query Param (api_key)",
        url: `wss://api.sarvam.ai/v1/bulbul/stream?api_key=${SARVAM_API_KEY}`,
        headers: {}
    }
];

async function testConnection(config: typeof configurations[0]) {
    console.log(`\nTesting: ${config.name}`);
    console.log(`URL: ${config.url}`);

    return new Promise<boolean>((resolve) => {
        const ws = new WebSocket(config.url, { headers: config.headers });

        // Set a timeout to fail fast
        const timeout = setTimeout(() => {
            console.log("❌ Timeout - Connection hung");
            ws.terminate();
            resolve(false);
        }, 5000);

        ws.on('open', () => {
            console.log("✅ WebSocket Connected!");
            // Send a small payload to verify we can really speak
            const configMsg = {
                voice: "anushka",
                format: "mp3",
                sample_rate: 22050
            };
            ws.send(JSON.stringify(configMsg));

            const textMsg = { text: "Hello" };
            ws.send(JSON.stringify(textMsg));
        });

        ws.on('message', (data: any, isBinary: boolean) => {
            if (isBinary) {
                console.log(`✅ Received Audio Chunk (${data.length} bytes)`);
                clearTimeout(timeout);
                ws.close();
                resolve(true);
            } else {
                console.log(`Received text: ${data.toString()}`);
                // Check for error messages
                const str = data.toString();
                if (str.includes("error") || str.includes("Error")) {
                    console.log("❌ Received Service Error");
                    // Don't fail immediately, wait for binary or close
                }
            }
        });

        ws.on('error', (err) => {
            console.log(`❌ WebSocket Error: ${err.message}`);
        });

        ws.on('close', (code, reason) => {
            clearTimeout(timeout);
            console.log(`Closed: ${code} ${reason}`);
            if (code !== 1000 && code !== 1005) {
                resolve(false);
            }
        });
    });
}

(async () => {
    for (const config of configurations) {
        const success = await testConnection(config);
        if (success) {
            console.log(`\n🎉 SUCCESS! Use this configuration: ${config.name}`);
            process.exit(0);
        }
    }
    console.log("\n❌ All configurations failed.");
    process.exit(1);
})();

# 🔧 IMPORTANT: Add AssemblyAI API Key to .env

## Quick Setup

Add this line to your `.env` file:

```bash
ASSEMBLYAI_API_KEY=e9edcc72a41e445585379ad3188b9928
```

## Full .env Template

If you don't have a `.env` file yet, create one with all required keys:

```bash
# Copy .env.example to .env
cp .env.example .env

# Then edit .env and add your keys
```

## After Adding the Key

Restart your development server:

```bash
npm run dev
```

## Test Speech-to-Text

1. Go to the chat page
2. Click the microphone button
3. Allow microphone permissions
4. Speak your message
5. Click mic again to stop
6. Wait for transcription
7. Text appears in input!

## Troubleshooting

### "Service not configured" error
- Make sure `ASSEMBLYAI_API_KEY` is in `.env`
- Restart the server after adding the key

### Microphone not working
- Check browser permissions
- Use HTTPS (required for mic access)
- Try Chrome/Firefox/Safari

### No transcription appearing
- Check server console for errors
- Verify API key is correct
- Ensure `uploads/` directory exists

---

**Need help?** Check `ASSEMBLYAI_SETUP.md` for full documentation.

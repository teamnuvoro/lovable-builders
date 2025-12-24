# Environment Variables for Version 2

## Updated Environment Variables

### Payment System (Razorpay)
```env
# Razorpay Payment Gateway (REQUIRED)
RAZORPAY_KEY_ID=rzp_live_RuEfl0uaD8zzHw
RAZORPAY_KEY_SECRET=UKXIeykIOqAk6atQCmqi6EwS

# Frontend Razorpay Key (for checkout)
VITE_RAZORPAY_KEY_ID=rzp_live_RuEfl0uaD8zzHw
```

### Voice System (Sarvam AI)
```env
# Sarvam AI API Key (REQUIRED)
SARVAM_API_KEY=sk_av2udgsa_X5NpkUJUYPLwoNJmpb9s5AA9
VITE_SARVAM_API_KEY=sk_av2udgsa_X5NpkUJUYPLwoNJmpb9s5AA9

# Optional: Custom Sarvam API base URL (defaults to https://api.sarvam.ai)
# SARVAM_API_BASE_URL=https://api.sarvam.ai
```

### WhatsApp Reminders
```env
# Enable WhatsApp reminder system
ENABLE_REMINDERS=true
```

### Removed/Deprecated Variables
```env
# These are no longer used (kept for reference only)
# CASHFREE_APP_ID=
# CASHFREE_SECRET_KEY=
# CASHFREE_MODE=
# CASHFREE_ENV=
# VAPI_PUBLIC_KEY=
# VAPI_PRIVATE_KEY=
# VITE_VAPI_PUBLIC_KEY=
```

## Migration Notes

1. **Payment**: All Cashfree references have been replaced with Razorpay
2. **Voice**: Vapi has been replaced with Sarvam AI (placeholder implementation - update once API details available)
3. **Reminders**: New WhatsApp reminder system added (requires Twilio credentials)

## Required for Production

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (already provided)
- `SARVAM_API_KEY` (needs to be obtained from Sarvam AI)
- `ENABLE_REMINDERS=true` (to enable WhatsApp reminders)
- Existing Twilio credentials (for WhatsApp sending)

